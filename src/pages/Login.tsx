import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import loginImage from "../assets/login.png";
import logo from "../assets/Logo.png";
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  LockOutlined,
  PersonAddOutlined,
  WorkOutline,
  AccountBalanceWalletOutlined,
  ArrowForward,
  ChevronLeft,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useEffect, useState, useRef } from "react";
import { loginValidationSchema } from "../validation/Index";
import type { LoginFormValues } from "../type/Index";
import ReuseButton from "../components/button";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Register from "./Register";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginApi } from "../services/api/loginApi";
import { verifyLogin2FA } from "../services/api/twoFactorApi";
import { jwtDecode } from "jwt-decode";
import { setCredentials } from "../features/auth/authSlice";
import axios from "axios";
import LostAuthenticatorModal from "../components/LostAuthenticatorModal";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

interface LoginProps {
  initialView?: "login" | "register";
}

const Login = ({ initialView }: LoginProps = {}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(
    initialView ? initialView === "login" : location.pathname !== "/auth/register"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const reCaptchaRef = useRef<any>(null);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [showLostAuthenticatorModal, setShowLostAuthenticatorModal] = useState(false);
  const [isLostAuthenticatorClicked, setIsLostAuthenticatorClicked] = useState(false);
  const [signupRole, setSignupRole] = useState("student");

  const toggleView = () => {
    const next = !isLogin;
    setIsLogin(next);
    window.history.replaceState(null, "", next ? "/auth/login" : "/auth/register");
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
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
      // Resolve relative profile image URL to full URL
      if (userData?.profile_image_url && userData.profile_image_url.startsWith("/")) {
        const baseUrl = (BASE_URL || "https://api.ogera.sybellasystems.co.rw/api").replace("/api", "");
        userData.profile_image_url = `${baseUrl}${userData.profile_image_url}`;
      }
      // Extract role string — could be an object { roleName, roleType } or a string
      const userRole = typeof userData.role === 'object'
        ? (userData.role?.roleType || userData.role?.roleName || userData.role_type)
        : (userData.role || userData.role_type);

      dispatch(
        setCredentials({
          user: userData,
          accessToken,
          role: userRole,
          permissions: userData.permissions || null,
        })
      );
    } catch (error: any) {
      console.error("[LOGIN] Failed to fetch user data, using basic info:", error);
      dispatch(setCredentials({ user, accessToken, role }));
    }
    toast.success(t("login.loggedInSuccess"));
    formik.resetForm();
    if (RECAPTCHA_SITE_KEY && (window as any).grecaptcha && reCaptchaRef.current) {
      (window as any).grecaptcha.reset();
    }
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get("redirect");
    if (redirectTo) {
      // External URLs (back to landing page) need a full-page navigation
      if (/^https?:\/\//i.test(redirectTo)) {
        window.location.href = redirectTo;
        return;
      }
      navigate(redirectTo);
      return;
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
        const errorMessage =
          error?.response?.data?.message || error?.payload?.message || error?.message || "";
        const isNoRecaptchaClientsError =
          typeof errorMessage === "string" &&
          errorMessage.toLowerCase().includes("no recaptcha clients exist");
        if (!(twoFactorRequired && isNoRecaptchaClientsError)) {
          toast.error(errorMessage || t("login.loginFailed"));
        }
        if (RECAPTCHA_SITE_KEY && (window as any).grecaptcha)
          (window as any).grecaptcha.reset();
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
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        t("login.twoFAVerificationFailed");
      const isNoRecaptchaClientsError =
        typeof msg === "string" &&
        msg.toLowerCase().includes("no recaptcha clients exist");
      if (!isNoRecaptchaClientsError) {
        toast.error(msg);
      }
    } finally {
      setVerifying2FA(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      "& fieldset": { borderColor: "#e0d8f0" },
      "&:hover fieldset": { borderColor: "#7F56D9" },
      "&.Mui-focused fieldset": { borderColor: "#7F56D9" },
    },
    "& .MuiInputBase-input": {
      backgroundColor: "transparent",
    },
  };

  const inputStyle = {
    borderRadius: "10px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#2D2252",
  };

  return (
    <AuthContainer>
      {/* Mobile tab toggle */}
      <MobileTabToggle>
        <MobileTab $active={isLogin} onClick={() => { setIsLogin(true); window.history.replaceState(null, "", "/auth/login"); }}>
          Sign In
        </MobileTab>
        <MobileTab $active={!isLogin} onClick={() => { setIsLogin(false); window.history.replaceState(null, "", "/auth/register"); }}>
          Sign Up
        </MobileTab>
      </MobileTabToggle>

      {/* Forms layer — signup left, login right */}
      <FormsWrapper>
        {/* Signup form — left half */}
        <FormPanel className={isLogin ? "inactive" : "active"} style={{ opacity: isLogin ? 0 : 1, pointerEvents: isLogin ? "none" : "auto", transition: "opacity 0.4s ease 0.2s" }}>
          <Register formOnly onRoleChange={setSignupRole} />
        </FormPanel>

        {/* Login form — right half */}
        <FormPanel className={isLogin ? "active" : "inactive"} style={{ opacity: isLogin ? 1 : 0, pointerEvents: isLogin ? "auto" : "none", transition: "opacity 0.4s ease 0.2s" }}>
          <FormInner>
            <BackButton href={import.meta.env.VITE_LANDING_URL || "https://ogera.sybellasystems.co.rw"}>
              <ChevronLeft style={{ fontSize: 20 }} />
              Back
            </BackButton>
            <FormLogo />
            <Heading>{t("login.welcome")}</Heading>
            <SubHeading>{t("login.signInSubtext")}</SubHeading>

            <LoginFormContainer as="form" onSubmit={formik.handleSubmit}>
              <FormGroup>
                <Label htmlFor="email">{t("login.emailAddress")}</Label>
                <TextField id="email" name="email" type="email" placeholder={t("login.enterEmail")} variant="outlined" fullWidth size="small" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  InputProps={{ style: inputStyle, startAdornment: <InputAdornment position="start"><PersonOutline style={{ color: "#8a8599", fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
                {formik.touched.email && formik.errors.email && <ErrorText>{formik.errors.email}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">{t("login.password")}</Label>
                <TextField id="password" name="password" type={showPassword ? "text" : "password"} placeholder={t("login.enterPassword")} variant="outlined" fullWidth size="small" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  InputProps={{ style: inputStyle, startAdornment: <InputAdornment position="start"><LockOutlined style={{ color: "#8a8599", fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={handleClickShowPassword} edge="end">{showPassword ? <VisibilityOff style={{ color: "#8a8599" }} /> : <Visibility style={{ color: "#8a8599" }} />}</IconButton></InputAdornment> }} sx={inputSx} />
                {formik.touched.password && formik.errors.password && <ErrorText>{formik.errors.password}</ErrorText>}
              </FormGroup>

              <RememberForgotRow>
                <ForgotPassword to="/auth/forgot-password">{t("login.forgotPassword")}</ForgotPassword>
              </RememberForgotRow>

              {twoFactorRequired && (
                <FormGroup>
                  <Label htmlFor="twoFactorCode">{t("login.twoFactorCode")}</Label>
                  <TextField id="twoFactorCode" name="twoFactorCode" type="text" inputMode="numeric" placeholder={t("login.enterSixDigitCode")} variant="outlined" fullWidth size="small" value={twoFactorCode} onChange={(e: any) => setTwoFactorCode(e.target.value)} InputProps={{ style: inputStyle }} sx={inputSx} />
                  <LostAuthenticatorLink onClick={() => { setIsLostAuthenticatorClicked(true); setShowLostAuthenticatorModal(true); }} type="button">{t("login.lostAuthenticator")}</LostAuthenticatorLink>
                  <ReuseButton backgroundcolor="#16a34a" type="button" text={verifying2FA ? t("login.verifying") : t("login.verifyAndContinue")} disabled={verifying2FA} onClick={handleVerify2FALogin as any} />
                </FormGroup>
              )}

              {!twoFactorRequired && RECAPTCHA_SITE_KEY && (
                <RecaptchaContainer><div ref={reCaptchaRef} className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY}></div></RecaptchaContainer>
              )}

              {!twoFactorRequired && (
                <SignInButton type="submit" disabled={loading}>{loading ? t("login.pleaseWait") : t("login.signIn")}</SignInButton>
              )}
            </LoginFormContainer>
          </FormInner>
        </FormPanel>
      </FormsWrapper>

      {/* Sliding overlay panel */}
      <SlidingOverlay style={{
        transform: isLogin ? "translateX(0)" : "translateX(100%)",
        borderRadius: isLogin ? "0 20px 20px 0" : "20px 0 0 20px",
      }}>
        <Overlay />
        <OverlayContent>
          <OverlayLogo />
          <OverlayCenterContent>
            {isLogin ? (
              <>
                <IconShowcase>
                  <IconCircle className="main">
                    <PersonAddOutlined style={{ fontSize: 36, color: "#ffffff" }} />
                  </IconCircle>
                  <IconRow>
                    <IconCircle>
                      <WorkOutline style={{ fontSize: 28, color: "#ffffff" }} />
                    </IconCircle>
                    <ArrowForward style={{ fontSize: 24, color: "rgba(255,255,255,0.5)" }} />
                    <IconCircle>
                      <AccountBalanceWalletOutlined style={{ fontSize: 28, color: "#ffffff" }} />
                    </IconCircle>
                  </IconRow>
                </IconShowcase>
                <OverlayHeading>{t("login.empoweringAfrica")}</OverlayHeading>
                <OverlaySubText>{t("login.ogeraDescription")}</OverlaySubText>
                <OverlayPrompt>
                  <span>{t("login.dontHaveAccount")}</span>
                  <OverlayButton onClick={toggleView}>{t("login.signUp")}</OverlayButton>
                </OverlayPrompt>
              </>
            ) : signupRole === "student" ? (
              <>
                <OverlayHeading>Start Your Career Journey</OverlayHeading>
                <OverlaySubText>
                  Join thousands of students already building their careers on Ogera.
                </OverlaySubText>
                <BenefitsList>
                  <BenefitItem><BenefitDot />Access Job Opportunities</BenefitItem>
                  <BenefitItem><BenefitDot />Build Work Experience</BenefitItem>
                  <BenefitItem><BenefitDot />Get Paid via Mobile Money</BenefitItem>
                  <BenefitItem><BenefitDot />Access Skills Development</BenefitItem>
                </BenefitsList>
                <OverlayPrompt>
                  <span>{t("register.alreadyHaveAccount")}</span>
                  <OverlayButton onClick={toggleView}>{t("register.signIn")}</OverlayButton>
                </OverlayPrompt>
              </>
            ) : (
              <>
                <OverlayHeading>Find Top Student Talent</OverlayHeading>
                <OverlaySubText>
                  Connect with verified, skilled students ready to work for your business.
                </OverlaySubText>
                <BenefitsList>
                  <BenefitItem><BenefitDot />Find Verified Student Talent</BenefitItem>
                  <BenefitItem><BenefitDot />Manage Jobs & Applications</BenefitItem>
                  <BenefitItem><BenefitDot />Track Performance & Payments</BenefitItem>
                  <BenefitItem><BenefitDot />Flexible Hiring for Any Budget</BenefitItem>
                </BenefitsList>
                <OverlayPrompt>
                  <span>{t("register.alreadyHaveAccount")}</span>
                  <OverlayButton onClick={toggleView}>{t("register.signIn")}</OverlayButton>
                </OverlayPrompt>
              </>
            )}
          </OverlayCenterContent>
        </OverlayContent>
      </SlidingOverlay>

      <LostAuthenticatorModal
        isOpen={showLostAuthenticatorModal}
        onClose={() => setShowLostAuthenticatorModal(false)}
        userEmail={formik.values.email}
        userPassword={formik.values.password}
      />
    </AuthContainer>
  );
};

export default Login;

/* ==================== Styled Components ==================== */

/* --- Auth Container (knockout-style) --- */

const AuthContainer = styled("div")`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Nunito", Inter, sans-serif;
`;

const MobileTabToggle = styled("div")`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    padding: 4px;
    background: #f0ecfa;
    border-radius: 12px;
    margin: 12px 16px 0;
  }
`;

const MobileTab = styled("button")<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s;
  font-family: inherit;
  background: ${(p) => (p.$active ? "#7f56d9" : "transparent")};
  color: ${(p) => (p.$active ? "#fff" : "#6b6580")};
`;

const FormsWrapper = styled("div")`
  display: flex;
  width: 100%;
  height: 100%;
  @media (max-width: 768px) {
    height: calc(100vh - 60px);
  }
`;

const FormPanel = styled("div")`
  width: 50%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  background: #ffffff;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  @media (max-width: 768px) {
    position: absolute;
    width: 100%;
    top: 60px;
    bottom: 0;
    height: auto;
    &.inactive {
      display: none;
    }
    &.active {
      display: flex;
    }
  }
`;

const FormInner = styled("div")`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 40px;
  margin: auto 0;
  @media (max-width: 768px) {
    padding: 24px 20px;
    max-width: 100%;
  }
  @media (max-width: 480px) {
    padding: 20px 16px;
  }
`;

const BackButton = styled("a")`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #6b6580;
  text-decoration: none;
  margin-bottom: 8px;
  width: fit-content;
  transition: color 0.2s;
  &:hover {
    color: #7f56d9;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const FormLogo = styled("div")`
  background: url(${logo}) no-repeat left center;
  background-size: contain;
  height: 36px;
  width: 110px;
  margin-bottom: 16px;
  @media (max-width: 768px) {
    display: none;
  }
`;

/* --- Sliding Overlay Panel --- */

const SlidingOverlay = styled("div")`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: url(${loginImage}) no-repeat center center;
  background-size: cover;
  z-index: 10;
  overflow: hidden;
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1),
    border-radius 0.6s ease;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Overlay = styled("div")`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(45, 27, 78, 0.4) 0%,
    rgba(26, 16, 37, 0.85) 100%
  );
`;

const OverlayContent = styled("div")`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 40px;
`;

const OverlayLogo = styled("div")`
  background: url(${logo}) no-repeat left center;
  background-size: contain;
  height: 40px;
  width: 120px;
`;

const OverlayCenterContent = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding-bottom: 60px;
`;

const IconShowcase = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  width: 100%;
`;

const IconCircle = styled("div")`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  &.main {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 2px dashed rgba(255, 255, 255, 0.35);
    background: rgba(127, 86, 217, 0.25);
  }
`;

const IconRow = styled("div")`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const OverlayHeading = styled("h2")`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
`;

const OverlaySubText = styled("p")`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  max-width: 380px;
`;

const OverlayPrompt = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  width: 100%;
  & span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const BenefitsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 380px;
  margin-top: 8px;
`;

const BenefitItem = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
`;

const BenefitDot = styled("span")`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
`;

const OverlayButton = styled("button")`
  padding: 10px 40px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #ffffff;
  }
`;

/* --- Form Components --- */

const Heading = styled("h1")`
  font-size: 26px;
  font-weight: 700;
  color: #7f56d9;
  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

const SubHeading = styled("p")`
  font-size: 14px;
  color: #6b6580;
  margin-bottom: 8px;
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const LoginFormContainer = styled("form")`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled("label")`
  font-size: 13px;
  font-weight: 600;
  color: #2d2252;
`;

const RememberForgotRow = styled("div")`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: -8px;
`;

const ForgotPassword = styled(Link)`
  font-size: 12px;
  color: #7f56d9;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
    color: #5b3ba5;
  }
`;

const SignInButton = styled("button")`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7f56d9 0%, #5b3ba5 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(127, 86, 217, 0.3);
  &:hover {
    box-shadow: 0 6px 20px rgba(127, 86, 217, 0.45);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  @media (max-width: 480px) {
    padding: 12px;
    font-size: 15px;
  }
`;

const RecaptchaContainer = styled("div")`
  display: flex;
  justify-content: center;
  margin: 10px 0;
  & .g-recaptcha {
    transform: scale(0.85);
    transform-origin: center;
  }
  @media (max-width: 480px) {
    & .g-recaptcha {
      transform: scale(0.75);
      transform-origin: center;
    }
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 2px;
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
  font-weight: 500;
  &:hover {
    text-decoration: underline;
    color: #5b3ba5;
  }
`;
