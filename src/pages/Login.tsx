import { styled } from "@mui/material/styles";
import loginImage from "../assets/login.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useState } from "react";
import { loginValidationSchema } from "../validation/Index";
import type { LoginFormValues } from "../type/Index";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginApi } from "../services/api/loginApi";
import { jwtDecode } from "jwt-decode";
import { setCredentials } from "../features/auth/authSlice";
import axios from "axios";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const result: any = await dispatch<any>(loginApi(values));

        const accessToken = result.data.accessToken;
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
          console.log('🔍 [LOGIN] User data fetched:', {
            role: userData.role,
            permissions: userData.permissions,
          });

          dispatch(
            setCredentials({
              user: userData,
              accessToken,
              role: userData.role,
              permissions: userData.permissions || null,
            })
          );
        } catch (error: any) {
          console.error('⚠️ [LOGIN] Failed to fetch user data, using basic info:', error);
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
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <PageWrapper>
      {/* Left - Form */}
      <LeftPanel>
        <FormWrapper>
          <TopBar>
            <Logo />
            <HomeLink href="https://ogera.sybellasystems.co.rw/">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Home
            </HomeLink>
          </TopBar>

          <div>
            <Heading>Welcome back</Heading>
            <SubHeading>Sign in to continue to your Ogera account</SubHeading>
          </div>

          <Form onSubmit={formik.handleSubmit}>
            <FieldGroup>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <StyledInput
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                $hasError={!!(formik.touched.email && formik.errors.email)}
              />
              {formik.touched.email && formik.errors.email && (
                <ErrorMsg>{formik.errors.email}</ErrorMsg>
              )}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="password">Password</FieldLabel>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: "14px",
                    backgroundColor: "#ffffff",
                    color: "#2d2252",
                    boxShadow: "0 1px 3px rgba(91, 59, 165, 0.08)",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#9B7DE8",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7F56D9",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: formik.touched.password && formik.errors.password ? "#ef4444" : "#ddd0ec",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end" size="small">
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: 20, color: "#7a7290" }} />
                        ) : (
                          <Visibility sx={{ fontSize: 20, color: "#7a7290" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {formik.touched.password && formik.errors.password && (
                <ErrorMsg>{formik.errors.password}</ErrorMsg>
              )}
            </FieldGroup>

            <ForgotLink href="/auth/forgot-password">Forgot password?</ForgotLink>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </SubmitButton>

            <BottomLink>
              Don't have an account? <a href="/auth/register">Create one</a>
            </BottomLink>
          </Form>
        </FormWrapper>
      </LeftPanel>

      {/* Right - Visual */}
      <RightPanel>
        <RightOverlay />
        <RightInner>
          <RightLogo />
          <RightCard>
            <h2>Empowering Africa's Students</h2>
            <p>
              Ogera connects ambitious students with flexible job opportunities
              and instant mobile money payments.
            </p>
          </RightCard>
          <RightFooter>Trusted by students across Africa</RightFooter>
        </RightInner>
      </RightPanel>
    </PageWrapper>
  );
};

export default Login;

/* ——— Styled Components ——— */

const PageWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: "100vw",
  minHeight: "100vh",
  display: "flex",
  fontFamily: "'Nunito', sans-serif",
  overflow: "hidden",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const LeftPanel = styled("div")(({ theme }) => ({
  width: "50%",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #e4daf5 0%, #ede7f8 50%, #f5f0fc 100%)",
  padding: "40px",
  [theme.breakpoints.down("md")]: {
    width: "100%",
    minHeight: "100vh",
    padding: "24px",
  },
}));

const TopBar = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

const FormWrapper = styled("div")({
  width: "100%",
  maxWidth: "400px",
  display: "flex",
  flexDirection: "column",
  gap: "28px",
});

const Logo = styled("div")`
  background: linear-gradient(135deg, #7F56D9 0%, #6941C6 100%);
  height: 42px;
  width: 130px;
  border-radius: 10px;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: url("/ogera_logo-removebg-preview.png") no-repeat center center;
    background-size: 80%;
  }
`;

const Heading = styled("h1")({
  fontSize: "28px",
  fontWeight: 800,
  color: "#2d2252",
  fontFamily: "'Nunito', sans-serif",
  marginBottom: "6px",
  lineHeight: 1.2,
});

const SubHeading = styled("p")({
  fontSize: "15px",
  color: "#6b6580",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 400,
  lineHeight: 1.5,
});

const Form = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: "18px",
});

const FieldGroup = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

const FieldLabel = styled("label")({
  fontSize: "13px",
  fontWeight: 600,
  color: "#2d2252",
  fontFamily: "'Nunito', sans-serif",
});

const StyledInput = styled("input")<{ $hasError?: boolean }>(({ $hasError }) => ({
  padding: "11px 14px",
  borderRadius: "10px",
  border: `1.5px solid ${$hasError ? "#ef4444" : "#ddd0ec"}`,
  fontSize: "14px",
  fontFamily: "'Nunito', sans-serif",
  outline: "none",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(91, 59, 165, 0.08)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  color: "#2d2252",
  "&:hover": {
    borderColor: "#9B7DE8",
  },
  "&:focus": {
    borderColor: "#7F56D9",
    borderWidth: "2px",
    boxShadow: "0 0 0 3px rgba(127, 86, 217, 0.12)",
    padding: "10.5px 13.5px",
  },
  "&::placeholder": {
    color: "#7a7290",
  },
}));

const ErrorMsg = styled("span")({
  fontSize: "12px",
  color: "#ef4444",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 500,
});

const ForgotLink = styled("a")({
  fontSize: "13px",
  fontWeight: 600,
  color: "#7F56D9",
  cursor: "pointer",
  alignSelf: "flex-end",
  textDecoration: "none",
  fontFamily: "'Nunito', sans-serif",
  transition: "color 0.2s",
  "&:hover": {
    color: "#6941C6",
    textDecoration: "underline",
  },
});

const SubmitButton = styled("button")({
  width: "100%",
  padding: "12px",
  background: "linear-gradient(135deg, #7F56D9 0%, #6941C6 100%)",
  color: "#ffffff",
  border: "none",
  borderRadius: "50px",
  fontSize: "15px",
  fontWeight: 700,
  fontFamily: "'Nunito', sans-serif",
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  "&:hover": {
    background: "linear-gradient(135deg, #6941C6 0%, #5B3BA5 100%)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 15px rgba(127, 86, 217, 0.4)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&:disabled": {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
});

const Spinner = styled("span")({
  width: "18px",
  height: "18px",
  border: "2.5px solid rgba(255,255,255,0.3)",
  borderTopColor: "#ffffff",
  borderRadius: "50%",
  animation: "spin 0.6s linear infinite",
  "@keyframes spin": {
    to: { transform: "rotate(360deg)" },
  },
});

const BottomLink = styled("p")({
  fontSize: "14px",
  textAlign: "center",
  color: "#6b6580",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 400,
  "& a": {
    color: "#7F56D9",
    textDecoration: "none",
    fontWeight: 700,
    "&:hover": {
      color: "#6941C6",
      textDecoration: "underline",
    },
  },
});

const HomeLink = styled("a")({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "'Nunito', sans-serif",
  color: "#ffffff",
  background: "linear-gradient(135deg, #7F56D9 0%, #6941C6 100%)",
  padding: "8px 16px",
  borderRadius: "50px",
  textDecoration: "none",
  transition: "all 0.2s ease",
  width: "fit-content",
  cursor: "pointer",
  "&:hover": {
    background: "linear-gradient(135deg, #6941C6 0%, #5B3BA5 100%)",
    transform: "translateX(-2px)",
    boxShadow: "0 2px 10px rgba(127, 86, 217, 0.3)",
  },
});

const RightPanel = styled("div")(({ theme }) => ({
  width: "50%",
  minHeight: "100vh",
  position: "relative",
  background: `url(${loginImage}) no-repeat center center`,
  backgroundSize: "cover",
  borderTopLeftRadius: "30px",
  borderBottomLeftRadius: "30px",
  overflow: "hidden",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const RightOverlay = styled("div")({
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg, rgba(91, 59, 165, 0.88) 0%, rgba(91, 59, 165, 0.78) 50%, rgba(127, 86, 217, 0.7) 100%)",
});

const RightInner = styled("div")({
  position: "relative",
  color: "#ffffff",
  padding: "60px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  gap: "30px",
});

const RightLogo = styled("div")({
  width: "160px",
  height: "50px",
  background: "url('/ogera_logo-removebg-preview.png') no-repeat center center",
  backgroundSize: "contain",
  opacity: 0.9,
});

const RightCard = styled("div")({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  padding: "30px",
  borderRadius: "16px",
  maxWidth: "420px",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  "& h2": {
    fontSize: "28px",
    fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
    marginBottom: "12px",
    lineHeight: 1.3,
  },
  "& p": {
    fontSize: "15px",
    fontFamily: "'Nunito', sans-serif",
    lineHeight: 1.6,
    opacity: 0.9,
    fontWeight: 400,
  },
});

const RightFooter = styled("p")({
  fontSize: "14px",
  fontFamily: "'Nunito', sans-serif",
  opacity: 0.7,
  fontWeight: 500,
});
