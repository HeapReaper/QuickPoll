console.log('Hello World')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/views/**/*.edge',
    './resources/js/**/*.js',
    './resources/js/**/*.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
