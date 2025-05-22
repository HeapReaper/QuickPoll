import { Transmit } from '@adonisjs/transmit-client'
import { Alpine } from 'alpinejs'

export const transmit = new Transmit({
  baseUrl: window.location.origin,
})

async function initSubscription() {
  const subscription = transmit.subscription('poll-updated')
  await subscription.create()

  subscription.onMessage((message) => {
    console.log(`Poll updated`)

    const pollSection = document.querySelector('section[data-poll-id="' + message.pollId + '"]')
    if (!pollSection) return

    message.options.forEach(option => {
      const form = pollSection.querySelector(`form[data-option-id="${option.id}"]`)
      if (!form) return

      const optionEl = form.querySelector('button > div')
      if (!optionEl) return

      const barEl = optionEl.querySelector('.poll-bar')
      if (barEl) {
        if (option.percentage > 0) {
          barEl.style.width = `${option.percentage}%`
          barEl.style.display = 'block'
        } else {
          barEl.style.display = 'none'
        }
      }

      const textEl = optionEl.querySelector('.poll-label')
      if (textEl) {
        textEl.textContent = `${option.name} (${option.percentage}%)`
      }
    })
  })
}

void initSubscription()

window.Alpine = Alpine
Alpine.start()

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
