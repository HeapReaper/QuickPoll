import { Transmit } from '@adonisjs/transmit-client'

export const transmit = new Transmit({
  baseUrl: window.location.origin,
})

async function initSubscription() {
  const subscription = transmit.subscription('poll-updated')

  try {
    await subscription.create()
  } catch (err) {
    console.error('Failed to create WebSocket subscription:', err)
  }

  subscription.onMessage((message) => {
    updatePollUI(message)
  })
}

initSubscription().catch((err) => console.error(err))

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
      barEl.style.display = option.count > 0 ? 'block' : 'none'
      barEl.style.width = option.count > 0 ? `${option.percentage}%` : '0'
    }

    const textEl = optionEl.querySelector('.poll-label')
    if (textEl) {
      textEl.textContent = `${option.name} (${option.percentage}%) / ${option.count} vote(s)`
    }
  })
}

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
        body: JSON.stringify({
        }),
      })

      if (!response.ok) {
        console.error('Failed to vote!')
      }

    } catch (error) {
      console.error(error)
    }
  })
});
