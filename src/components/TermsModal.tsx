import { useState } from "react";
import { styled } from "@mui/material/styles";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const sections = [
  { id: "user-responsibilities", title: "User Responsibilities" },
  { id: "platform-usage", title: "Platform Usage" },
  { id: "job-listings", title: "Job Listings & Applications" },
  { id: "payments-fees", title: "Payments and Fees" },
  { id: "account-security", title: "Account Security" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "prohibited-conduct", title: "Prohibited Conduct" },
  { id: "limitation-liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination" },
  { id: "changes-terms", title: "Changes to Terms" },
];

const sectionContent: Record<string, { heading: string; content: JSX.Element }> = {
  "user-responsibilities": {
    heading: "User Responsibilities",
    content: (
      <>
        <p>Users must provide accurate and genuine information when creating an account on Ogera. Providing misleading or fake data may result in immediate account suspension or permanent termination. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        <p>You agree to use the platform only for lawful purposes and in accordance with these Terms. You are solely responsible for your conduct and any data, text, files, information, usernames, images, or other materials that you submit, post, or display on or through the platform.</p>
        <p>Users must be at least 18 years of age or have parental consent to use the platform. By registering, you confirm that you meet this age requirement.</p>
        <p>You must not share your account credentials with any third party. If you become aware of any unauthorized use of your account, you must notify Ogera immediately at support@ogera.com.</p>
      </>
    ),
  },
  "platform-usage": {
    heading: "Platform Usage",
    content: (
      <>
        <p>You agree not to misuse the platform or engage in harmful activities or abuse. This includes attempting to gain unauthorized access to other users' accounts, interfering with the proper functioning of the platform, or engaging in any fraudulent activities.</p>
        <p>The platform is provided on an "as is" and "as available" basis. We make no warranties regarding the availability, reliability, or functionality of any features. We reserve the right to modify, suspend, or discontinue any feature or service without prior notice.</p>
        <p>You may not use automated tools, bots, scrapers, or any other means to access the platform for any purpose without our express written permission.</p>
        <p>Any feedback, suggestions, or improvements you provide to Ogera regarding the platform may be used by us without any obligation to compensate you.</p>
      </>
    ),
  },
  "job-listings": {
    heading: "Job Listings and Applications",
    content: (
      <>
        <p>Employers must ensure all job listings are legitimate, accurately represent the position, and comply with applicable employment laws. Job seekers must submit truthful applications and resumes.</p>
        <p>Ogera reserves the right to remove any fraudulent, misleading, or discriminatory listings or applications without prior notice.</p>
        <p>Ogera does not guarantee the accuracy of job listings or the qualifications of applicants. Users should independently verify all information before making employment decisions. Ogera acts solely as a platform connecting employers and job seekers.</p>
        <p>Employers are solely responsible for their hiring decisions and must comply with all applicable anti-discrimination laws.</p>
      </>
    ),
  },
  "payments-fees": {
    heading: "Payments and Fees",
    content: (
      <>
        <p>Payments are handled by third-party payment processors. Ogera does not store your payment card details directly. By making a payment, you agree to the terms of service of the respective payment processor.</p>
        <p>Ogera does not handle payment disputes directly. Any disputes regarding charges should first be directed to our support team.</p>
        <p>Subscription fees are billed in advance. All fees are non-refundable unless otherwise stated in writing or required by applicable law. Users are responsible for all applicable taxes.</p>
        <p>Ogera reserves the right to change pricing at any time. Existing subscribers will be notified at least 30 days before any price increase takes effect.</p>
      </>
    ),
  },
  "account-security": {
    heading: "Account Security",
    content: (
      <>
        <p>You are responsible for keeping your login credentials secure at all times. This includes using a strong, unique password and not reusing passwords from other services. Notify us immediately at support@ogera.com if you suspect unauthorized access.</p>
        <p>We strongly recommend enabling two-factor authentication (2FA) where available.</p>
        <p>Ogera implements industry-standard security measures including encryption of data in transit and at rest, regular security audits, and intrusion detection systems. However, no system is completely secure.</p>
        <p>If we detect suspicious activity on your account, we may temporarily lock your account and require identity verification before restoring access.</p>
      </>
    ),
  },
  "intellectual-property": {
    heading: "Intellectual Property",
    content: (
      <>
        <p>All content on the Ogera platform, including logos, trademarks, text, graphics, user interface designs, photographs, audio, video, software, and source code, is the property of Ogera or its content suppliers and is protected by international intellectual property laws.</p>
        <p>Users may not reproduce, distribute, modify, create derivative works of, publicly display, republish, download, store, or transmit any content from the platform without explicit written permission.</p>
        <p>By posting content on Ogera, you grant Ogera a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute such content in connection with operating the platform.</p>
        <p>If you believe any content infringes your intellectual property rights, please contact us at legal@ogera.com.</p>
      </>
    ),
  },
  "prohibited-conduct": {
    heading: "Prohibited Conduct",
    content: (
      <>
        <p>Users may not use the platform for any illegal purposes or in violation of any applicable laws. This includes fraud, money laundering, identity theft, or trafficking.</p>
        <p>Strictly prohibited: posting offensive, abusive, defamatory, or discriminatory content; harassing or intimidating other users; impersonating any person or entity; and posting spam or unsolicited communications.</p>
        <p>Users may not attempt to scrape, harvest, or collect data from the platform using automated means.</p>
        <p>Violations may result in immediate account termination without warning, forfeiture of paid subscription fees, and legal action where appropriate.</p>
      </>
    ),
  },
  "limitation-liability": {
    heading: "Limitation of Liability",
    content: (
      <>
        <p>To the fullest extent permitted by law, Ogera shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.</p>
        <p>Ogera does not guarantee the accuracy, completeness, or reliability of any job listings, employer profiles, or user-generated content. Use of such information is at your own risk.</p>
        <p>In no event shall Ogera's total liability exceed the amount you have paid to Ogera in the twelve (12) months preceding the event, or one hundred dollars ($100), whichever is greater.</p>
        <p>Some jurisdictions do not allow the exclusion of certain damages. In such jurisdictions, our liability shall be limited to the maximum extent permitted by law.</p>
      </>
    ),
  },
  "termination": {
    heading: "Termination",
    content: (
      <>
        <p>Ogera may suspend or terminate your account at any time if you violate these Terms, engage in prohibited conduct, or if we reasonably believe your account poses a risk to other users. Termination may occur without prior notice in severe cases.</p>
        <p>Users may delete their accounts at any time through account settings or by contacting support@ogera.com. Upon deletion, your data will be permanently removed within 30 days, subject to retention policies.</p>
        <p>Upon termination, you will lose access to all account data, saved job listings, application history, and premium features. Unused subscriptions will not be refunded unless required by law.</p>
        <p>If your account is terminated due to a violation, you may not create a new account without explicit written permission from Ogera.</p>
      </>
    ),
  },
  "changes-terms": {
    heading: "Changes to Terms",
    content: (
      <>
        <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or platform notice at least 14 days before taking effect.</p>
        <p>Your continued use of the platform after changes constitutes acceptance. If you do not agree, you must stop using the platform and may request account deletion.</p>
        <p>We encourage you to periodically review these Terms. The "Last Updated" date indicates when the most recent changes were made.</p>
        <p>If any provision is found unenforceable, that provision shall be limited to the minimum extent necessary, and remaining provisions shall remain in full force.</p>
      </>
    ),
  },
};

const TermsModal = ({ open, onClose }: TermsModalProps) => {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  if (!open) return null;

  const currentContent = sectionContent[activeSection];

  return (
    <Backdrop onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Terms of Service</ModalTitle>
          <ModalUpdated>Updated January 2026</ModalUpdated>
        </ModalHeader>

        <ModalBody>
          <Sidebar>
            {sections.map((section, index) => (
              <SidebarItem
                key={section.id}
                $isActive={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              >
                <SidebarNumber $isActive={activeSection === section.id}>
                  {index + 1}
                </SidebarNumber>
                {section.title}
              </SidebarItem>
            ))}
          </Sidebar>

          <ContentArea>
            <ContentHeading>{currentContent.heading}</ContentHeading>
            <ContentDivider />
            <ContentText>{currentContent.content}</ContentText>
          </ContentArea>
        </ModalBody>

        <ModalFooter>
          <CloseButton onClick={onClose}>Close</CloseButton>
        </ModalFooter>
      </ModalBox>
    </Backdrop>
  );
};

export default TermsModal;

/* ——— Styled Components ——— */

const Backdrop = styled("div")({
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
});

const ModalBox = styled("div")(({ theme }) => ({
  width: "900px",
  maxWidth: "95vw",
  maxHeight: "85vh",
  background: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  fontFamily: "'Nunito', sans-serif",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
  [theme.breakpoints.down("md")]: {
    width: "95vw",
    maxHeight: "90vh",
  },
}));

const ModalHeader = styled("div")({
  padding: "24px 28px 16px",
  borderBottom: "1px solid #f0f0f0",
});

const ModalTitle = styled("h2")({
  fontSize: "22px",
  fontWeight: 800,
  color: "#0c0a18",
  fontFamily: "'Nunito', sans-serif",
  margin: 0,
});

const ModalUpdated = styled("p")({
  fontSize: "13px",
  color: "#9ca3af",
  fontFamily: "'Nunito', sans-serif",
  margin: "4px 0 0",
});

const ModalBody = styled("div")(({ theme }) => ({
  display: "flex",
  flex: 1,
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

const Sidebar = styled("div")(({ theme }) => ({
  width: "240px",
  minWidth: "240px",
  borderRight: "1px solid #f0f0f0",
  overflowY: "auto",
  padding: "12px 0",
  backgroundColor: "#fafafa",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    minWidth: "100%",
    maxHeight: "140px",
    borderRight: "none",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    padding: "8px",
  },
}));

const SidebarItem = styled("button")<{ $isActive: boolean }>(({ $isActive, theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  padding: "10px 16px",
  border: "none",
  background: $isActive ? "#f3ebff" : "transparent",
  color: $isActive ? "#5B3BA5" : "#6b7280",
  fontWeight: $isActive ? 600 : 400,
  fontSize: "13px",
  fontFamily: "'Nunito', sans-serif",
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.15s ease",
  "&:hover": {
    background: $isActive ? "#f3ebff" : "#f5f5f5",
  },
  [theme.breakpoints.down("sm")]: {
    width: "auto",
    padding: "6px 10px",
    fontSize: "11px",
    borderRadius: "6px",
    border: `1px solid ${$isActive ? "#5B3BA5" : "#e5e7eb"}`,
  },
}));

const SidebarNumber = styled("span")<{ $isActive: boolean }>(({ $isActive }) => ({
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  fontWeight: 700,
  backgroundColor: $isActive ? "#5B3BA5" : "#e5e7eb",
  color: $isActive ? "#ffffff" : "#9ca3af",
  flexShrink: 0,
}));

const ContentArea = styled("div")({
  flex: 1,
  overflowY: "auto",
  padding: "24px 28px",
});

const ContentHeading = styled("h3")({
  fontSize: "18px",
  fontWeight: 700,
  color: "#0c0a18",
  fontFamily: "'Nunito', sans-serif",
  margin: 0,
});

const ContentDivider = styled("hr")({
  border: "none",
  borderTop: "2px solid #f3ebff",
  margin: "12px 0 16px",
});

const ContentText = styled("div")({
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#4b5563",
  fontFamily: "'Nunito', sans-serif",
  "& p": {
    marginBottom: "12px",
  },
  "& p:last-child": {
    marginBottom: 0,
  },
});

const ModalFooter = styled("div")({
  padding: "16px 28px",
  borderTop: "1px solid #f0f0f0",
  display: "flex",
  justifyContent: "flex-end",
});

const CloseButton = styled("button")({
  background: "linear-gradient(135deg, #5B3BA5 0%, #7F56D9 100%)",
  color: "#ffffff",
  padding: "10px 24px",
  borderRadius: "50px",
  border: "none",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "'Nunito', sans-serif",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #4A2D8A 0%, #6D45C7 100%)",
    boxShadow: "0 4px 12px rgba(91, 59, 165, 0.3)",
  },
});
