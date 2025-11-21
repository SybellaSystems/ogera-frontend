import { styled } from "@mui/material/styles";
import loginImage from "../assets/login.png";
import logo from "../assets/Logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useState } from "react";
import { loginValidationSchema } from "../validation/Index";
import type { LoginFormValues } from "../type/Index";
import ReuseButton from "../components/button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginApi } from "../services/api/loginApi";
import { jwtDecode } from "jwt-decode";
import { setCredentials } from "../features/auth/authSlice";

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

        dispatch(
          setCredentials({
            user,
            accessToken,
            role,
          })
        );

        toast.success("You’re logged in!");
        formik.resetForm();

        if (role === "admin") navigate("/dashboard");
        else if (role === "student") navigate("/dashboard");
        else if (role === "employer") navigate("/dashboard");
        else navigate("/unauthorized");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    },
  });

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

              <ReuseButton
                backgroundcolor="#7f56d9"
                type="submit"
                text={loading ? "Please Wait ..." : "Sign In"}
                disabled={loading}
              />

              <SignUpText>
                Don’t have an account? <a href="/auth/register">Sign Up</a>
              </SignUpText>
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
    </>
  );
};

export default Login;

/* ---------------- Your ORIGINAL styles remain unchanged below ---------------- */

const LoginMainContainer = styled("div")(({ theme }) => ({
  width: "100vw",
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

const LeftContent = styled("div")(({ theme }) => ({
  width: "70%",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
}));

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


