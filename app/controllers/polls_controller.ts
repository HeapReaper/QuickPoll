import type { HttpContext } from '@adonisjs/core/http'
import Poll from '#models/poll'
import Vote from '#models/vote'
import session from '#config/session'

export default class PollsController {
  async index({ view }: HttpContext) {
    return view.render('pages/poll')
  }

  async create({}: HttpContext) {
  }

  async store({ request }: HttpContext) {
    const { name, options } = request.only(['name', 'options'])

    const poll = await Poll.create({ name })

    for (const optionName of options) {
      const option = await poll.related('options').create({ name: optionName })
      await Vote.create({ optionId: option.id, count: 0 })
    }

    session.flash('success', 'Poll created successfully!')
    return response.redirect().back()
  }

  async show({ params }: HttpContext) {}

  async edit({ params }: HttpContext) {}

  async update({ params, request }: HttpContext) {}

  async destroy({ params }: HttpContext) {}
}
