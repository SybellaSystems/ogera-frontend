import { styled } from "@mui/material/styles";
import loginImage from "../assets/login.png";
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

  // Load reCAPTCHA script only if a valid site key is provided
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      return; // Don't load reCAPTCHA if no key is configured
    }

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

    // Fetch user data including permissions immediately after login
    const BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const userRes = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      const userData = (userRes.data as any).user;

      // Update Redux with complete user data including permissions
      dispatch(
        setCredentials({
          user: userData,
          accessToken,
          role: userData.role,
          permissions: userData.permissions || null,
        })
      );
    } catch (error: any) {
      console.error("⚠️ [LOGIN] Failed to fetch user data, using basic info:", error);
      // Fallback: store basic info without permissions (will be fetched on page load)
      dispatch(
        setCredentials({
          user,
          accessToken,
          role,
        })
      );
    }

    toast.success("You're logged in!");
    formik.resetForm();

    // Reset reCAPTCHA widget after successful login
    if (RECAPTCHA_SITE_KEY && (window as any).grecaptcha && reCaptchaRef.current) {
      (window as any).grecaptcha.reset();
    }

    // Allow navigation for all roles (including custom admin roles)
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

        // Get CAPTCHA token from the checkbox widget (only if reCAPTCHA is enabled)
        if (RECAPTCHA_SITE_KEY && !twoFactorRequired) {
          if ((window as any).grecaptcha) {
            const token = (window as any).grecaptcha.getResponse();
            if (!token) {
              toast.error('Please complete the reCAPTCHA verification');
              setLoading(false);
              return;
            }
            values.captchaToken = token;
          } else {
            console.warn('reCAPTCHA not loaded');
          }
        }

        const result: any = await dispatch<any>(loginApi(values));

        if (result?.data?.requires2FA) {
          setTwoFactorRequired(true);
          setTwoFactorToken(result.data.twoFactorToken || "");
          if (!isLostAuthenticatorClicked) {
            toast("Enter the 6-digit code from Google Authenticator to complete login.");
          }
          setIsLostAuthenticatorClicked(false); // Reset after use
          return;
        }

        const accessToken = result?.data?.accessToken;
        if (!accessToken) {
          throw new Error("Login failed: access token missing");
        }

        await finishLogin(accessToken);
      } catch (error: any) {
        // Log error details for debugging
        console.log("🔍 Login error:", error);
        console.log("🔍 Error response:", error?.response);
        console.log("🔍 Error status:", error?.response?.status);
        console.log("🔍 Error message:", error?.response?.data?.message);
        console.log("🔍 Error payload:", error?.payload);
        console.log("🔍 Error type:", error?.type);
        
        const errorMessage = error?.response?.data?.message || error?.payload?.message || error?.message || "";

        // Suppress reCAPTCHA client error when 2FA step is active
        const isNoRecaptchaClientsError =
          typeof errorMessage === "string" &&
          errorMessage.toLowerCase().includes("no recaptcha clients exist");

        if (!(twoFactorRequired && isNoRecaptchaClientsError)) {
          toast.error(errorMessage || "Login failed");
        }
        // Reset CAPTCHA on error
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
        toast.error("2FA session expired. Please login again.");
        setTwoFactorRequired(false);
        return;
      }
      if (!twoFactorCode.trim()) {
        toast.error("Please enter the 6-digit code");
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
        "2FA verification failed";

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

  return (
    <>
      <LoginMainContainer>
        {/* Left Section */}
        <LoginLeftContainer>
          <LeftContent>
            <Logo />

            <WelcomeTextContainer>
              <Heading>Welcome to Ogera 👋</Heading>
              <SubHeading>
                Sign in to access your Ogera account and continue earning while you learn.
              </SubHeading>
            </WelcomeTextContainer>

            <LoginFormContainer as="form" onSubmit={formik.handleSubmit}>
              {/* Email */}
              <FormGroup>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
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
                <Label htmlFor="password">Password</Label>
                <TextField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

              <ForgotPassword href="/auth/forgot-password">Forgot Password?</ForgotPassword>

              {/* 2FA Step (only when required) */}
              {twoFactorRequired && (
                <FormGroup>
                  <Label htmlFor="twoFactorCode">2FA Code</Label>
                  <Input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    
                  className="mb-3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all"
                    value={twoFactorCode}
                    onChange={(e: any) => setTwoFactorCode(e.target.value)}
                  />
                  <LostAuthenticatorLink
                    onClick={() => {
                      setIsLostAuthenticatorClicked(true);
                      setShowLostAuthenticatorModal(true);
                    }}
                  >
                    Lost Authenticator?
                  </LostAuthenticatorLink>
                  <ReuseButton
                    backgroundcolor="#16a34a"
                    type="button"
                    text={verifying2FA ? "Verifying..." : "Verify & Continue"}
                    disabled={verifying2FA}
                    onClick={handleVerify2FALogin as any}
                  />
                </FormGroup>
              )}

              {/* <ForgotPassword href="/auth/forgot-password">Forgot Password?</ForgotPassword> */}

              {/* reCAPTCHA */}
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
                    text={loading ? "Please Wait ..." : "Sign In"}
                    disabled={loading}
                  />

                  <SignUpText>
                    Don’t have an account? <a href="/auth/register">Sign Up</a>
                  </SignUpText>
                </>
              )}
            </LoginFormContainer>
          </LeftContent>
        </LoginLeftContainer>

        {/* Right Section */}
        <LoginRightContainer>
          <Overlay />
          <RightContent>
            <RightCard>
              <h2>Empowering Africa's Students</h2>
              <p>
                Ogera is Africa’s premier student job platform that connects ambitious
                students with flexible opportunities and instant mobile money payments.
              </p>
            </RightCard>

            <BottomText>
              Ogera is dedicated to solving the challenges students face.
            </BottomText>
          </RightContent>
        </LoginRightContainer>
      </LoginMainContainer>
      
      {/* Lost Authenticator Modal */}
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

/* ---------------- Your ORIGINAL styles remain unchanged below ---------------- */

const LoginMainContainer = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: "100vw",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "row",
  fontFamily: "Inter, sans-serif",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: { flexDirection: "column" },
}));

const LoginLeftContainer = styled("div")(({ theme }) => ({
  width: "50vw",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.down("sm")]: {
    width: "100%", minHeight: "100vh", padding: "20px",
  },
}));

const LeftContent = styled("div")({
  width: "70%",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
});

const Logo = styled("div")`
  background: url(${logo}) no-repeat center center;
  background-size: contain;
  height: 40px;
  width: 120px;
  margin-bottom: 20px;
`;

const WelcomeTextContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Heading = styled("p")(({ theme }) => ({
  fontSize: "26px",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const SubHeading = styled("p")(({ theme }) => ({
  fontSize: "15px",
  color: theme.palette.text.secondary,
}));

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

const Label = styled("label")(({ theme }) => ({
  fontSize: "13px",
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

const Input = styled("input")(({ theme }) => ({
  padding: "12px 15px",
  borderRadius: "8px",
  border: `1px solid ${theme.palette.divider}`,
  fontSize: "14px",
  outline: "none",
  "&:focus": { borderColor: theme.palette.primary.main },
}));

const ForgotPassword = styled("a")(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.primary.main,
  cursor: "pointer",
  alignSelf: "flex-end",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
}));

const RecaptchaContainer = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
  margin: "10px 0",
  "& .g-recaptcha": {
    transform: "scale(0.9)",
    transformOrigin: "0 0",
  },
}));

const SignUpText = styled("p")(({ theme }) => ({
  fontSize: "13px",
  margin: "0 auto",
  marginTop: "10px",
  color: theme.palette.text.secondary,
  "& a": {
    color: theme.palette.primary.main,
    textDecoration: "none",
    fontWeight: 500,
    "&:hover": { textDecoration: "underline" },
  },
}));

const LoginRightContainer = styled("div")(({ theme }) => ({
  width: "50vw",
  minHeight: "100vh",
  position: "relative",
  background: `url(${loginImage}) no-repeat center center`,
  backgroundSize: "cover",
  borderTopLeftRadius: "30px",
  borderBottomLeftRadius: "30px",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: { display: "none" },
}));

const Overlay = styled("div")`
  position: absolute;
  inset: 0;
  background: #7f56d9;
  opacity: 0.5;
`;

const RightContent = styled("div")`
  position: relative;
  color: white;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const RightCard = styled("div")`
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
  max-width: 450px;
  margin: 0 auto;
  h2 {
    font-size: 30px;
    font-weight: 900;
    margin-bottom: 10px;
  }
  p {
    font-size: 14px;
    line-height: 1.5;
  }
`;

const BottomText = styled("p")`
  margin: 0 auto;
  margin-top: 20px;
  font-size: 14px;
  opacity: 0.7;
`;

const ErrorText = styled("div")(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.error.main,
  marginTop: "4px",
}));

const LostAuthenticatorLink = styled("button")(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.primary.main,
  cursor: "pointer",
  alignSelf: "flex-start",
  textDecoration: "none",
  marginBottom: "8px",
  background: "none",
  border: "none",
  padding: 0,
  "&:hover": { textDecoration: "underline" },
}));


