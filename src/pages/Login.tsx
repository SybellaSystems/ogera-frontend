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
import type { LoginFormValues } from "../type/index";
import Button from "../components/Button";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
      terms: false,
      privacy: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {

        console.log("Login Success ✅");
        alert("Login successful!");
      } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed. Please check your credentials.");
      } finally {
        setSubmitting(false);
      }
    },
  });
  return (
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

            <ForgotPassword href="#">Forgot Password?</ForgotPassword>

            {/* Terms & Privacy */}
            <TermsContainer>
              <TermsItem>
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={formik.values.terms}
                  onChange={formik.handleChange}
                />
                <label htmlFor="terms">
                  I agree to the <a href="#">Terms of Service</a>
                </label>
                {formik.touched.terms && formik.errors.terms && (
                  <ErrorText>{formik.errors.terms}</ErrorText>
                )}
              </TermsItem>

              <TermsItem>
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  checked={formik.values.privacy}
                  onChange={formik.handleChange}
                />
                <label htmlFor="privacy">
                  I agree to the <a href="#">Privacy Policy</a>
                </label>
                {formik.touched.privacy && formik.errors.privacy && (
                  <ErrorText>{formik.errors.privacy}</ErrorText>
                )}
              </TermsItem>
            </TermsContainer>

            <Button backgroundcolor=" #7f56d9" type="submit" text=" Sign In" disabled={formik.isSubmitting} />

            <SignUpText>
              Don’t have an account? <a href="/auth/register">Sign Up</a>
            </SignUpText>
          </LoginFormContainer>
        </LeftContent>
      </LoginLeftContainer>

      {/* Right Section (hidden on mobile) */}
      <LoginRightContainer>
        <Overlay />
        <RightContent>
          <RightCard>
            <h2>Empowering Africa's Students</h2>
            <p>
              Ogera is Africa’s premier student job platform that connects
              ambitious students with flexible, trusted part-time opportunities
              while ensuring academic excellence through performance tracking
              and instant mobile money payments.
            </p>
          </RightCard>

          <BottomText>
            Ogera is dedicated to solving the critical challenge facing African
            students
          </BottomText>
        </RightContent>
      </LoginRightContainer>
    </LoginMainContainer>
  );
};

export default Login;

/* ================== Styled Components ================== */

const LoginMainContainer = styled("div")(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "row",
  fontFamily: "Inter, sans-serif",

  [theme.breakpoints.down("sm")]: {
    flexDirection: "column", // stack on small devices
  },
}));

const LoginLeftContainer = styled("div")(({ theme }) => ({
  width: "50vw",
  height: "100vh",
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  [theme.breakpoints.down("sm")]: {
    width: "100%",
    height: "100%",
    padding: "20px",
  },
}));

const LeftContent = styled("div")(({ theme }) => ({
  width: "70%",
  display: "flex",
  flexDirection: "column",
  gap: "30px",

  [theme.breakpoints.down("sm")]: {
    width: "100%",
    gap: "20px",
  },
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

  [theme.breakpoints.down("sm")]: {
    fontSize: "20px",
    textAlign: "center",
  },
}));

const SubHeading = styled("p")(({ theme }) => ({
  fontSize: "15px",
  color: theme.palette.text.secondary,

  [theme.breakpoints.down("sm")]: {
    fontSize: "13px",
    textAlign: "center",
  },
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
  transition: "border-color 0.2s ease",
  "&:focus": {
    borderColor: theme.palette.primary.main,
  },
}));

const ForgotPassword = styled("a")(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.primary.main,
  cursor: "pointer",
  alignSelf: "flex-end",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
}));

const SignInButton = styled("button")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  cursor: "pointer",
  marginTop: "10px",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
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
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

/* ================== Right Section ================== */

const LoginRightContainer = styled("div")(({ theme }) => ({
  width: "50vw",
  height: "100vh",
  position: "relative",
  borderTopLeftRadius: "30px",
  borderBottomLeftRadius: "30px",
  overflow: "hidden",
  background: `url(${loginImage}) no-repeat center center`,
  backgroundSize: "cover",

  [theme.breakpoints.down("sm")]: {
    display: "none", // ✅ Hide on mobile
  },
}));

const Overlay = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme.palette.primary.main,
  opacity: 0.5,
}));

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
  margin-top: 50px;
  padding-top: 10px;
  font-size: 14px;
  opacity: 0.7;
`;

const ErrorText = styled("div")(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.error.main,
  marginTop: "4px",
}));

const TermsContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  margin: "15px 0",
}));

const TermsItem = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  fontSize: "14px",
  color: theme.palette.text.primary,   // ✅ from palette

  "& input": {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },

  "& label": {
    lineHeight: 1.4,
  },

  "& a": {
    color: theme.palette.primary.main,   // ✅ link uses primary color
    textDecoration: "none",
    fontWeight: 500,

    "&:hover": {
      textDecoration: "underline",
      color: theme.palette.primary.dark, // ✅ hover from palette
    },
  },

  "& .required": {
    color: theme.palette.error.main,     // ✅ required * in error color
    marginLeft: "4px",
  },
}));
