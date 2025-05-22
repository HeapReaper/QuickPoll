import type { HttpContext } from '@adonisjs/core/http'
import Poll from '#models/poll'
import Vote from '#models/vote'

export default class PollsController {
  async index({ view }: HttpContext) {
    const latestPollsRaw = await Poll.query()
      .orderBy('created_at', 'desc')
      .limit(5)
      .preload('options', (query) => {
        query.preload('vote')
      })

    const latestPolls = latestPollsRaw.map(poll => {
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

      return {
        id: poll.id,
        name: poll.name,
        options: optionsWithPercentage,
      }
    })

    return view.render('pages/create', { polls: latestPolls })
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

  async show({ params, view, session }: HttpContext) {
    const poll: Poll = await Poll.query()
      .where('id', params.id)
      .preload('options', (query) => {
        query.preload('vote')
      })
      .firstOrFail()

    const totalVotes: number = poll.options.reduce((sum, option) => sum + (option.vote?.count ?? 0), 0)

    const optionsWithPercentage = poll.options.map(option => {
      const count: number = option.vote?.count ?? 0
      const percentage: number = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

      return {
        id: option.id,
        name: option.name,
        count,
        percentage,
      }
    })

    session.flash('success', 'Poll created successfully!')
    return view.render('pages/show', {
      poll: {
        id: poll.id,
        name: poll.name,
        options: optionsWithPercentage,
      },
    })
  }

  async vote({ params, session, response, request }: HttpContext) {
    const { pollId, optionId } = params

    const newVote: Vote = await Vote.findByOrFail('id', optionId)
    const previousOptionId = request.cookie(`voted_poll_${pollId}`)

    if (previousOptionId) {
      if (Number.parseInt(previousOptionId) === Number.parseInt(optionId)) {
        session.flash('error', 'You already voted for this option.')
        return response.redirect().back()
      }

      const previousVote = await Vote.find(previousOptionId)
      if (previousVote) {
        previousVote.count = Math.max(0, previousVote.count - 1)
        await previousVote.save()
      }
    }

    newVote.count += 1
    await newVote.save()

    response.cookie(`voted_poll_${pollId}`, optionId, {
      httpOnly: true,
      maxAge: '7d',
    })

    session.flash('success', 'Your vote has been updated!')
    return response.redirect().back()
  }
}
