import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
import { BookingConfirmationEmailData as BaseBookingConfirmationEmailData } from '@/models/BookingConfirmationEmailData';

// Extend the model to include userImage for email template
export type BookingConfirmationEmailData = BaseBookingConfirmationEmailData & {
    userImage?: string;
};

export const AppointProBookingConfirmationEmail = ({ bookingData }: { bookingData: BookingConfirmationEmailData }) => {
    const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : '';
    const previewText = `Your booking is confirmed!`;

    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="mx-auto my-auto bg-white px-2 font-sans">
                    <Preview>{previewText}</Preview>
                    <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
                        <Section className="mt-[32px]">
                            <Img
                                src={`${baseUrl}/static/appointpro-logo.png`}
                                width="48"
                                height="48"
                                alt="AppointPro Logo"
                                className="mx-auto my-0"
                            />
                        </Section>
                        <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
                            Booking Confirmed!
                        </Heading>
                        <Text className="text-[14px] text-black leading-[24px]">
                            Hello {bookingData.customerName},
                        </Text>
                        <Text className="text-[14px] text-black leading-[24px]">
                            Thank you for booking with <strong>AppointPro</strong>! Your appointment is confirmed. Here are your booking details:
                        </Text>
                        <Section className="my-4 p-4 bg-gray-50 rounded">
                            <Row>
                                {bookingData.userImage && (
                                    <Column align="center">
                                        <Img
                                            className="rounded-full mx-auto"
                                            src={bookingData.userImage}
                                            width="64"
                                            height="64"
                                            alt={`${bookingData.customerName}'s profile picture`}
                                        />
                                    </Column>
                                )}
                                <Column align="center">
                                    <Text className="text-[14px] text-black leading-[24px]">
                                        <strong>Date:</strong> {bookingData.date}<br />
                                        <strong>Time:</strong> {bookingData.timeslot}<br />
                                        <strong>Facility:</strong> {bookingData.facilityName}<br />
                                        <strong>Location:</strong> {bookingData.locationName}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Button
                                className="rounded bg-blue-600 px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                                href={bookingData.bookingLink}
                                aria-label="View or manage your booking"
                            >
                                View or Manage Booking
                            </Button>
                        </Section>
                        <Text className="text-[14px] text-black leading-[24px]">
                            If you need to make changes or cancel your booking, you can do so by clicking the button above.
                        </Text>
                        <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            If you have any questions or need help, please contact us
                            {bookingData.organizationEmail && (
                                <> at <Link href={`mailto:${bookingData.organizationEmail}`} className="text-blue-600 no-underline">{bookingData.organizationEmail}</Link></>
                            )}
                            {bookingData.organizationPhone && (
                                <> or call us at <span className="text-black">{bookingData.organizationPhone}</span></>
                            )}
                            .
                        </Text>
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            Thank you for choosing AppointPro!
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

AppointProBookingConfirmationEmail.PreviewProps = {
    bookingData: {
        username: 'Jane Doe',
        userImage: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''}/static/appointpro-user.png`,
        bookingDate: '2024-05-01',
        bookingTime: '14:00',
        serviceName: 'Haircut',
        locationName: 'Downtown Salon',
        bookingLink: 'https://appointpro.com/bookings/12345',
        supportEmail: 'support@appointpro.com',
    }
};

export default AppointProBookingConfirmationEmail;
