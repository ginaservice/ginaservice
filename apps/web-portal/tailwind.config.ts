import type {Config} from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gina: {
          bg: '#09090b',
          panel: '#121217',
          border: '#27272a',
          accent: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          danger: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}

export default config
