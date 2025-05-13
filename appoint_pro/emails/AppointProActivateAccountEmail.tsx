import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
import { ActivateAccountEmailData } from '@/models/ActivateAccountEmailData';

export const AppointProActivateAccountEmail = ({ emailData }: { emailData: ActivateAccountEmailData }) => {
    const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="mx-auto my-auto bg-white px-2 font-sans">
                    <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
                        <Section className="mt-[32px]">
                            <Img
                                src={`${baseUrl}/static/appointpro-logo.png`}
                                width="48"
                                height="48"
                                alt="AppointPro Logo"
                            />
                        </Section>
                        <Section className="mt-[32px]">
                            <Heading className="text-2xl font-bold">
                                Activeer uw account
                            </Heading>
                            <Text className="text-gray-600">
                                Klik op de knop hieronder om uw account te activeren:
                            </Text>
                        </Section>
                        <Section className="mt-[32px]">
                            <Button
                                className="bg-blue-500 text-white rounded-md text-center no-underline px-5 py-3"
                                href={`${baseUrl}/api/activate/${emailData.token}`}
                            >
                                Activeer account
                            </Button>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
