import { Transmit } from '@adonisjs/transmit-client'
import { Alpine } from 'alpinejs'

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

export const transmit = new Transmit({
  baseUrl: window.location.origin,
})

async function initSubscription() {
  const subscription = transmit.subscription('poll-updated')

  try {
    await subscription.create()
    console.log('WebSocket subscription created')
  } catch (err) {
    console.error('Failed to create subscription:', err)
  }

  subscription.onMessage((message) => {
    console.log('Received message over WebSocket:', message)
    updatePollUI(message)
  })

}

void initSubscription()

document.querySelectorAll('form[data-option-id]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const action = form.action
  const csrfToken = form.querySelector('input[name="_csrf"]')?.value

  try {
    const response = await fetch(action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      throw new Error('Failed to vote')
    }

    // Assume server returns updated poll state in response JSON
    const updatedPoll = await response.json()

    // Update UI immediately
    updatePollUI(updatedPoll)
    console.log('updatePollUI')
  } catch (error) {
    console.error(error)
  }
})
});

function updatePollUI(message) {
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
}
