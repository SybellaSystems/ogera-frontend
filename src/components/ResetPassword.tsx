import React from "react";
import { styled } from "@mui/material/styles";
import logo from "../assets/Logo.png";
import loginImage from "../assets/login.png";

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
  secondaryAction?: React.ReactNode;
}

const RestPasswordTemplate: React.FC<RestPasswordTemplateProps> = ({
  heading,
  subHeading,
  fields,
  buttonText = "Submit",
  showResend = false,
  disabled = false,
  secondaryAction,
}) => {
  return (
    <PassMainContainer>
      <BoxContainer>
        <Logo />
        <Heading>{heading}</Heading>
        <SubHeading>{subHeading}</SubHeading>

        {fields.map((field, index) => (
          <DynamicBox key={field.name || field.type || index}>
            {field.type !== "otp" && field.label && <Label>{field.label}</Label>}

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
                />
                {!!field.error && <ErrorText>{String(field.error)}</ErrorText>}
              </>
            )}
          </DynamicBox>
        ))}

        <SubmitButton type="submit" disabled={disabled}>
          {buttonText}
        </SubmitButton>

        {!!secondaryAction && secondaryAction}

        {showResend && (
          <ResendClick>
            If you don't receive a code! <span>Resend</span>
          </ResendClick>
        )}

        <BackToLogin href="/auth/login">Back to Sign In</BackToLogin>
      </BoxContainer>
    </PassMainContainer>
  );
};

export default RestPasswordTemplate;

/* ==================== Styled Components ==================== */

const PassMainContainer = styled("div")`
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(${loginImage}) no-repeat center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
  font-family: "Nunito", Inter, sans-serif;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(45, 27, 78, 0.6) 0%,
      rgba(26, 16, 37, 0.9) 100%
    );
  }
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const BoxContainer = styled("div")`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  background-color: #ffffff;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  padding: 32px;
  gap: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 24px 20px;
    border-radius: 16px;
  }
  @media (max-width: 480px) {
    padding: 20px 16px;
    gap: 14px;
    border-radius: 14px;
  }
`;

const Logo = styled("div")`
  background: url(${logo}) no-repeat center;
  background-size: contain;
  height: 40px;
  width: 120px;
  align-self: center;
  margin-bottom: 4px;
`;

const Heading = styled("h1")`
  font-size: 22px;
  font-weight: 700;
  color: #7f56d9;
  margin: 0;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const SubHeading = styled("p")`
  font-size: 14px;
  font-weight: 400;
  color: #6b6580;
  line-height: 1.5;
  margin: 0;
`;

const DynamicBox = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled("label")`
  font-size: 13px;
  font-weight: 600;
  color: #2d2252;
`;

const Input = styled("input")`
  padding: 12px 15px;
  border-radius: 10px;
  border: 1px solid #e0d8f0;
  font-size: 14px;
  outline: none;
  background-color: #f9f9ff;
  color: #2d2252;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.15);
  }
  &::placeholder {
    color: #8a8599;
  }
`;

const OtpContainer = styled("div")`
  display: flex;
  gap: 12px;
  justify-content: center;
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const OtpInput = styled("input")`
  width: 50px;
  height: 50px;
  font-size: 18px;
  text-align: center;
  border-radius: 10px;
  border: 2px solid #e0d8f0;
  outline: none;
  background: #f9f9ff;
  color: #2d2252;
  transition: border-color 0.2s;
  &:focus {
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.15);
  }
  @media (max-width: 480px) {
    width: 42px;
    height: 42px;
    font-size: 16px;
    border-radius: 8px;
  }
`;

const SubmitButton = styled("button")`
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
  margin-top: 4px;
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
`;

const BackToLogin = styled("a")`
  font-size: 13px;
  color: #7f56d9;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
    color: #5b3ba5;
  }
`;

const ResendClick = styled("div")`
  text-align: center;
  font-size: 14px;
  color: #6b6580;
  & span {
    color: #7f56d9;
    cursor: pointer;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 2px;
`;
