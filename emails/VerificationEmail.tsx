import {
    Html,
    Head,
    Body,
    Container,
    Text,
    Heading,
    Hr,
} from "@react-email/components";
    
    interface VerificationEmailProps {
        username: string;
        otp: string;
    }
    
    export default function VerificationEmail({
        username,
        otp,
    }: VerificationEmailProps) {
        return (
        <Html>
            <Head />
            <Body style={{ fontFamily: "Arial, sans-serif" }}>
            <Container>
                <Heading>Verify your email</Heading>
    
                <Text>Hi {username},</Text>
    
                <Text>
                Your verification code is:
                </Text>
    
                <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
                {otp}
                </Text>
    
                <Text>
                This code will expire in 10 minutes.
                </Text>
    
                <Hr />
    
                <Text>
                If you did not request this, please ignore this email.
                </Text>
            </Container>
            </Body>
        </Html>
        );
    }