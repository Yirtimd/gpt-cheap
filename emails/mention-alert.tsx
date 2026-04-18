import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  brandName: string;
  direction: "gained" | "lost";
  previousRate: string;
  currentRate: string;
  dashboardUrl: string;
};

export default function MentionAlertEmail({
  brandName = "Acme",
  direction = "gained",
  previousRate = "20%",
  currentRate = "60%",
  dashboardUrl = "https://chatgpt.cheap/dashboard",
}: Props) {
  const isGained = direction === "gained";

  return (
    <Html>
      <Head />
      <Preview>
        {brandName} {isGained ? "gained" : "lost"} mention in AI responses
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>
            {isGained ? "New Mention Detected" : "Mention Lost"}
          </Heading>

          <Text style={textStyle}>
            Your brand <strong>{brandName}</strong> has{" "}
            {isGained ? "started appearing" : "stopped appearing"} in AI-generated responses.
          </Text>

          <Section style={statsStyle}>
            <Text style={statLabel}>Previous mention rate</Text>
            <Text style={statValue}>{previousRate}</Text>
            <Text style={statLabel}>Current mention rate</Text>
            <Text style={statValue}>{currentRate}</Text>
          </Section>

          <Hr style={hrStyle} />

          <Text style={textStyle}>
            View full details on your{" "}
            <a href={dashboardUrl} style={linkStyle}>
              dashboard
            </a>
            .
          </Text>

          <Text style={footerStyle}>ChatGPT.cheap — AEO monitoring for your brand</Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "40px auto" as const,
  padding: "32px",
  borderRadius: "8px",
  maxWidth: "480px",
};

const headingStyle = { fontSize: "20px", lineHeight: "28px", marginBottom: "16px" };
const textStyle = { fontSize: "14px", lineHeight: "24px", color: "#374151" };
const statsStyle = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};
const statLabel = { fontSize: "12px", color: "#6b7280", margin: "0" };
const statValue = { fontSize: "18px", fontWeight: "600" as const, margin: "0 0 8px" };
const hrStyle = { borderColor: "#e5e7eb", margin: "24px 0" };
const linkStyle = { color: "#2563eb" };
const footerStyle = { fontSize: "12px", color: "#9ca3af", marginTop: "24px" };
