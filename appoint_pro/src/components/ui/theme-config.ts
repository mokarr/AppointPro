// Thema configuratie voor de applicatie
export const themeConfig = {
    name: "AppointPro",
    colors: {
        primary: {
            DEFAULT: "#3b82f6", // blue-500
            hover: "#2563eb", // blue-600
            focus: "#1d4ed8", // blue-700
            light: "#93c5fd", // blue-300
            dark: "#1e40af", // blue-800
        },
        secondary: {
            DEFAULT: "#10b981", // emerald-500
            hover: "#059669", // emerald-600
            focus: "#047857", // emerald-700
            light: "#6ee7b7", // emerald-300
            dark: "#065f46", // emerald-800
        },
        accent: {
            DEFAULT: "#8b5cf6", // violet-500
            hover: "#7c3aed", // violet-600
            focus: "#6d28d9", // violet-700
            light: "#c4b5fd", // violet-300
            dark: "#5b21b6", // violet-800
        },
        neutral: {
            50: "#fafafa",
            100: "#f5f5f5",
            200: "#e5e5e5",
            300: "#d4d4d4",
            400: "#a3a3a3",
            500: "#737373",
            600: "#525252",
            700: "#404040",
            800: "#262626",
            900: "#171717",
            950: "#0a0a0a",
        },
    },
    borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
    },
    fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
    },
    spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2.5rem",
        "3xl": "3rem",
    },
    shadows: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    },
} 