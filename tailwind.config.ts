// tailwind.config.ts
import type { Config } from "tailwindcss"

const config = {
    darkMode: "class",
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['var(--font-cormorant)', 'Georgia', 'serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                // Colores Sunbiotan
                sunbiotan: {
                    50: '#fdfbf7',   // Crema muy claro
                    100: '#f9f5ed',  // Crema claro
                    200: '#f1e6d3',  // Beige suave
                    300: '#e5d4b5',  // Dorado claro
                    400: '#d4b989',  // Dorado medio
                    500: '#c19a5b',  // Dorado fuerte (principal)
                    600: '#a67c3d',  // Oro oscuro
                    700: '#7d5d2e',  // Marrón dorado
                    800: '#5a4321',  // Marrón
                    900: '#3d2e17',  // Marrón oscuro
                    950: '#1a130a',  // Casi negro
                },

                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                // ... resto de colores shadcn
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [],
} satisfies Config

export default config