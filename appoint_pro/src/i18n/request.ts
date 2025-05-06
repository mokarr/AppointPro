import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

// Function to load messages
const getMessages = async (locale: string) => {
    console.log('getMessages', locale);
    try {
        // Use a more explicit path with the Next.js public directory approach
        return (await import(`@/messages/${locale}.json`)).default;
    } catch (error) {
        console.error(`Could not load messages for locale: ${locale}`, error);
        // Fallback to default locale if the requested one fails
        return (await import(`@/messages/${routing.defaultLocale}.json`)).default;
    }
};

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    return {
        locale,
        messages: await getMessages(locale)
    };
});