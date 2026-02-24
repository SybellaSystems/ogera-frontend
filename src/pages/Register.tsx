import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import loginImage from "../assets/login.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { registerValidationSchema } from "../validation/Index";
import type { RegisterFormValues } from "../type/Index";
import { useFormik } from "formik";
import { useRegisterUserMutation } from "../services/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import TermsModal from "../components/TermsModal";
import PrivacyModal from "../components/PrivacyModal";
import CountryCodeSelector from "../components/CountryCodeSelector";
import { getCountryCodeFromDialCode, getExpectedDigitMessage } from "../utils/mobileValidation";
import FeatureSlider from "../components/Auth/FeatureSlider";
import type { Slide } from "../components/Auth/FeatureSlider";
import {
  UserGroupIcon,
  BoltIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const regIconStyle = { width: 28, height: 28, color: "#ffffff", strokeWidth: 1.5 };

const STUDENT_SLIDES: Slide[] = [
  {
    icon: <UserGroupIcon style={regIconStyle} />,
    title: "Join 10,000+ Students",
    description:
      "Connect with opportunities across Africa and start your professional journey today.",
  },
  {
    icon: <BoltIcon style={regIconStyle} />,
    title: "Quick & Easy Setup",
    description:
      "Create your profile in under 2 minutes and start applying to jobs right away.",
  },
  {
    icon: <LockClosedIcon style={regIconStyle} />,
    title: "Verified & Secure",
    description:
      "Your data is protected with industry-standard security. We take your privacy seriously.",
  },
  {
    icon: <CurrencyDollarIcon style={regIconStyle} />,
    title: "Start Earning Today",
    description:
      "Apply to flexible jobs and get hired within days. Payments straight to your mobile wallet.",
  },
];

const EMPLOYER_SLIDES: Slide[] = [
  {
    icon: <BuildingOfficeIcon style={regIconStyle} />,
    title: "Find Talented Students",
    description:
      "Access a pool of motivated, verified students ready to work on your projects.",
  },
  {
    icon: <BoltIcon style={regIconStyle} />,
    title: "Hire in Minutes",
    description:
      "Post jobs, review applications, and hire the right candidates quickly and efficiently.",
  },
  {
    icon: <UsersIcon style={regIconStyle} />,
    title: "Verified Student Profiles",
    description:
      "Every student is academically verified so you can hire with confidence.",
  },
  {
    icon: <ChartBarIcon style={regIconStyle} />,
    title: "Track & Manage",
    description:
      "Monitor job progress, manage payments, and build lasting working relationships.",
  },
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");

  const navigate = useNavigate();

  const [registerUser, { data, isError, isLoading, isSuccess, error }] =
    useRegisterUserMutation();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const [expectedDigitMessage, setExpectedDigitMessage] = useState<string>("Enter phone number");
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  // Update expected digit message when country changes
  const handleCountryCodeChange = (newDialCode: string) => {
    setCountryCode(newDialCode);
    setHasStartedTyping(false);
    const countryISOCode = getCountryCodeFromDialCode(newDialCode);
    if (countryISOCode) {
      const message = getExpectedDigitMessage(countryISOCode);
      setExpectedDigitMessage(message);
    }
  };

  const defaultCountryISO = getCountryCodeFromDialCode(countryCode) || "";
  const initialValues: RegisterFormValues = {
    accountType: "student",
    full_name: "",
    email: "",
    password: "",
    national_id_number: "",
    businessId: "",
    mobile_number: "",
    countryCode: defaultCountryISO,
    terms: false,
    privacy: false,
  };

  const formik = useFormik<RegisterFormValues>({
    initialValues,
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        const fullPhoneNumber = `${countryCode}${values.mobile_number}`;

        const payload = {
          full_name: values.full_name,
          email: values.email,
          mobile_number: fullPhoneNumber,
          password: values.password,
          role: values.accountType,
          national_id_number:
            values.accountType === "student" ? values.national_id_number : null,
          business_registration_id:
            values.accountType === "employer" ? values.businessId : null,
          terms: values.terms,
          privacy: values.privacy,
        };

        await registerUser(payload).unwrap();
      } catch (err) {
        console.error("Registration error:", err);
      }
    },
  });

  // Keep formik.countryCode in sync with selected dial code (countryCode state)
  useEffect(() => {
    const iso = getCountryCodeFromDialCode(countryCode);
    if (iso) {
      formik.setFieldValue("countryCode", iso);
    }
  }, [countryCode]);

  const { resetForm } = formik;

  // Initialize expected digit message based on default country code
  useEffect(() => {
    const countryISOCode = getCountryCodeFromDialCode(countryCode);
    if (countryISOCode) {
      const message = getExpectedDigitMessage(countryISOCode);
      setExpectedDigitMessage(message);
    }
  }, []);

  useEffect(() => {
    if (isError && error) {
      const err = error as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(err?.data?.message || "Something went wrong");
    }

    if (data && isSuccess) {
      // Capture email before resetForm() clears it
      const registeredEmail = formik.values.email;
      toast.success(
        "Registration successful! Please check your email to verify your account.",
        { duration: 5000 }
      );
      resetForm();
      setTimeout(() => {
        navigate("/auth/verify-email", {
          state: { email: registeredEmail, fromRegistration: true },
        });
      }, 2000);
    }
  }, [isError, error, data, isSuccess, resetForm, navigate]);

  return (
    <PageWrapper>
      {/* Left - Visual */}
      <LeftPanel>
        <LeftOverlay />
        <LeftInner>
          <LeftLogo />
          <FeatureSlider
            key={formik.values.accountType}
            slides={formik.values.accountType === "employer" ? EMPLOYER_SLIDES : STUDENT_SLIDES}
          />
          <LeftFooter>
            {formik.values.accountType === "employer"
              ? "Trusted by employers across Africa"
              : "Trusted by students across Africa"}
          </LeftFooter>
        </LeftInner>
      </LeftPanel>

      {/* Right - Form */}
      <RightPanel>
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
            <Heading>Create your account</Heading>
            <SubHeading>Join Ogera and start your journey today</SubHeading>
          </div>

          <Form onSubmit={formik.handleSubmit}>
            {/* Account Type Toggle */}
            <ToggleGroup>
              {(["student", "employer"] as const).map((type) => (
                <ToggleOption
                  key={type}
                  $isSelected={formik.values.accountType === type}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={type}
                    checked={formik.values.accountType === type}
                    onChange={formik.handleChange}
                  />
                  <span>
                    {type === "student" ? "As a Student" : "As an Employer"}
                  </span>
                </ToggleOption>
              ))}
            </ToggleGroup>

            {/* Full Name */}
            <FieldGroup>
              <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
              <StyledInput
                id="full_name"
                name="full_name"
                maxLength={20}
                placeholder="Enter your full name"
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                $hasError={!!(formik.touched.full_name && formik.errors.full_name)}
              />
              {formik.touched.full_name && formik.errors.full_name && (
                <ErrorMsg>{formik.errors.full_name}</ErrorMsg>
              )}
            </FieldGroup>

            {/* Email */}
            <FieldGroup>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
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

            {/* Password */}
            <FieldGroup>
              <FieldLabel htmlFor="password">Password</FieldLabel>
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

            {/* Conditional Fields */}
            {formik.values.accountType === "student" ? (
              <FieldGroup>
                <FieldLabel htmlFor="national_id_number">National ID Number</FieldLabel>
                <StyledInput
                  id="national_id_number"
                  name="national_id_number"
                  maxLength={15}
                  placeholder="Enter your national ID number"
                  value={formik.values.national_id_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  $hasError={!!(formik.touched.national_id_number && formik.errors.national_id_number)}
                />
                {formik.touched.national_id_number && formik.errors.national_id_number && (
                  <ErrorMsg>{formik.errors.national_id_number}</ErrorMsg>
                )}
              </FieldGroup>
            ) : (
              <FieldGroup>
                <FieldLabel htmlFor="businessId">Business Registration ID</FieldLabel>
                <StyledInput
                  id="businessId"
                  name="businessId"
                  maxLength={15}
                  placeholder="Enter your business registration ID"
                  value={formik.values.businessId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  $hasError={!!(formik.touched.businessId && formik.errors.businessId)}
                />
                {formik.touched.businessId && formik.errors.businessId && (
                  <ErrorMsg>{formik.errors.businessId}</ErrorMsg>
                )}
              </FieldGroup>
            )}

            {/* Mobile Number */}
            <FieldGroup>
              <FieldLabel htmlFor="mobile_number">Mobile Number</FieldLabel>
              <PhoneInputContainer>
                <CountryCodeSelector
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                />
                <PhoneInput
                  id="mobile_number"
                  name="mobile_number"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formik.values.mobile_number}
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    formik.setFieldValue("mobile_number", cleaned);
                    if (cleaned) {
                      setHasStartedTyping(true);
                    }
                  }}
                />
              </PhoneInputContainer>
              {!hasStartedTyping && !formik.errors.mobile_number && (
                <InfoText>{expectedDigitMessage}</InfoText>
              )}
              {formik.touched.mobile_number && formik.errors.mobile_number && (
                <ErrorMsg>{formik.errors.mobile_number}</ErrorMsg>
              )}
            </FieldGroup>

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
                  I agree to the{" "}
                  <ModalLinkText onClick={() => setOpenTerms(true)}>
                    Terms of Service
                  </ModalLinkText>
                </label>
                {formik.touched.terms && formik.errors.terms && (
                  <ErrorMsg>{formik.errors.terms}</ErrorMsg>
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
                  I agree to the{" "}
                  <ModalLinkText onClick={() => setOpenPrivacy(true)}>
                    Privacy Policy
                  </ModalLinkText>
                </label>
                {formik.touched.privacy && formik.errors.privacy && (
                  <ErrorMsg>{formik.errors.privacy}</ErrorMsg>
                )}
              </TermsItem>
            </TermsContainer>

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </SubmitButton>

            <BottomLink>
              Already have an account? <a href="/auth/login">Sign In</a>
            </BottomLink>
          </Form>
        </FormWrapper>
      </RightPanel>

      {/* Modals */}
      <TermsModal open={openTerms} onClose={() => setOpenTerms(false)} />
      <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} />
    </PageWrapper>
  );
};

export default Register;

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
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  background: `url(${loginImage}) no-repeat center center`,
  backgroundSize: "cover",
  borderTopRightRadius: "30px",
  borderBottomRightRadius: "30px",
  overflow: "hidden",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const LeftOverlay = styled("div")({
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg, rgba(91, 59, 165, 0.65) 0%, rgba(107, 70, 193, 0.55) 50%, rgba(127, 86, 217, 0.45) 100%)",
});

const LeftInner = styled("div")({
  position: "relative",
  color: "#ffffff",
  padding: "40px 40px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  gap: "16px",
});

const LeftLogo = styled("div")({
  width: "130px",
  height: "40px",
  background: "url('/ogera_logo-removebg-preview.png') no-repeat center center",
  backgroundSize: "contain",
  opacity: 0.9,
});


const LeftFooter = styled("p")({
  fontSize: "13px",
  fontFamily: "'Nunito', sans-serif",
  opacity: 0.7,
  fontWeight: 500,
});

const RightPanel = styled("div")(({ theme }) => ({
  width: "50%",
  marginLeft: "50%",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #e4daf5 0%, #ede7f8 50%, #f5f0fc 100%)",
  padding: "40px",
  overflowY: "auto",
  [theme.breakpoints.down("md")]: {
    width: "100%",
    marginLeft: 0,
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
  maxWidth: "440px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  paddingTop: "20px",
  paddingBottom: "20px",
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
  gap: "16px",
});

const ToggleGroup = styled("div")({
  display: "flex",
  gap: "10px",
});

const ToggleOption = styled("label")<{ $isSelected: boolean }>(({ $isSelected }) => ({
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  border: `1.5px solid ${$isSelected ? "#7F56D9" : "#ddd0ec"}`,
  backgroundColor: $isSelected ? "#f3ebff" : "#ffffff",
  fontSize: "14px",
  fontWeight: $isSelected ? 600 : 500,
  fontFamily: "'Nunito', sans-serif",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  color: $isSelected ? "#7F56D9" : "#6b6580",
  "&:hover": {
    borderColor: "#9B7DE8",
  },
  "& input": {
    display: "none",
  },
}));

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

const InfoText = styled("div")({
  fontSize: "12px",
  color: "#0066cc",
  marginTop: "4px",
  fontWeight: 500,
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

const PhoneInputContainer = styled("div")({
  display: "flex",
  alignItems: "stretch",
});

const PhoneInput = styled("input")({
  flex: 1,
  padding: "11px 14px",
  borderRadius: "0 10px 10px 0",
  border: "1.5px solid #ddd0ec",
  borderLeft: "none",
  fontSize: "14px",
  fontFamily: "'Nunito', sans-serif",
  outline: "none",
  backgroundColor: "#ffffff",
  color: "#2d2252",
  boxShadow: "0 1px 3px rgba(91, 59, 165, 0.08)",
  transition: "border-color 0.2s ease",
  "&:hover": {
    borderColor: "#9B7DE8",
  },
  "&:focus": {
    borderColor: "#7F56D9",
    borderWidth: "2px",
    borderLeft: "1px solid #7F56D9",
    boxShadow: "0 0 0 3px rgba(127, 86, 217, 0.12)",
  },
  "&::placeholder": {
    color: "#7a7290",
  },
});

const ErrorMsg = styled("span")({
  fontSize: "12px",
  color: "#ef4444",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 500,
});

const TermsContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

const TermsItem = styled("div")({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  fontSize: "13px",
  fontFamily: "'Nunito', sans-serif",
  color: "#6b6580",
  "& input": {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "#7F56D9",
    marginTop: "2px",
  },
  "& label": {
    lineHeight: 1.4,
  },
});

const ModalLinkText = styled("span")({
  color: "#7F56D9",
  fontWeight: 600,
  cursor: "pointer",
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
