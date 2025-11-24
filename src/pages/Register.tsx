import { useState } from "react";
import { styled } from "@mui/material/styles";
import logo from "../assets/logoWhite.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { registerValidationSchema } from "../validation/Index";
import type { RegisterFormValues } from "../type/index";
import { useFormik } from "formik";
import Button from "../components/Button";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const initialValues: RegisterFormValues = {
    accountType: "student",
    fullName: "",
    email: "",
    password: "",
    nationalId: "",
    businessId: "",
    phone: "",
    terms: false,
    privacy: false,
  };

  const formik = useFormik<RegisterFormValues>({
    initialValues,
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        if (values.accountType === "student") {
          console.log("Student registered:");
        } else {
          console.log("Employer registered:");
        }
        alert("Registration successful!");
      } catch (error) {
        console.error("Registration error:", error);
      }
    },
  });


  return (
    <RegisterMainContainer>
      {/* Left Section */}
      <RegisterLeftContainer> <Logo /> <LeftTextContainer> <TextContainer> <Heading>Your Success Story Starts Here</Heading> <SubHeading> Connect with trusted employers, earn money instantly via mobile payments, and maintain your academic excellence – all in one platform designed for African students. </SubHeading> </TextContainer> <TestimonialCard> <p> I earned $500 last month while maintaining my 3.8 GPA! Ogera's academic tracking kept me focused. </p> <UserInfo> <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User testimonial" /> <div> <span>Daphne Park</span> <span>Computer Science Student</span> </div> </UserInfo> </TestimonialCard> </LeftTextContainer> </RegisterLeftContainer>
      <RegisterRightContainer>
        <RegisterFormContainer as="form" onSubmit={formik.handleSubmit}>
          <Head>Create your account with us below</Head>
          <SmallText>
            Already have an account? <a href="#">Sign In</a>
          </SmallText>

          {/* Account Type Toggle */}
          <ToggleGroup>
            {(["student", "employer"] as const).map((type) => (
              <ToggleOption key={type}>
                <input
                  type="radio"
                  name="accountType"
                  value={type}
                  checked={formik.values.accountType === type}
                  onChange={formik.handleChange}
                />
                <span>{type === "student" ? "As a Student" : "As an Employer"}</span>
              </ToggleOption>
            ))}
          </ToggleGroup>

          {/* Full Name */}
          <FormGroup>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <ErrorText>{formik.errors.fullName}</ErrorText>
            )}
          </FormGroup>

          {/* Email */}
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
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
              placeholder="Create your password"
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

          {/* Conditional Fields */}
          {formik.values.accountType === "student" ? (
            <FormGroup>
              <Label htmlFor="nationalId">National ID Number</Label>
              <Input
                id="nationalId"
                name="nationalId"
                placeholder="Enter your national ID number"
                value={formik.values.nationalId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.nationalId && formik.errors.nationalId && (
                <ErrorText>{formik.errors.nationalId}</ErrorText>
              )}
            </FormGroup>
          ) : (
            <FormGroup>
              <Label htmlFor="businessId">Business Registration ID</Label>
              <Input
                id="businessId"
                name="businessId"
                placeholder="Enter your business registration ID"
                value={formik.values.businessId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.businessId && formik.errors.businessId && (
                <ErrorText>{formik.errors.businessId}</ErrorText>
              )}
            </FormGroup>
          )}

          {/* Phone */}
          <FormGroup>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phone && formik.errors.phone && (
              <ErrorText>{formik.errors.phone}</ErrorText>
            )}
          </FormGroup>

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
              {formik.touched.terms && formik.errors.terms && <ErrorText>{formik.errors.terms}</ErrorText>}
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
              {formik.touched.privacy && formik.errors.privacy && <ErrorText>{formik.errors.privacy}</ErrorText>}
            </TermsItem>
          </TermsContainer>

          <Button backgroundcolor=" #7f56d9" type="submit" text=" Sign In" disabled={formik.isSubmitting} />

        </RegisterFormContainer>
      </RegisterRightContainer>
    </RegisterMainContainer>
  );
};

export default Register;

/* ----------------- Styled Components ----------------- */

const RegisterMainContainer = styled("div")`
  width: 100vw;
  height: 100vh;
  display: flex;
  @media (max-width: 768px) {
    flex-direction: column; /* stack on mobile */
    height: 100vh; /* still full height */
  }
`;

const RegisterLeftContainer = styled("div")`
  background-color: #7f56d9;
  width: 40%;
  height: 98%;
  margin: 5px;
  border-radius: 20px;
  @media (max-width: 768px) {
    display: none; /* 👈 hide on mobile */
  }
`;

const Logo = styled("div")`
  background: url(${logo}) no-repeat center center;
  background-size: contain;
  height: 40px;
  width: 100px;
  margin: 20px;
`;

const TextContainer = styled("div")`
  margin-top: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`;

const Heading = styled("h1")`
  font-size: 40px;
  font-weight: 700;
  width: 70%;
`;

const SubHeading = styled("p")`
  font-size: 16px;
  color: #ddd;
  width: 75%;
`;

const TestimonialCard = styled("div")`
  background: rgba(32, 15, 163, 0.5);
  margin: 8rem auto 0 auto;
  border-radius: 12px;
  padding: 0.8rem;
  text-align: left;
  max-width: 450px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  p {
    font-size: 0.95rem;
    margin-bottom: 1rem;
    color: #fff;
  }
`;

const UserInfo = styled("div")`
  display: flex;
  align-items: center;
  gap: 6px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  div {
    display: flex;
    flex-direction: column;

    span:first-of-type {
      font-weight: bold;
      font-size: 0.9rem;
    }

    span:last-of-type {
      font-size: 0.8rem;
      color: #ddd;
    }
  }
`;

const LeftTextContainer = styled("div")`
  color: #ffffff;
`;

const RegisterRightContainer = styled("div")`
  width: 60%;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 768px) {
    flex: unset;
    width: 100%;   /* full width on mobile */
    height: 100%;  /* full height on mobile */
    padding: 20px;
  }
`;

const Head = styled("p")`
  font-size: 26px;
  font-weight: 600;
`;

const RegisterFormContainer = styled("form")`
  max-width: 550px;
  width: 100%;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SmallText = styled("p")`
  font-size: 14px;
  margin-bottom: 20px;
  a {
    color: #7f56d9;
    text-decoration: none;
  }
`;

const ToggleGroup = styled("div")`
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
`;

const ToggleOption = styled("label")`
  flex: 1;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  input:checked + span {
    color: #7f56d9;
    font-weight: 600;
  }
  &:has(input:checked) {
    background: #f3ebff;
    border-color: #7f56d9;
  }
`;

const RadioInput = styled("input")`
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #7f56d9;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  &:checked {
    background-color: #ffffffff;
    border-color: #7f56d9;
  }
  &:checked::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
  }
`;

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const Label = styled("label")`
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled("input")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
`;

const SignInButton = styled("button")`
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #7f56d9;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease;

  &:hover {
    background: #6e47c4;
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: red;
  margin-top: 4px;
`;

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
    color: theme.palette.primary.main, 
    textDecoration: "none",
    fontWeight: 500,
    "&:hover": {
      textDecoration: "underline",
      color: theme.palette.primary.dark, 
    },
  },
  "& .required": {
    color: theme.palette.error.main,    
    marginLeft: "4px",
  },
}));
