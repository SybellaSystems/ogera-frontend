import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled, keyframes } from "@mui/material/styles";
import loginImage from "../assets/login.png";
import logo from "../assets/Logo.png";
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  LockOutlined,
  EmailOutlined,
  BadgeOutlined,
  BusinessOutlined,
  CheckCircle,
  ChevronLeft,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { registerValidationSchema } from "../validation/Index";
import type { RegisterFormValues } from "../type/Index";
import { useFormik } from "formik";
import { useRegisterUserMutation } from "../services/api/authApi";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import TermsModal from "../components/TermsModal";
import PrivacyModal from "../components/PrivacyModal";
import CountryCodeSelector from "../components/CountryCodeSelector";
import {
  getCountryCodeFromDialCode,
  getExpectedDigitMessage,
} from "../utils/mobileValidation";

interface RegisterProps {
  formOnly?: boolean;
  onRoleChange?: (role: string) => void;
}

const Register = ({ formOnly, onRoleChange }: RegisterProps = {}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const navigate = useNavigate();

  const [registerUser, { data, isError, isLoading, isSuccess, error }] =
    useRegisterUserMutation();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const [countryCode, setCountryCode] = useState("+1");
  const [expectedDigitMessage, setExpectedDigitMessage] =
    useState<string>("Enter phone number");
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

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

  useEffect(() => {
    const iso = getCountryCodeFromDialCode(countryCode);
    if (iso) {
      formik.setFieldValue("countryCode", iso);
    }
  }, [countryCode]);

  const { resetForm } = formik;

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
      toast.error(err?.data?.message || t("register.somethingWentWrong"));
    }

    if (data && isSuccess) {
      toast.success(t("register.registrationSuccess"), { duration: 5000 });
      const registeredEmail = formik.values.email;
      localStorage.setItem("pendingVerificationEmail", registeredEmail);
      localStorage.setItem("pendingVerificationEmailVerified", "false");
      localStorage.setItem("pendingVerificationPhoneVerified", "false");
      const phoneNumber = (data as any)?.data?.phoneNumber;
      if (phoneNumber) {
        localStorage.setItem("pendingVerificationPhoneNumber", phoneNumber);
      }
      resetForm();
      setTimeout(() => {
        navigate("/auth/login", {
          state: {
            showVerificationMessage: true,
            showVerifyAccountButton: true,
            email: registeredEmail,
          },
        });
      }, 2000);
    }
  }, [isError, error, data, isSuccess, resetForm, navigate]);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#e0d8f0" },
      "&:hover fieldset": { borderColor: "#7F56D9" },
      "&.Mui-focused fieldset": { borderColor: "#7F56D9" },
    },
  };

  const inputStyle = {
    borderRadius: "10px",
    fontSize: "14px",
    backgroundColor: "#f9f9ff",
    color: "#2D2252",
  };

  const isStudent = formik.values.accountType === "student";

  useEffect(() => {
    onRoleChange?.(formik.values.accountType);
  }, [formik.values.accountType]);

  // Form-only mode: render just the form content for embedding in auth container
  if (formOnly) {
    return (
      <FormOnlyWrapper>
        <LeftFormContent>
          <BackButton to="/">
            <ChevronLeft style={{ fontSize: 20 }} />
            Back
          </BackButton>
          <LeftLogo />
          <Heading>{t("register.createAccount")}</Heading>
          <SubHeading>{t("register.connectTrustedEmployers")}</SubHeading>

          <RegisterFormContainer onSubmit={formik.handleSubmit}>
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
                  <span>
                    {type === "student"
                      ? t("register.asStudent")
                      : t("register.asEmployer")}
                  </span>
                </ToggleOption>
              ))}
            </ToggleGroup>

            <FormGroup>
              <Label htmlFor="full_name">{t("register.fullName")}</Label>
              <TextField id="full_name" name="full_name" placeholder={t("register.enterFullName")} variant="outlined" fullWidth size="small" inputProps={{ maxLength: 20 }} value={formik.values.full_name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                InputProps={{ style: inputStyle, startAdornment: <InputAdornment position="start"><PersonOutline style={{ color: "#8a8599", fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
              {formik.touched.full_name && formik.errors.full_name && <ErrorText>{formik.errors.full_name}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">{t("register.emailAddress")}</Label>
              <TextField id="email" name="email" type="email" placeholder={t("register.enterEmail")} variant="outlined" fullWidth size="small" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                InputProps={{ style: inputStyle, startAdornment: <InputAdornment position="start"><EmailOutlined style={{ color: "#8a8599", fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
              {formik.touched.email && formik.errors.email && <ErrorText>{formik.errors.email}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">{t("register.password")}</Label>
              <TextField id="password" name="password" type={showPassword ? "text" : "password"} placeholder={t("register.createPassword")} variant="outlined" fullWidth size="small" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                InputProps={{ style: inputStyle, startAdornment: <InputAdornment position="start"><LockOutlined style={{ color: "#8a8599", fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={handleClickShowPassword} edge="end" type="button">{showPassword ? <VisibilityOff style={{ color: "#8a8599" }} /> : <Visibility style={{ color: "#8a8599" }} />}</IconButton></InputAdornment> }} sx={inputSx} />
              {formik.touched.password && formik.errors.password && <ErrorText>{formik.errors.password}</ErrorText>}
            </FormGroup>

            {isStudent ? (
              <FormGroup>
                <Label htmlFor="national_id_number">{t("register.nationalIdNumber")}</Label>
                <TextField id="national_id_number" name="national_id_number" placeholder={t("register.enterNationalId")} variant="outlined" fullWidth size="small" inputProps={{ maxLength: 15 }} value={formik.values.national_id_number} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  InputProps={{ style: inputStyle, startAdornment: <InputAdornment position="start"><BadgeOutlined style={{ color: "#8a8599", fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
                {formik.touched.national_id_number && formik.errors.national_id_number && <ErrorText>{formik.errors.national_id_number}</ErrorText>}
              </FormGroup>
            ) : (
              <FormGroup>
                <Label htmlFor="businessId">{t("register.businessRegistrationId")}</Label>
                <TextField id="businessId" name="businessId" placeholder={t("register.enterBusinessId")} variant="outlined" fullWidth size="small" inputProps={{ maxLength: 15 }} value={formik.values.businessId} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  InputProps={{ style: inputStyle, startAdornment: <InputAdornment position="start"><BusinessOutlined style={{ color: "#8a8599", fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
                {formik.touched.businessId && formik.errors.businessId && <ErrorText>{formik.errors.businessId}</ErrorText>}
              </FormGroup>
            )}

            <FormGroup>
              <Label htmlFor="mobile_number">{t("register.mobileNumber")}</Label>
              <PhoneInputContainer>
                <CountryCodeSelector value={countryCode} onChange={handleCountryCodeChange} />
                <PhoneTextField id="mobile_number" name="mobile_number" type="tel" placeholder={t("register.enterMobileNumber")} variant="outlined" fullWidth size="small" value={formik.values.mobile_number} onBlur={formik.handleBlur}
                  onChange={(e) => { const cleaned = e.target.value.replace(/[^0-9]/g, ""); formik.setFieldValue("mobile_number", cleaned); if (cleaned) setHasStartedTyping(true); }}
                  InputProps={{ style: { ...inputStyle, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } }} sx={inputSx} />
              </PhoneInputContainer>
              {!hasStartedTyping && !formik.errors.mobile_number && <InfoText>{expectedDigitMessage}</InfoText>}
              {formik.touched.mobile_number && formik.errors.mobile_number && <ErrorText>{formik.errors.mobile_number}</ErrorText>}
            </FormGroup>

            <TermsItem>
              <input type="checkbox" id="terms" checked={formik.values.terms && formik.values.privacy}
                onChange={(e) => { const checked = e.target.checked; formik.setFieldValue("terms", checked); formik.setFieldValue("privacy", checked); }} />
              <label htmlFor="terms">I agree to the{" "}<ModalLinkText onClick={() => setOpenTerms(true)}>{t("register.termsOfService")}</ModalLinkText>{" & "}<ModalLinkText onClick={() => setOpenPrivacy(true)}>{t("register.privacyPolicy")}</ModalLinkText></label>
            </TermsItem>
            {((formik.touched.terms && formik.errors.terms) || (formik.touched.privacy && formik.errors.privacy)) && <ErrorText>You must agree to the terms and privacy policy</ErrorText>}

            <CreateAccountButton type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("register.createAccountButton")}
            </CreateAccountButton>
          </RegisterFormContainer>
        </LeftFormContent>

        <TermsModal open={openTerms} onClose={() => setOpenTerms(false)} />
        <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} />
      </FormOnlyWrapper>
    );
  }

  return (
    <>
      <RegisterMainContainer>
        {/* Left Section - Form */}
        <RegisterLeftContainer>
          <LeftFormContent>
            <LeftLogo />
            <Heading>{t("register.createAccount")}</Heading>
            <SubHeading>{t("register.connectTrustedEmployers")}</SubHeading>

            <RegisterFormContainer onSubmit={formik.handleSubmit}>
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
                    <span>
                      {type === "student"
                        ? t("register.asStudent")
                        : t("register.asEmployer")}
                    </span>
                  </ToggleOption>
                ))}
              </ToggleGroup>

              {/* Full Name */}
              <FormGroup>
                <Label htmlFor="full_name">{t("register.fullName")}</Label>
                <TextField
                  id="full_name"
                  name="full_name"
                  placeholder={t("register.enterFullName")}
                  variant="outlined"
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 20 }}
                  value={formik.values.full_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  InputProps={{
                    style: inputStyle,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline
                          style={{ color: "#8a8599", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                {formik.touched.full_name && formik.errors.full_name && (
                  <ErrorText>{formik.errors.full_name}</ErrorText>
                )}
              </FormGroup>

              {/* Email */}
              <FormGroup>
                <Label htmlFor="email">{t("register.emailAddress")}</Label>
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("register.enterEmail")}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  InputProps={{
                    style: inputStyle,
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined
                          style={{ color: "#8a8599", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                {formik.touched.email && formik.errors.email && (
                  <ErrorText>{formik.errors.email}</ErrorText>
                )}
              </FormGroup>
              {/* Password */}
              <FormGroup>
                <Label htmlFor="password">{t("register.password")}</Label>
                <TextField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("register.createPassword")}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  InputProps={{
                    style: inputStyle,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined
                          style={{ color: "#8a8599", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                          type="button"
                        >
                          {showPassword ? (
                            <VisibilityOff style={{ color: "#8a8599" }} />
                          ) : (
                            <Visibility style={{ color: "#8a8599" }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                {formik.touched.password && formik.errors.password && (
                  <ErrorText>{formik.errors.password}</ErrorText>
                )}
              </FormGroup>

              {/* Conditional Fields */}
              {isStudent ? (
                <FormGroup>
                  <Label htmlFor="national_id_number">
                    {t("register.nationalIdNumber")}
                  </Label>
                  <TextField
                    id="national_id_number"
                    name="national_id_number"
                    placeholder={t("register.enterNationalId")}
                    variant="outlined"
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 15 }}
                    value={formik.values.national_id_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    InputProps={{
                      style: inputStyle,
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlined
                            style={{ color: "#8a8599", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                  {formik.touched.national_id_number &&
                    formik.errors.national_id_number && (
                      <ErrorText>{formik.errors.national_id_number}</ErrorText>
                    )}
                </FormGroup>
              ) : (
                <FormGroup>
                  <Label htmlFor="businessId">
                    {t("register.businessRegistrationId")}
                  </Label>
                  <TextField
                    id="businessId"
                    name="businessId"
                    placeholder={t("register.enterBusinessId")}
                    variant="outlined"
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 15 }}
                    value={formik.values.businessId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    InputProps={{
                      style: inputStyle,
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessOutlined
                            style={{ color: "#8a8599", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                  {formik.touched.businessId && formik.errors.businessId && (
                    <ErrorText>{formik.errors.businessId}</ErrorText>
                  )}
                </FormGroup>
              )}

              {/* Mobile Number */}
              <FormGroup>
                <Label htmlFor="mobile_number">
                  {t("register.mobileNumber")}
                </Label>
                <PhoneInputContainer>
                  <CountryCodeSelector
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                  />
                  <PhoneTextField
                    id="mobile_number"
                    name="mobile_number"
                    type="tel"
                    placeholder={t("register.enterMobileNumber")}
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={formik.values.mobile_number}
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      formik.setFieldValue("mobile_number", cleaned);
                      if (cleaned) setHasStartedTyping(true);
                    }}
                    InputProps={{
                      style: {
                        ...inputStyle,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      },
                    }}
                    sx={inputSx}
                  />
                </PhoneInputContainer>
                {!hasStartedTyping && !formik.errors.mobile_number && (
                  <InfoText>{expectedDigitMessage}</InfoText>
                )}
                {formik.touched.mobile_number &&
                  formik.errors.mobile_number && (
                    <ErrorText>{formik.errors.mobile_number}</ErrorText>
                  )}
              </FormGroup>

              {/* Terms & Privacy */}
              <TermsItem>
                <input
                  type="checkbox"
                  id="terms"
                  checked={formik.values.terms && formik.values.privacy}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    formik.setFieldValue("terms", checked);
                    formik.setFieldValue("privacy", checked);
                  }}
                />
                <label htmlFor="terms">
                  I agree to the{" "}
                  <ModalLinkText onClick={() => setOpenTerms(true)}>
                    {t("register.termsOfService")}
                  </ModalLinkText>
                  {" & "}
                  <ModalLinkText onClick={() => setOpenPrivacy(true)}>
                    {t("register.privacyPolicy")}
                  </ModalLinkText>
                </label>
              </TermsItem>
              {((formik.touched.terms && formik.errors.terms) ||
                (formik.touched.privacy && formik.errors.privacy)) && (
                <ErrorText>You must agree to the terms and privacy policy</ErrorText>
              )}

              <CreateAccountButton type="submit" disabled={isLoading}>
                {isLoading
                  ? t("common.loading")
                  : t("register.createAccountButton")}
              </CreateAccountButton>

            </RegisterFormContainer>
          </LeftFormContent>
        </RegisterLeftContainer>

        {/* Right Section - Dynamic content based on role */}
        <RegisterRightContainer>
          <Overlay />
          <RightContent>
            <RightHeading>
              {isStudent ? "Start Your Career Journey" : "Find Top Student Talent"}
            </RightHeading>
            <RightSubText>
              {isStudent
                ? "Join thousands of students already building their careers on Ogera."
                : "Connect with verified, skilled students ready to work for your business."}
            </RightSubText>

            <BenefitsSection>
              <BenefitsTitle>Benefits</BenefitsTitle>
              {isStudent ? (
                <>
                  <BenefitItem>
                    <CheckCircle style={{ fontSize: 20, color: "#22c55e" }} />
                    <span>Access Job Opportunities</span>
                  </BenefitItem>
                  <BenefitItem>
                    <CheckCircle style={{ fontSize: 20, color: "#22c55e" }} />
                    <span>Build Work Experience</span>
                  </BenefitItem>
                  <BenefitItem>
                    <CheckCircle style={{ fontSize: 20, color: "#22c55e" }} />
                    <span>Get Paid via Mobile Money</span>
                  </BenefitItem>
                  <BenefitItem>
                    <CheckCircle style={{ fontSize: 20, color: "#22c55e" }} />
                    <span>Access Skills Development</span>
                  </BenefitItem>
                </>
              ) : (
                <>
                  <BenefitItem>
                    <CheckCircle style={{ fontSize: 20, color: "#22c55e" }} />
                    <span>Find Verified Student Talent</span>
                  </BenefitItem>
                  <BenefitItem>
                    <CheckCircle style={{ fontSize: 20, color: "#22c55e" }} />
                    <span>Manage Jobs & Applications</span>
                  </BenefitItem>
                  <BenefitItem>
                    <CheckCircle style={{ fontSize: 20, color: "#22c55e" }} />
                    <span>Track Performance & Payments</span>
                  </BenefitItem>
                  <BenefitItem>
                    <CheckCircle style={{ fontSize: 20, color: "#22c55e" }} />
                    <span>Flexible Hiring for Any Budget</span>
                  </BenefitItem>
                </>
              )}
            </BenefitsSection>

            <SignInPrompt>
              <span>{t("register.alreadyHaveAccount")}</span>
              <SignInButton to="/auth/login">
                {t("register.signIn")}
              </SignInButton>
            </SignInPrompt>
          </RightContent>
        </RegisterRightContainer>
      </RegisterMainContainer>

      <TermsModal open={openTerms} onClose={() => setOpenTerms(false)} />
      <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} />
    </>
  );
};

export default Register;

/* ==================== Styled Components ==================== */


const BackButton = styled(Link)`
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
`;

const FormOnlyWrapper = styled("div")`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #ffffff;
  padding: 40px 20px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const RegisterMainContainer = styled("div")`
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  font-family: "Nunito", Inter, sans-serif;
  overflow: hidden;
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
`;

/* --- Left Panel (White form area) --- */

const RegisterLeftContainer = styled("div")`
  width: 50%;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    min-height: 100vh;
    padding: 24px 16px;
  }
  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`;

const LeftFormContent = styled("div")`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 0;
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 16px 0;
  }
`;

const LeftLogo = styled("div")`
  background: url(${logo}) no-repeat left center;
  background-size: contain;
  height: 36px;
  width: 110px;
  margin-bottom: 12px;
  @media (max-width: 768px) {
    display: block;
  }
`;

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

/* --- Right Panel (Dark purple with image + dynamic content) --- */

const RegisterRightContainer = styled("div")`
  width: 50%;
  height: 100vh;
  position: relative;
  background: url(${loginImage}) no-repeat center center;
  background-size: cover;
  border-radius: 20px 0 0 20px;
  overflow: hidden;
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

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const RightContent = styled("div")`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 50px;
  gap: 24px;
  animation: ${slideUp} 1s ease-out;
`;

const RightHeading = styled("h2")`
  font-size: 30px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
`;

const RightSubText = styled("p")`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  max-width: 400px;
`;

const BenefitsSection = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 420px;
  margin-top: 8px;
`;

const BenefitsTitle = styled("h3")`
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
`;

const BenefitItem = styled("div")`
  display: flex;
  align-items: center;
  gap: 12px;
  & span {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }
`;

/* --- Form Components --- */

const RegisterFormContainer = styled("form")`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ToggleGroup = styled("div")`
  display: flex;
  gap: 10px;
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const ToggleOption = styled("label")`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e0d8f0;
  background: #f9f9ff;
  color: #2d2252;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  input:checked + span {
    color: #7f56d9;
    font-weight: 600;
  }

  &:has(input:checked) {
    background: #f5f3ff;
    border-color: #7f56d9;
  }

  @media (max-width: 480px) {
    padding: 10px 8px;
    font-size: 13px;
    gap: 6px;
  }
`;

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled("label")`
  font-size: 13px;
  font-weight: 600;
  color: #2d2252;
`;

const PhoneInputContainer = styled("div")`
  display: flex;
  align-items: stretch;
  @media (max-width: 480px) {
    flex-wrap: nowrap;
    width: 100%;
  }
`;

const PhoneTextField = styled(TextField)``;

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 2px;
`;

const InfoText = styled("div")`
  font-size: 12px;
  color: #6b6580;
  margin-top: 2px;
  font-weight: 500;
`;

const TermsItem = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #2d2252;

  & input {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #7f56d9;
  }

  & label {
    line-height: 1.4;
    color: #6b6580;
  }
`;

const ModalLinkText = styled("span")`
  color: #7f56d9;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const SignInPrompt = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  width: 100%;
  & span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SignInButton = styled(Link)`
  display: inline-block;
  padding: 10px 40px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #ffffff;
  }
`;

const CreateAccountButton = styled("button")`
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
