import { jokulPreset } from '@fremtind/jokul/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    presets: [jokulPreset],
};