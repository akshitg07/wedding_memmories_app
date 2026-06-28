import type { Config } from 'tailwindcss';
export default { darkMode:'class', content:['./src/**/*.{ts,tsx}'], theme:{extend:{colors:{roseGold:'#d6a37c',ink:'#111827'},boxShadow:{glow:'0 20px 70px rgba(214,163,124,.28)'}}}, plugins:[] } satisfies Config;
