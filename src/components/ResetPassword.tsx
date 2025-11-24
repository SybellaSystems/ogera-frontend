import { styled } from "@mui/material/styles";
import logo from "../assets/Logo.png";
import Button from "../components/Button";

type InputField = {
  label?: string;
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  error?: string | boolean;
  names?: string[];
  values?: string[];
};

interface RestPasswordTemplateProps {
  heading: string;
  subHeading: string;
  fields: InputField[];
  buttonText?: string;
  showResend?: boolean;
}

const RestPasswordTemplate = ({
  heading,
  subHeading,
  fields,
  buttonText = "Submit",
  showResend = false,
}: RestPasswordTemplateProps) => {
  return (
    <PassMainContainer>
      <BoxContainer>
        <Logo />
        <Heading>{heading}</Heading>
        <SubHeading>{subHeading}</SubHeading>

        {fields.map((field, index) => (
          <DynamicBox key={index}>
            {field.type !== "otp" && field.label && <Label>{field.label}</Label>}

            {field.type === "otp" ? (
              <>
                <OtpContainer>
                  {field.names?.map((name, i) => (
                    <OtpInput
                      key={i}
                      name={name}
                      value={field.values?.[i] || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </OtpContainer>
                {field.error && <ErrorText>{field.error}</ErrorText>}
              </>
            ) : (
              <>
                <Input
                  name={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder || ""}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                {field.error && <ErrorText>{field.error}</ErrorText>}
              </>
            )}
          </DynamicBox>
        ))}

        <Button backgroundcolor="#7f56d9" type="submit" text={buttonText} />

        {showResend && (
          <ResendClick>
            <div>
              If you don't receive a code! <span>Resend</span>
            </div>
          </ResendClick>
        )}
      </BoxContainer>
    </PassMainContainer>
  );
};

export default RestPasswordTemplate;

// ---------- Styles ----------

const PassMainContainer = styled("div")(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: `linear-gradient(to right, 
    ${theme.palette.primary.main}, 
    ${theme.palette.secondary.main}, 
    ${theme.palette.info.main})`,
}));

const BoxContainer = styled("div")(({ theme }) => ({
  width: "35%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  gap: "15px",

  [theme.breakpoints.down("md")]: {
    width: "60%",
    padding: "16px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "90%",
    padding: "12px",
  },
}));

const Logo = styled("div")`
  background: url(${logo}) no-repeat center center;
  background-size: contain;
  height: 40px;
  width: 120px;
  margin-bottom: 20px;
  align-self: center;
`;

const Heading = styled("h1")(({ theme }) => ({
  fontSize: "16px",
  fontWeight: 700,
  textAlign: "left",
  paddingLeft: "10px",
  margin: "5px 0",
  color: theme.palette.text.primary,

  [theme.breakpoints.down("sm")]: {
    fontSize: "14px",
    textAlign: "center",
    paddingLeft: "0",
  },
}));

const SubHeading = styled("h2")(({ theme }) => ({
  fontSize: "14px",
  fontWeight: 400,
  textAlign: "left",
  paddingLeft: "10px",
  margin: "0 0 10px 0",
  color: theme.palette.text.secondary,

  [theme.breakpoints.down("sm")]: {
    fontSize: "13px",
    textAlign: "center",
    paddingLeft: "0",
  },
}));

const DynamicBox = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  paddingLeft: "10px",
});

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

  [theme.breakpoints.down("sm")]: {
    fontSize: "13px",
    padding: "10px 12px",
  },
}));

const OtpContainer = styled("div")(({ theme }) => ({
  display: "flex",
  gap: "12px",
  justifyContent: "center",

  [theme.breakpoints.down("sm")]: {
    gap: "8px",
  },
}));

const OtpInput = styled("input")(({ theme }) => ({
  width: "50px",
  height: "50px",
  fontSize: "18px",
  textAlign: "center",
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  outline: "none",
  "&:focus": {
    borderColor: theme.palette.primary.main,
  },

  [theme.breakpoints.down("sm")]: {
    width: "40px",
    height: "40px",
    fontSize: "16px",
  },
}));

const ResendClick = styled("div")(({ theme }) => ({
  textAlign: "center",
  fontSize: "14px",
  marginTop: "10px",
  color: theme.palette.text.secondary,

  "& span": {
    color: theme.palette.primary.main,
    fontWeight: 600,
    cursor: "pointer",
  },
}));

const ErrorText = styled("div")(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: "12px",
  marginTop: "4px",
}));
