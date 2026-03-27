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
      dispatch(setCredentials({ user, accessToken, role }));
     // User-friendly fallback message
  toast.error(
    t("login.partialSuccess") || "Login successful, but we couldn't load your full profile. Please refresh."
  );

  // Safe fallback authentication state
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
    initialValues: { email: "", password: "", captchaToken: "" },
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
          if (!isLostAuthenticatorClicked) toast(t("login.enter2FACode"));
          setIsLostAuthenticatorClicked(false);
          return;
        }

        const accessToken = result?.data?.accessToken;
        if (!accessToken) throw new Error("Login failed: access token missing");
        await finishLogin(accessToken);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.payload?.message || error?.message || "";
        const isNoRecaptchaClientsError = typeof errorMessage === "string" && errorMessage.toLowerCase().includes("no recaptcha clients exist");
        if (!(twoFactorRequired && isNoRecaptchaClientsError)) {
          toast.error(errorMessage || t("login.loginFailed"));
        }
        if (RECAPTCHA_SITE_KEY && (window as any).grecaptcha) (window as any).grecaptcha.reset();
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
      await finishLogin(res.data.accessToken);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || t("login.twoFAVerificationFailed");
      toast.error(msg);
    } finally {
      setVerifying2FA(false);
    }
  };

  return (
    <>
      <LoginMainContainer>
        <GlassCard as="form" onSubmit={formik.handleSubmit}>
          <Logo />
          <WelcomeTextContainer>
            <Heading>{t("login.welcome")}</Heading>
            <SubHeading>{t("login.signInSubtext")}</SubHeading>
          </WelcomeTextContainer>

          <LoginFormContainer>
            <FormGroup>
              <Label htmlFor="email">{t("login.emailAddress")}</Label>
              <StyledInput
                id="email"
                name="email"
                type="email"
                placeholder={t("login.enterEmail")}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && <ErrorText>{formik.errors.email}</ErrorText>}
            </FormGroup>

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
                  style: { borderRadius: "8px", fontSize: "14px", backgroundColor: "rgba(255,255,255,0.9)" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {formik.touched.password && formik.errors.password && <ErrorText>{formik.errors.password}</ErrorText>}
            </FormGroup>

            <ForgotPassword href="/auth/forgot-password">{t("login.forgotPassword")}</ForgotPassword>

            {twoFactorRequired && (
              <FormGroup>
                <Label htmlFor="twoFactorCode">{t("login.twoFactorCode")}</Label>
                <StyledInput
                  id="twoFactorCode"
                  name="twoFactorCode"
                  type="text"
                  placeholder={t("login.enterSixDigitCode")}
                  value={twoFactorCode}
                  onChange={(e: any) => setTwoFactorCode(e.target.value)}
                />
                <LostAuthenticatorLink
                    onClick={() => {
                      setIsLostAuthenticatorClicked(true);
                      setShowLostAuthenticatorModal(true);
                    }}
                    type="button"
                  >
                    {t("login.lostAuthenticator")}
                </LostAuthenticatorLink>
                <ReuseButton
                  backgroundcolor="#16a34a"
                  type="button"
                  text={verifying2FA ? t("login.verifying") : t("login.verifyAndContinue")}
                  onClick={handleVerify2FALogin as any}
                />
              </FormGroup>
            )}

            {!twoFactorRequired && RECAPTCHA_SITE_KEY && (
              <RecaptchaContainer>
                <div ref={reCaptchaRef} className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY}></div>
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
                  {t("login.dontHaveAccount")} <a href="/auth/register">{t("login.signUp")}</a>
                </SignUpText>
              </>
            )}
          </LoginFormContainer>
        </GlassCard>
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



const LoginMainContainer = styled("div")`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0c0a18; 0%, #0c0a18 100%);
  font-family: 'Inter', sans-serif;
`;

const GlassCard = styled("form")`
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Logo = styled("div")`
  background: url(${logo}) no-repeat center center;
  background-size: contain;
  height: 50px;
  width: 150px;
  margin: 0 auto;
`;

const WelcomeTextContainer = styled("div")`
  text-align: center;
  color: #ffffff;
`;

const Heading = styled("h1")`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const SubHeading = styled("p")`
  font-size: 14px;
  opacity: 0.8;
  margin: 5px 0 0 0;
`;

const LoginFormContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled("label")`
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
`;

const StyledInput = styled("input")`
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  outline: none;
  &:focus { box-shadow: 0 0 0 2px #7f56d9; }
`;

const ForgotPassword = styled("a")`
  font-size: 12px;
  color: #ffffff;
  text-align: right;
  text-decoration: none;
  opacity: 0.8;
  &:hover { opacity: 1; text-decoration: underline; }
`;

const RecaptchaContainer = styled("div")`
  display: flex;
  justify-content: center;
  transform: scale(0.85);
`;

const SignUpText = styled("p")`
  font-size: 13px;
  color: #ffffff;
  text-align: center;
  margin-top: 10px;
  & a { color: #ffffff; font-weight: 700; text-decoration: underline; }
`;

const ErrorText = styled("div")`
  font-size: 11px;
  color: #ff8a8a;
  margin-top: 2px;
`;

const LostAuthenticatorLink = styled("button")`
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  align-self: flex-start;
  margin-bottom: 8px;
  background: none;
  border: none;
  padding: 0;
  text-decoration: underline;
  opacity: 0.8;
  &:hover { opacity: 1; }
`;