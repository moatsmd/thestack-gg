import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Ensure good tap targets for mobile
      minHeight: {
        'tap': '48px',
      },
      minWidth: {
        'tap': '48px',
      },
    },
  },
  plugins: [],
};
export default config;
