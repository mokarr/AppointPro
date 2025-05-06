import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'nl'],

    // Used when no locale matches
    defaultLocale: 'nl',

    // When using as-needed, only non-default locales will have a prefix
    // e.g. /en/about but /about for the default locale nl
    localePrefix: 'as-needed',

    // Set this to true to detect the locale based on user preferences
    // Set to false if you want explicit locale prefixes only
    localeDetection: true
});