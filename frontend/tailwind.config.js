import daisyui from "daisyui";

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // important!
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
};
