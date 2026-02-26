import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import logo from "../assets/logoWhite.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { registerValidationSchema } from "../validation/Index";
import type { RegisterFormValues } from "../type/Index";
import { useFormik } from "formik";
import Button from "../components/button";
import { useRegisterUserMutation } from "../services/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import TermsModal from "../components/TermsModal";
import PrivacyModal from "../components/PrivacyModal";
import CountryCodeSelector from "../components/CountryCodeSelector";
import { getCountryCodeFromDialCode, getExpectedDigitMessage } from "../utils/mobileValidation";

const Register = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  // Modals
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  const navigate = useNavigate();

  const [registerUser, { data, isError, isLoading, isSuccess, error }] =
    useRegisterUserMutation();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const [countryCode, setCountryCode] = useState("+1"); // Default to US/Canada
  const [expectedDigitMessage, setExpectedDigitMessage] = useState<string>("Enter phone number"); // Store expected digit message
  const [hasStartedTyping, setHasStartedTyping] = useState(false); // Track if user started typing phone number

  // Update expected digit message when country changes
  const handleCountryCodeChange = (newDialCode: string) => {
    setCountryCode(newDialCode);
    setHasStartedTyping(false); // Reset typing state when country changes
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
        // Combine country code with phone number
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
      toast.error(err?.data?.message || t("register.somethingWentWrong"));
    }

    if (data && isSuccess) {
      toast.success(t("register.registrationSuccess"), { duration: 5000 });
      resetForm();
      // Show verification message and navigate after a delay
      setTimeout(() => {
        navigate("/auth/login", {
          state: { showVerificationMessage: true, email: formik.values.email },
        });
      }, 2000);
    }
  }, [isError, error, data, isSuccess, resetForm, navigate]);

  return (
    <RegisterMainContainer>
      {/* Left Section */}
      <RegisterLeftContainer>
        <Logo />
        <LeftTextContainer>
          <TextContainer>
            <Heading>{t("register.successStartsHere")}</Heading>
            <SubHeading>{t("register.connectTrustedEmployers")}</SubHeading>
          </TextContainer>

          <TestimonialCard>
            <p>{t("register.testimonial")}</p>
            <UserInfo>
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="User testimonial"
              />
              <div>
                <span>{t("register.daphnePark")}</span>
                <span>{t("register.computerScienceStudent")}</span>
              </div>
            </UserInfo>
          </TestimonialCard>
        </LeftTextContainer>
      </RegisterLeftContainer>

      {/* Right Section */}
      <RegisterRightContainer>
        <RegisterFormContainer onSubmit={formik.handleSubmit}>
          <Head>{t("register.createAccount")}</Head>
          <SmallText>
            {t("register.alreadyHaveAccount")} <a href="/auth/login">{t("register.signIn")}</a>
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
                <span>
                  {type === "student" ? t("register.asStudent") : t("register.asEmployer")}
                </span>
              </ToggleOption>
            ))}
          </ToggleGroup>

          {/* Full Name */}
          <FormGroup>
            <Label htmlFor="full_name">{t("register.fullName")}</Label>
            <Input
              id="full_name"
              name="full_name"
              maxLength={20}
              placeholder={t("register.enterFullName")}
              value={formik.values.full_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.full_name && formik.errors.full_name && (
              <ErrorText>{formik.errors.full_name}</ErrorText>
            )}
          </FormGroup>

          {/* Email */}
          <FormGroup>
            <Label htmlFor="email">{t("register.emailAddress")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("register.enterEmail")}
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
                style: { borderRadius: "8px", fontSize: "14px" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      type="button"
                    >
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
              <Label htmlFor="national_id_number">{t("register.nationalIdNumber")}</Label>
              <Input
                id="national_id_number"
                name="national_id_number"
                maxLength={15}
                placeholder={t("register.enterNationalId")}
                value={formik.values.national_id_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.national_id_number &&
                formik.errors.national_id_number && (
                  <ErrorText>{formik.errors.national_id_number}</ErrorText>
                )}
            </FormGroup>
          ) : (
            <FormGroup>
              <Label htmlFor="businessId">{t("register.businessRegistrationId")}</Label>
              <Input
                id="businessId"
                name="businessId"
                maxLength={15}
                placeholder={t("register.enterBusinessId")}
                value={formik.values.businessId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.businessId && formik.errors.businessId && (
                <ErrorText>{formik.errors.businessId}</ErrorText>
              )}
            </FormGroup>
          )}

          {/* Mobile Number */}
          <FormGroup>
            <Label htmlFor="mobile_number">{t("register.mobileNumber")}</Label>
            <PhoneInputContainer>
              <CountryCodeSelector
                value={countryCode}
                onChange={handleCountryCodeChange}
              />
              <PhoneInput
                id="mobile_number"
                name="mobile_number"
                type="tel"
                placeholder={t("register.enterMobileNumber")}
                value={formik.values.mobile_number}
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  formik.setFieldValue("mobile_number", cleaned);
                  if (cleaned) {
                    setHasStartedTyping(true); // Hide suggestion when user starts typing
                  }
                }}
              />
            </PhoneInputContainer>
            {!hasStartedTyping && !formik.errors.mobile_number && (
              <InfoText>{expectedDigitMessage}</InfoText>
            )}
            {formik.touched.mobile_number && formik.errors.mobile_number && (
              <ErrorText>{formik.errors.mobile_number}</ErrorText>
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
                {t("register.agreeToTerms")}{" "}
                <ModalLinkText onClick={() => setOpenTerms(true)}>
                  {t("register.termsOfService")}
                </ModalLinkText>
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
                {t("register.agreeToPrivacy")}{" "}
                <ModalLinkText onClick={() => setOpenPrivacy(true)}>
                  {t("register.privacyPolicy")}
                </ModalLinkText>
              </label>
              {formik.touched.privacy && formik.errors.privacy && (
                <ErrorText>{formik.errors.privacy}</ErrorText>
              )}
            </TermsItem>
          </TermsContainer>

          <Button
            backgroundcolor="#7f56d9"
            type="submit"
            text={isLoading ? t("common.loading") : t("register.createAccountButton")}
            disabled={isLoading}
          />
        </RegisterFormContainer>
      </RegisterRightContainer>

      {/* External Modals */}
      <TermsModal open={openTerms} onClose={() => setOpenTerms(false)} />
      <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} />
    </RegisterMainContainer>
  );
};

export default Register;

/* -------------------------------------------
   ❗ Your FULL ORIGINAL CSS (unchanged)
------------------------------------------- */

const RegisterMainContainer = styled("div")`
  width: 100%;
  min-height: 100vh;
  display: flex;
  overflow: hidden;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RegisterLeftContainer = styled("div")`
  background-color: #7f56d9;
  width: 40%;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 20px;
  margin: 10px;
  overflow-y: auto;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled("div")`
  background: url(${logo}) no-repeat center center;
  background-size: contain;
  height: 40px;
  width: 100px;
  margin-bottom: 20px;
`;

const LeftTextContainer = styled("div")`
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TextContainer = styled("div")`
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  text-align: center;
`;

const Heading = styled("h1")`
  font-size: 36px;
  font-weight: 700;
  width: 80%;
`;

const SubHeading = styled("p")`
  font-size: 15px;
  color: #ddd;
  width: 80%;
`;

const TestimonialCard = styled("div")`
  background: rgba(32, 15, 163, 0.5);
  margin-top: 3rem;
  border-radius: 12px;
  padding: 1rem;
  max-width: 380px;
  color: #fff;
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

const RegisterRightContainer = styled("div")`
  width: 60%;
  padding: 20px 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  @media (max-width: 768px) {
    width: 100%;
    padding: 20px;
  }
`;

const RegisterFormContainer = styled("form")`
  max-width: 550px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Head = styled("p")`
  font-size: 26px;
  font-weight: 600;
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
  border: 1px solid var(--theme-border, #ddd);
  font-size: 14px;
  background-color: var(--theme-input-bg, #ffffff);
  color: var(--theme-text-primary, #111827);
`;

const PhoneInputContainer = styled("div")`
  display: flex;
  align-items: stretch;
`;

const PhoneInput = styled("input")`
  flex: 1;
  padding: 12px;
  border-radius: 0 8px 8px 0;
  border: 1px solid var(--theme-border, #ddd);
  border-left: none;
  font-size: 14px;
  background-color: var(--theme-input-bg, #ffffff);
  color: var(--theme-text-primary, #111827);
  
  &:focus {
    outline: none;
    border-color: #7f56d9;
    border-left: 1px solid #7f56d9;
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: red;
  margin-top: 4px;
`;

const InfoText = styled("div")`
  font-size: 12px;
  color: #0066cc;
  margin-top: 4px;
  font-weight: 500;
`;

const TermsContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 15px 0;
`;

const TermsItem = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;

  & input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  & label {
    line-height: 1.4;
  }

  & a {
    color: #7f56d9;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
      color: #6e47c4;
    }
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
