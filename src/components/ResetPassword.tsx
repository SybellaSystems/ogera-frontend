import React from "react";
import { styled } from "@mui/material/styles";
import { useTheme } from "../context/ThemeContext";

type InputField = {
  label?: string;
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | ((e: React.ChangeEvent<HTMLInputElement>, index: number) => void);
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  error?: string | boolean;
  names?: string[];
  values?: string[];
  refs?: React.RefObject<HTMLInputElement | null>[];
};

interface RestPasswordTemplateProps {
  heading: string;
  subHeading: string;
  fields: InputField[];
  buttonText?: string;
  showResend?: boolean;
  disabled?: boolean;
}

const RestPasswordTemplate: React.FC<RestPasswordTemplateProps> = ({
  heading,
  subHeading,
  fields,
  buttonText = "Submit",
  showResend = false,
  disabled = false,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <PassMainContainer
      style={{
        background: isDark
          ? "linear-gradient(180deg, #0f0a1a 0%, #1a1528 50%, #0f0a1a 100%)"
          : "linear-gradient(180deg, #e4daf5 0%, #ede7f8 50%, #f5f0fc 100%)",
      }}
      role="main"
    >
      <BoxContainer
        style={{
          backgroundColor: isDark ? "#1e1833" : "#ffffff",
          border: isDark ? "1px solid rgba(45,27,105,0.5)" : "none",
          boxShadow: isDark
            ? "0 8px 30px rgba(0,0,0,0.3)"
            : "0 8px 30px rgba(91, 59, 165, 0.1)",
        }}
      >
        <Logo />
        <div>
          <Heading style={{ color: isDark ? "#f3f4f6" : "#2d2252" }}>
            {heading}
          </Heading>
          <SubHeading style={{ color: isDark ? "#d1d5db" : "#6b6580" }}>
            {subHeading}
          </SubHeading>
        </div>

        {fields.map((field, index) => (
          <FieldGroup key={field.name || field.type || index}>
            {field.type !== "otp" && field.label && (
              <Label style={{ color: isDark ? "#d1d5db" : "#2d2252" }}>
                {field.label}
              </Label>
            )}

            {field.type === "otp" ? (
              <>
                <OtpContainer>
                  {field.names?.map((name, i) => (
                    <OtpInput
                      key={name}
                      ref={field.refs?.[i]}
                      name={name}
                      value={field.values?.[i] || ""}
                      onChange={(e) => field.onChange?.(e, i)}
                      onKeyDown={(e) => field.onKeyDown?.(e, i)}
                      onPaste={i === 0 ? field.onPaste : undefined}
                      onBlur={field.onBlur}
                      maxLength={1}
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={`Digit ${i + 1} of ${field.names?.length || 4}`}
                      style={{
                        backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
                        borderColor: isDark ? "rgba(45,27,105,0.5)" : "#ddd0ec",
                        color: isDark ? "#e2e8f0" : "#2d2252",
                      }}
                    />
                  ))}
                </OtpContainer>
                {!!field.error && <ErrorText>{String(field.error)}</ErrorText>}
              </>
            ) : (
              <>
                <Input
                  name={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder || ""}
                  value={field.value}
                  onChange={field.onChange as React.ChangeEventHandler<HTMLInputElement>}
                  onBlur={field.onBlur}
                  style={{
                    backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
                    borderColor: isDark ? "rgba(45,27,105,0.5)" : "#ddd0ec",
                    color: isDark ? "#e2e8f0" : "#2d2252",
                  }}
                />
                {!!field.error && <ErrorText>{String(field.error)}</ErrorText>}
              </>
            )}
          </FieldGroup>
        ))}

        <SubmitButton type="submit" disabled={disabled}>
          {disabled ? (
            <>
              <Spinner />
              {buttonText}
            </>
          ) : (
            buttonText
          )}
        </SubmitButton>

        {showResend && (
          <ResendClick style={{ color: isDark ? "#d1d5db" : "#6b6580" }}>
            If you don't receive a code! <span>Resend</span>
          </ResendClick>
        )}

        <BackLink
          href="/auth/login"
          style={{ color: isDark ? "#c084fc" : "#7F56D9" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Login
        </BackLink>
      </BoxContainer>
    </PassMainContainer>
  );
};

export default RestPasswordTemplate;

/* ——— Styled Components ——— */

const PassMainContainer = styled("div")(({ theme: _theme }) => ({
  width: "100%",
  maxWidth: "100vw",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(180deg, #e4daf5 0%, #ede7f8 50%, #f5f0fc 100%)",
  fontFamily: "'Nunito', sans-serif",
  overflow: "hidden",
  padding: "20px",
  boxSizing: "border-box",
}));

const BoxContainer = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: "440px",
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  padding: "36px 32px",
  gap: "20px",
  boxSizing: "border-box",
  boxShadow: "0 8px 30px rgba(91, 59, 165, 0.1)",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    maxWidth: "100%",
    padding: "28px 20px",
  },
}));

const Logo = styled("div")({
  background: "linear-gradient(135deg, #7F56D9 0%, #6941C6 100%)",
  height: 42,
  width: 130,
  borderRadius: 10,
  alignSelf: "center",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: 'url("/ogera_logo-removebg-preview.png") no-repeat center center',
    backgroundSize: "80%",
  },
});

const Heading = styled("h1")({
  fontSize: "24px",
  fontWeight: 800,
  color: "#2d2252",
  fontFamily: "'Nunito', sans-serif",
  marginBottom: "6px",
  lineHeight: 1.2,
});

const SubHeading = styled("p")({
  fontSize: "14px",
  color: "#6b6580",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 400,
  lineHeight: 1.5,
});

const FieldGroup = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

const Label = styled("label")({
  fontSize: "13px",
  fontWeight: 600,
  color: "#2d2252",
  fontFamily: "'Nunito', sans-serif",
});

const Input = styled("input")({
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1.5px solid #ddd0ec",
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
});

const OtpContainer = styled("div")({
  display: "flex",
  gap: "14px",
  justifyContent: "center",
});

const OtpInput = styled("input")({
  width: "52px",
  height: "52px",
  fontSize: "20px",
  fontWeight: 700,
  fontFamily: "'Nunito', sans-serif",
  textAlign: "center",
  borderRadius: "12px",
  border: "2px solid #ddd0ec",
  outline: "none",
  backgroundColor: "#ffffff",
  color: "#2d2252",
  boxShadow: "0 1px 3px rgba(91, 59, 165, 0.08)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "&:focus": {
    borderColor: "#7F56D9",
    boxShadow: "0 0 0 3px rgba(127, 86, 217, 0.12)",
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
  marginTop: "4px",
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

const ResendClick = styled("div")({
  textAlign: "center",
  fontSize: "14px",
  color: "#6b6580",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 400,
  "& span": {
    color: "#7F56D9",
    cursor: "pointer",
    fontWeight: 700,
    "&:hover": {
      color: "#6941C6",
      textDecoration: "underline",
    },
  },
});

const BackLink = styled("a")({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "'Nunito', sans-serif",
  color: "#7F56D9",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 0.2s",
  "&:hover": {
    color: "#6941C6",
    textDecoration: "underline",
  },
});

const ErrorText = styled("span")({
  fontSize: "12px",
  color: "#ef4444",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 500,
});
