import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#0f1117',
          grid: '#374151',
          border: '#1f2937',
        },
        panel: {
          bg: '#111827',
          border: '#1f2937',
          hover: '#1f2937',
        },
        header: {
          bg: '#0a0d14',
          border: '#1f2937',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
