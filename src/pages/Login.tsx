import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import logo from "../assets/Logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useEffect, useState, useRef } from "react";
import { loginValidationSchema } from "../validation/Index";
import type { LoginFormValues } from "../type/Index";
import ReuseButton from "../components/button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginApi } from "../services/api/loginApi";
import { verifyLogin2FA } from "../services/api/twoFactorApi";
import { jwtDecode } from "jwt-decode";
import { setCredentials } from "../features/auth/authSlice";
import axios from "axios";
import LostAuthenticatorModal from "../components/LostAuthenticatorModal";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const reCaptchaRef = useRef<any>(null);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [showLostAuthenticatorModal, setShowLostAuthenticatorModal] = useState(false);
  const [isLostAuthenticatorClicked, setIsLostAuthenticatorClicked] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const finishLogin = async (accessToken: string) => {
    const decoded: any = jwtDecode(accessToken);
    const role = decoded.role;
    const user = { id: decoded.user_id };

    const BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const userRes = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      const userData = (userRes.data as any).user;
      dispatch(
        setCredentials({
          user: userData,
          accessToken,
          role: userData.role,
          permissions: userData.permissions || null,
        })
      );
    } catch (error: any) {
      console.error("⚠️ [LOGIN] Failed to fetch user data:", error);
      dispatch(
        setCredentials({
          user,
          accessToken,
          role,
        })
      );
    }
    toast.success(t("login.loggedInSuccess"));
    formik.resetForm();
    if (RECAPTCHA_SITE_KEY && (window as any).grecaptcha && reCaptchaRef.current) {
      (window as any).grecaptcha.reset();
    }
    navigate("/dashboard");
  };

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
      captchaToken: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (RECAPTCHA_SITE_KEY && !twoFactorRequired) {
          if ((window as any).grecaptcha) {
            const token = (window as any).grecaptcha.getResponse();
            if (!token) {
              toast.error(t("login.completeRecaptcha"));
              setLoading(false);
              return;
            }
            values.captchaToken = token;
          }
        }
        const result: any = await dispatch<any>(loginApi(values));
        if (result?.data?.requires2FA) {
          setTwoFactorRequired(true);
          setTwoFactorToken(result.data.twoFactorToken || "");
          if (!isLostAuthenticatorClicked) {
            toast(t("login.enter2FACode"));
          }
          setIsLostAuthenticatorClicked(false);
          return;
        }
        const accessToken = result?.data?.accessToken;
        if (!accessToken) {
          throw new Error("Login failed: access token missing");
        }
        await finishLogin(accessToken);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.payload?.message || error?.message || "";
        const isNoRecaptchaClientsError = typeof errorMessage === "string" && errorMessage.toLowerCase().includes("no recaptcha clients exist");
        if (!(twoFactorRequired && isNoRecaptchaClientsError)) {
          toast.error(errorMessage || t("login.loginFailed"));
        }
        if (RECAPTCHA_SITE_KEY && (window as any).grecaptcha) {
          (window as any).grecaptcha.reset();
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleVerify2FALogin = async () => {
    try {
      if (!twoFactorToken) {
        toast.error(t("login.twoFASessionExpired"));
        setTwoFactorRequired(false);
        return;
      }
      if (!twoFactorCode.trim()) {
        toast.error(t("login.pleaseEnterSixDigit"));
        return;
      }
      setVerifying2FA(true);
      const res = await verifyLogin2FA(twoFactorToken, twoFactorCode.trim());
      const accessToken = res.data.accessToken;
      setTwoFactorRequired(false);
      setTwoFactorToken("");
      setTwoFactorCode("");
      await finishLogin(accessToken);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || t("login.twoFAVerificationFailed");
      const isNoRecaptchaClientsError = typeof msg === "string" && msg.toLowerCase().includes("no recaptcha clients exist");
      if (!isNoRecaptchaClientsError) toast.error(msg);
    } finally {
      setVerifying2FA(false);
    }
  };

  return (
    <>
      <LoginMainContainer>
        <LoginLeftContainer>
          <LeftContent>
            <Logo />
            <WelcomeTextContainer>
              <Heading>{t("login.welcome")}</Heading>
              <SubHeading>{t("login.signInSubtext")}</SubHeading>
            </WelcomeTextContainer>

            <LoginFormContainer as="form" onSubmit={formik.handleSubmit}>
              {/* Email */}
              <FormGroup>
                <Label htmlFor="email">{t("login.emailAddress")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("login.enterEmail")}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <ErrorText>{formik.errors.email}</ErrorText>
                )}
              </FormGroup>

              {/* Password */}
              <FormGroup>
                <Label htmlFor="password">{t("login.password")}</Label>
                <TextField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.enterPassword")}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  InputProps={{
                    style: { borderRadius: "8px", fontSize: "14px" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {formik.touched.password && formik.errors.password && (
                  <ErrorText>{formik.errors.password}</ErrorText>
                )}
              </FormGroup>

              <ForgotPassword href="/auth/forgot-password">
                {t("login.forgotPassword")}
              </ForgotPassword>

              {/* 2FA Step (only when required) */}
              {twoFactorRequired && (
                <FormGroup>
                  <Label htmlFor="twoFactorCode">{t("login.twoFactorCode")}</Label>
                  <Input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    placeholder={t("login.enterSixDigitCode")}
                    className="mb-3"
                    value={twoFactorCode}
                    onChange={(e: any) => setTwoFactorCode(e.target.value)}
                  />
                  <LostAuthenticatorLink
                    onClick={() => {
                      setIsLostAuthenticatorClicked(true);
                      setShowLostAuthenticatorModal(true);
                    }}
                  >
                    {t("login.lostAuthenticator")}
                  </LostAuthenticatorLink>
                  <ReuseButton
                    backgroundcolor="#16a34a"
                    type="button"
                    text={verifying2FA ? t("login.verifying") : t("login.verifyAndContinue")}
                    disabled={verifying2FA}
                    onClick={handleVerify2FALogin as any}
                  />
                </FormGroup>
              )}

              {!twoFactorRequired && RECAPTCHA_SITE_KEY && (
                <RecaptchaContainer>
                  <div
                    ref={reCaptchaRef}
                    className="g-recaptcha"
                    data-sitekey={RECAPTCHA_SITE_KEY}
                  ></div>
                </RecaptchaContainer>
              )}

              {!twoFactorRequired && (
                <>
                  <ReuseButton
                    backgroundcolor="#7f56d9"
                    type="submit"
                    text={loading ? t("login.pleaseWait") : t("login.signIn")}
                    disabled={loading}
                  />
                  <SignUpText>
                    {t("login.dontHaveAccount")}{" "}
                    <a href="/auth/register">{t("login.signUp")}</a>
                  </SignUpText>
                </>
              )}
            </LoginFormContainer>
          </LeftContent>
        </LoginLeftContainer>
      </LoginMainContainer>
      
      <LostAuthenticatorModal
        isOpen={showLostAuthenticatorModal}
        onClose={() => setShowLostAuthenticatorModal(false)}
        userEmail={formik.values.email}
        userPassword={formik.values.password}
      />
    </>
  );
};

export default Login;

/* Updated styles to match landing page design */

const LoginMainContainer = styled("div")`
  width: 100%;
  min-height: 100vh;
  display: flex;
  font-family: Inter, sans-serif;
  background-color: #0f111a; /* dark background matching landing page */
`;

const LoginLeftContainer = styled("div")`
  width: 100%;
  min-height: 100vh;
  background-color: #1f2233; /* slightly lighter dark for card background */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const LeftContent = styled("div")`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  background-color: #2a2e3b; /* card background color */
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const Logo = styled("div")`
  background: url(${logo}) no-repeat center center;
  background-size: contain;
  height: 40px;
  width: 120px;
  margin: 0 auto 20px auto;
`;

const WelcomeTextContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
`;

const Heading = styled("p")`
  font-size: 26px;
  font-weight: 600;
  color: #ffffff; /* white text for contrast */
`;

const SubHeading = styled("p")`
  font-size: 15px;
  color: #cccccc; /* softer text */
`;

const LoginFormContainer = styled("form")`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled("label")`
  font-size: 13px;
  font-weight: 500;
  color: #cccccc;
`;

const Input = styled("input")`
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #444654;
  font-size: 14px;
  outline: none;
  background-color: #3a3f4f;
  color: #ffffff;
  transition: border-color 0.2s ease, background-color 0.35s ease, color 0.35s ease;
  &:focus {
    border-color: #7f56d9; /* accent color on focus */
    background-color: #4a4f5f;
  }
`;

const ForgotPassword = styled("a")`
  font-size: 12px;
  color: #7f56d9;
  cursor: pointer;
  align-self: flex-end;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const RecaptchaContainer = styled("div")`
  display: flex;
  justify-content: center;
  margin: 10px 0;
`;

const SignUpText = styled("p")`
  font-size: 13px;
  margin: 0 auto;
  margin-top: 10px;
  color: #cccccc;
  & a {
    color: #7f56d9;
    text-decoration: none;
    font-weight: 500;
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const LostAuthenticatorLink = styled("button")`
  font-size: 12px;
  color: #7f56d9;
  cursor: pointer;
  align-self: flex-start;
  margin-bottom: 8px;
  background: none;
  border: none;
  padding: 0;
  &:hover {
    text-decoration: underline;
  }
`;