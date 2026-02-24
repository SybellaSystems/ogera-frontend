import React, { useState } from "react";
import { styled } from "@mui/material/styles";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

const sections = [
  { id: "info-collect", title: "Information We Collect" },
  { id: "how-use", title: "How We Use Your Info" },
  { id: "info-sharing", title: "Information Sharing" },
  { id: "data-storage", title: "Data Storage & Security" },
  { id: "your-rights", title: "Your Rights & Choices" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "children", title: "Children's Privacy" },
  { id: "international", title: "International Transfers" },
  { id: "changes", title: "Changes to Policy" },
];

const sectionContent: Record<string, { heading: string; content: React.ReactNode }> = {
  "info-collect": {
    heading: "Types of Information We Collect",
    content: (
      <>
        <p>We collect information you provide directly when you create an account, complete your profile, or interact with our platform. This includes your full name, email address, phone number, physical address, work experience, education history, professional skills, certifications, and any other details you choose to share.</p>
        <p>We automatically collect certain technical and usage data when you access Ogera. This includes your IP address, browser type and version, operating system, device identifiers, referring URLs, pages visited, time spent on pages, click patterns, and other interaction data.</p>
        <p>When you make payments on our platform, payment information is collected and processed by our trusted third-party payment processors. Ogera does not directly store your full payment card details on our servers.</p>
        <p>We may also collect information from third-party sources, such as publicly available professional profiles and identity verification services. This helps us verify your identity, prevent fraud, and improve our matching algorithms.</p>
      </>
    ),
  },
  "how-use": {
    heading: "How We Use Your Information",
    content: (
      <>
        <p>We use your personal information primarily to provide, maintain, and improve the Ogera platform. This includes creating and managing your account, matching you with relevant job opportunities, processing applications, and facilitating communication between job seekers and employers.</p>
        <p>Your information helps us personalize your experience, including customizing job recommendations, tailoring content to your interests, and remembering your preferences and settings.</p>
        <p>We use your contact information to communicate about your account, applications, matches, platform updates, security alerts, and customer support. We may also send promotional communications, which you can opt out of at any time.</p>
        <p>Additionally, we use information for security purposes including detecting and preventing fraud, abuse, and unauthorized access. We process data to comply with legal obligations, enforce our Terms of Service, and resolve disputes.</p>
      </>
    ),
  },
  "info-sharing": {
    heading: "Information Sharing and Disclosure",
    content: (
      <>
        <p>Ogera does not sell, rent, or trade your personal information to third parties for their marketing purposes. We are committed to protecting your privacy and only share your data in limited circumstances.</p>
        <p>When you apply for a job through Ogera, we share your profile information, resume, and application materials with the respective employer. You can control what information is visible through your privacy settings.</p>
        <p>We work with trusted service providers who assist us in operating the platform, including cloud hosting, email delivery, analytics, payment processors, and customer support. These providers are contractually obligated to maintain appropriate security.</p>
        <p>We may disclose your information when required by law, such as in response to a court order or government investigation. In the event of a merger or acquisition, user data may be transferred with prior notice.</p>
      </>
    ),
  },
  "data-storage": {
    heading: "Data Storage and Security",
    content: (
      <>
        <p>Your data is stored on secure servers operated by industry-leading cloud providers. We use encryption for data both in transit (TLS 1.3) and at rest (AES-256). Our infrastructure is designed with multiple layers of security.</p>
        <p>We implement comprehensive security measures including firewalls, intrusion detection systems, regular vulnerability scanning, penetration testing, and access controls based on the principle of least privilege.</p>
        <p>Access to personal data is restricted to authorized employees and contractors who need it. All personnel undergo background checks and are bound by strict confidentiality agreements.</p>
        <p>While we implement industry-standard measures, no system is 100% secure. In the event of a data breach, we will notify you and relevant authorities within 72 hours as required by applicable laws.</p>
      </>
    ),
  },
  "your-rights": {
    heading: "Your Rights and Choices",
    content: (
      <>
        <p>You have the right to access your personal information at any time. Through your account settings, you can view, download, and export all data we hold about you in a portable, machine-readable format.</p>
        <p>You can update or correct your personal information at any time through your profile settings. You also have the right to restrict or object to certain types of processing.</p>
        <p>You may request deletion of your account and associated data at any time. Upon receiving a deletion request, we will remove your data within 30 days, except where legally required to retain certain information.</p>
        <p>You can manage communication preferences to opt out of marketing emails, push notifications, and promotional messages. You can also control cookie settings and adjust your profile visibility.</p>
      </>
    ),
  },
  "cookies": {
    heading: "Cookies and Tracking Technologies",
    content: (
      <>
        <p>We use cookies and similar technologies (web beacons, pixels, local storage) to enhance your experience. Cookies are small text files stored on your device that help us recognize you, remember preferences, and understand usage patterns.</p>
        <p>Essential cookies are necessary for the platform to function properly, including maintaining your login session and ensuring security. These cannot be disabled without affecting core functionality.</p>
        <p>We also use analytics cookies to understand user navigation, performance cookies to optimize loading times, and preference cookies to remember your settings.</p>
        <p>You can control cookie settings through your browser preferences. Most browsers allow you to block or delete cookies, though this may impact functionality. We respect "Do Not Track" browser signals where technically feasible.</p>
      </>
    ),
  },
  "third-party": {
    heading: "Third-Party Links and Services",
    content: (
      <>
        <p>Our platform may contain links to external websites or services not operated by Ogera. These are provided for convenience only. We do not endorse or assume responsibility for the content or privacy practices of third-party sites.</p>
        <p>When you leave our platform via a third-party link, our Privacy Policy no longer applies. We strongly encourage you to review the privacy policy of every website you visit.</p>
        <p>Some features may involve third-party integrations (social media login, calendar syncing, etc.). When using these, you may be sharing information with both Ogera and the third-party service.</p>
        <p>We regularly review our third-party partners to ensure they maintain adequate privacy and security standards, but cannot guarantee the security practices of external services.</p>
      </>
    ),
  },
  "children": {
    heading: "Children's Privacy Protection",
    content: (
      <>
        <p>Ogera is designed for users who are at least 18 years of age. We do not knowingly collect, use, or disclose personal information from individuals under 18. Our services are intended for adult users in the workforce.</p>
        <p>By creating an account, you represent that you are at least 18 years old. If we discover we have collected information from a user under 18, we will immediately delete it and terminate the account.</p>
        <p>Parents or guardians who believe their child has provided personal information should contact us immediately at privacy@ogera.com. We will promptly investigate and remove any such information.</p>
        <p>In jurisdictions where the minimum age differs, we comply with local requirements. However, we maintain 18 as our minimum age for account creation given the professional nature of our platform.</p>
      </>
    ),
  },
  "international": {
    heading: "International Data Transfers",
    content: (
      <>
        <p>Ogera operates globally, and your information may be transferred to, stored, and processed in countries other than your country of residence. By using our platform, you acknowledge and consent to such transfers.</p>
        <p>When we transfer personal data internationally, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs), adequacy decisions, and binding corporate rules where applicable.</p>
        <p>We comply with applicable data protection frameworks including GDPR, UK Data Protection Act, CCPA, and other regional privacy regulations.</p>
        <p>You have the right to know where your data is being processed. For concerns about international transfers, contact our Data Protection Officer at privacy@ogera.com.</p>
      </>
    ),
  },
  "changes": {
    heading: "Changes to This Policy",
    content: (
      <>
        <p>We may update this Privacy Policy to reflect changes in our data practices, business operations, or legal requirements. When we make changes, we will update the "Last Updated" date.</p>
        <p>For material changes, we will provide prominent notice through email, in-app notification, or website banner at least 14 days before changes take effect.</p>
        <p>Your continued use of Ogera after changes constitutes acceptance. If you do not agree, stop using the platform and request account deletion.</p>
        <p>Previous versions are available upon request. For questions, contact privacy@ogera.com. Last updated: January 2026.</p>
      </>
    ),
  },
};

const PrivacyModal = ({ open, onClose }: PrivacyModalProps) => {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  if (!open) return null;

  const currentContent = sectionContent[activeSection];

  return (
    <Backdrop onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Privacy Policy</ModalTitle>
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

export default PrivacyModal;

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
