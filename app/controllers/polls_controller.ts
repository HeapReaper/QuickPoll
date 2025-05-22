import type { HttpContext } from '@adonisjs/core/http'
import Poll from '#models/poll'
import Vote from '#models/vote'

export default class PollsController {
  async index({ view }: HttpContext) {
    return view.render('pages/create')
  }

  async store({ request, response, session }: HttpContext) {
    const { name, options } = request.only(['name', 'options'])

    const poll = await Poll.create({ name })

    for (const optionName of options) {
      const option = await poll.related('options').create({ name: optionName })
      await Vote.create({ optionId: option.id, count: 0 })
    }

    session.flash('success', "Poll created successfully! Share the URL with you're fwends!")
    return response.redirect(`/poll/${poll.id}`)
  }

  async show({ params, view }: HttpContext) {
    const poll = await Poll.query()
      .where('id', params.id)
      .preload('options', (query) => {
        query.preload('vote')
      })
      .firstOrFail()

    const totalVotes = poll.options.reduce((sum, option) => sum + (option.vote?.count ?? 0), 0)

    const optionsWithPercentage = poll.options.map(option => {
      const count = option.vote?.count ?? 0
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

      return {
        id: option.id,
        name: option.name,
        count,
        percentage,
      }
    })

    return view.render('pages/show', {
      poll: {
        id: poll.id,
        name: poll.name,
        options: optionsWithPercentage,
      },
    })
  }
}
