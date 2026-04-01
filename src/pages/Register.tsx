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
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const navigate = useNavigate();

  const [registerUser, { data, isError, isLoading, isSuccess, error }] = useRegisterUserMutation();

  const [countryCode, setCountryCode] = useState("+1");
  const [expectedDigitMessage, setExpectedDigitMessage] = useState<string>("Enter phone number");
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  const handleCountryCodeChange = (newDialCode: string) => {
    setCountryCode(newDialCode);
    setHasStartedTyping(false);
    const countryISOCode = getCountryCodeFromDialCode(newDialCode);
    if (countryISOCode) {
      setExpectedDigitMessage(getExpectedDigitMessage(countryISOCode));
    }
  };

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      accountType: "student",
      full_name: "",
      email: "",
      password: "",
      national_id_number: "",
      businessId: "",
      mobile_number: "",
      countryCode: getCountryCodeFromDialCode("+1") || "",
      terms: false,
      privacy: false,
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          full_name: values.full_name,
          email: values.email,
          mobile_number: `${countryCode}${values.mobile_number}`,
          password: values.password,
          role: values.accountType,
          national_id_number: values.accountType === "student" ? values.national_id_number : null,
          business_registration_id: values.accountType === "employer" ? values.businessId : null,
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
    if (iso) formik.setFieldValue("countryCode", iso);
  }, [countryCode]);

  useEffect(() => {
    if (isError && error) {
      const err = error as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || t("register.somethingWentWrong"));
    }
    if (data && isSuccess) {
      toast.success(t("register.registrationSuccess"), { duration: 5000 });
      formik.resetForm();
      setTimeout(() => {
        navigate("/auth/login", { state: { showVerificationMessage: true, email: formik.values.email } });
      }, 2000);
    }
  }, [isError, error, data, isSuccess, navigate]);

  return (
    <RegisterMainContainer>
      <GlassCard onSubmit={formik.handleSubmit}>
        <LogoImg src={logo} alt="Logo" />
        <Head>{t("register.createAccount")}</Head>
        <SmallText>
          {t("register.alreadyHaveAccount")} <a href="/auth/login">{t("register.signIn")}</a>
        </SmallText>

        <ModernToggle>
          {(["student", "employer"] as const).map((type) => (
            <ToggleBtn
              key={type}
              type="button"
              active={formik.values.accountType === type}
              onClick={() => formik.setFieldValue("accountType", type)}
            >
              {type === "student" ? t("register.asStudent") : t("register.asEmployer")}
            </ToggleBtn>
          ))}
        </ModernToggle>

        <FormGroup>
          <Label>{t("register.fullName")}</Label>
          <StyledInput
            name="full_name"
            placeholder={t("register.enterFullName")}
            value={formik.values.full_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.full_name && formik.errors.full_name && <ErrorText>{formik.errors.full_name}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>{t("register.emailAddress")}</Label>
          <StyledInput
            name="email"
            type="email"
            placeholder={t("register.enterEmail")}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && <ErrorText>{formik.errors.email}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>{t("register.password")}</Label>
          <TextField
            name="password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            size="small"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            InputProps={{
              style: { borderRadius: "8px", color: "white", background: "rgba(255,255,255,0.05)" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "gray" }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {formik.touched.password && formik.errors.password && <ErrorText>{formik.errors.password}</ErrorText>}
        </FormGroup>

        {formik.values.accountType === "student" && (
          <FormGroup>
            <Label>{t("register.nationalId")}</Label>
            <StyledInput
              name="national_id_number"
              placeholder={t("register.enterNationalId")}
              value={formik.values.national_id_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.national_id_number && formik.errors.national_id_number && (
              <ErrorText>{formik.errors.national_id_number}</ErrorText>
            )}
          </FormGroup>
        )}

        {formik.values.accountType === "employer" && (
          <FormGroup>
            <Label>{t("register.businessId")}</Label>
            <StyledInput
              name="businessId"
              placeholder={t("register.enterBusinessId")}
              value={formik.values.businessId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.businessId && formik.errors.businessId && <ErrorText>{formik.errors.businessId}</ErrorText>}
          </FormGroup>
        )}

        <FormGroup>
          <Label>{t("register.mobileNumber")}</Label>
          <PhoneRow>
            <CountryCodeSelector value={countryCode} onChange={handleCountryCodeChange} />
            <PhoneInput
              name="mobile_number"
              type="tel"
              placeholder="000 000 000"
              value={formik.values.mobile_number}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, "");
                formik.setFieldValue("mobile_number", cleaned);
                if (cleaned) setHasStartedTyping(true);
              }}
              onBlur={() => formik.setFieldTouched("mobile_number", true)}
            />
          </PhoneRow>
          {!hasStartedTyping && <InfoText>{expectedDigitMessage}</InfoText>}
          {formik.touched.mobile_number && formik.errors.mobile_number && <ErrorText>{formik.errors.mobile_number}</ErrorText>}
        </FormGroup>

        <TermsContainer>
          <TermsItem>
            <input type="checkbox" name="terms" checked={formik.values.terms} onChange={formik.handleChange} />
            <label>{t("register.agreeToTerms")} <span onClick={() => setOpenTerms(true)}>{t("register.termsOfService")}</span></label>
          </TermsItem>
          {formik.touched.terms && formik.errors.terms && <ErrorText>{formik.errors.terms}</ErrorText>}

          <TermsItem>
            <input type="checkbox" name="privacy" checked={formik.values.privacy} onChange={formik.handleChange} />
            <label>{t("register.agreeToPrivacy")} <span onClick={() => setOpenPrivacy(true)}>{t("register.privacyPolicy")}</span></label>
          </TermsItem>
          {formik.touched.privacy && formik.errors.privacy && <ErrorText>{formik.errors.privacy}</ErrorText>}
        </TermsContainer>

        <Button
          backgroundcolor="#7f56d9"
          type="submit"
          text={isLoading ? t("common.loading") : t("register.createAccountButton")}
          disabled={isLoading}
        />
      </GlassCard>

      <TermsModal open={openTerms} onClose={() => setOpenTerms(false)} />
      <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} />
    </RegisterMainContainer>
  );
};

export default Register;

const RegisterMainContainer = styled("div")`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0c0a18;
  padding: 40px 20px;
`;

const GlassCard = styled("form")`
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
`;

const LogoImg = styled("img")`
  height: 40px;
  width: fit-content;
  margin-bottom: 20px;
`;

const Head = styled("h2")`
  font-size: 24px;
  color: white;
  margin: 0;
`;

const SmallText = styled("p")`
  font-size: 14px;
  color: #94a3b8;
  margin: 8px 0 24px;
  a { color: #7f56d9; text-decoration: none; font-weight: 600; }
`;

const ModernToggle = styled("div")`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const ToggleBtn = styled("button")<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: ${(props) => (props.active ? "#7f56d9" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#94a3b8")};
  font-weight: 600;
  transition: 0.3s;
`;

const FormGroup = styled("div")`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
`;

const Label = styled("label")`
  font-size: 13px;
  color: #e2e8f0;
  margin-bottom: 6px;
`;

const StyledInput = styled("input")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  outline: none;
  &:focus { border-color: #7f56d9; }
`;

const PhoneRow = styled("div")`
  display: flex;
  gap: 0;
`;

const PhoneInput = styled(StyledInput)`
  flex: 1;
  border-radius: 0 8px 8px 0;
  border-left: none;
`;

const ErrorText = styled("span")`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

const InfoText = styled("span")`
  color: #94a3b8;
  font-size: 12px;
  margin-top: 4px;
`;

const TermsContainer = styled("div")`
  margin: 10px 0 20px;
`;

const TermsItem = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 13px;
  span { color: #7f56d9; cursor: pointer; font-weight: 600; }
`;