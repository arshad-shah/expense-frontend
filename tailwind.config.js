/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
const content = [
  "./src/**/*.{js,ts,jsx,tsx}",
];
const theme = {
  extend: {
    colors: {
      primary: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
      },
      secondary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
      },
      background: {
        light: '#f5f3ff',
        DEFAULT: '#ffffff',
        dark: '#1f2937',
      },
    },
    backgroundImage: {
      'gradient-primary': 'linear-gradient(to right, var(--tw-gradient-stops))',
      'gradient-background': 'linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to))',
    },
    gradientColorStops: {
      'from-primary': '#6d28d9',
      'via-primary': '#7c3aed',
      'to-secondary': '#c026d3',
    },
  },
};
const plugins = [
  forms,
];

export default {
  content,
  theme,
  plugins,
};