/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'caveat': ['Caveat', 'cursive'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'bounce-smooth': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(192, 57, 43, 0.8)' },
                    '50%': { boxShadow: '0 0 20px rgba(192, 57, 43, 1)' },
                },
            },
            animation: {
                shake: 'shake 0.5s ease-in-out 1',
                fadeIn: 'fadeIn 0.3s ease-out forwards',
                slideUp: 'slideUp 0.4s ease-out forwards',
                'bounce-smooth': 'bounce-smooth 2s ease-in-out infinite',
                'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
            },
            boxShadow: {
                'glow-red': '0 0 10px rgba(192, 57, 43, 0.8)',
                'glow-red-lg': '0 0 20px rgba(192, 57, 43, 1)',
                'glow-green': '0 0 10px rgba(39, 174, 96, 0.6)',
                'glow-gold': '0 0 15px rgba(212, 160, 23, 0.7)',
            },
        },
    },
    plugins: [],
};
