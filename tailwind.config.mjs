/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Paleta cybernetyczna - surowa, terminalna
        terminal: {
          bg: '#0a0e14',
          surface: '#151a21',
          border: '#1f2937',
          text: '#e5e7eb',
          muted: '#6b7280',
          accent: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        // Kolory sprzężeń zgodnie z teorią Kosseckiego
        feedback: {
          positive: '#10b981', // Zielony - wzrost, wzmocnienie
          negative: '#ef4444', // Czerwony - hamowanie, stabilizacja
          neutral: '#6b7280',  // Szary - brak wpływu
        },
        // Kolory systemów sterowania
        control: {
          cognitive: '#3b82f6',    // Niebieski - System Poznawczy
          ideological: '#ef4444',  // Czerwony - System Ideologiczny (UWAGA)
          ethical: '#8b5cf6',      // Fioletowy - System Etyczny
          economic: '#f59e0b',     // Żółty - System Gospodarczy
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

