import { Alpine } from 'alpinejs'
import * as Turbo from '@hotwired/turbo'

window.Alpine = Alpine
Alpine.start()

window.Turbo = Turbo

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

