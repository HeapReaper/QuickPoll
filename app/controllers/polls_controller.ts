import type { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'
import Poll from '#models/poll'
import Vote from '#models/vote'
import { v4 as uuidv4 } from 'uuid'

export default class PollsController {
  async index({ view }: HttpContext) {
    // TODO: Add validation

    const latestPollsRaw = await Poll.query()
      .orderBy('created_at', 'desc')
      .limit(5)
      .preload('options', (query) => {
        query.preload('vote')
      })

    const latestPolls = latestPollsRaw.map((poll) => {
      const totalVotes = poll.options.reduce((sum, option) => sum + (option.vote?.count ?? 0), 0)

      const optionsWithPercentage = poll.options.map((option) => {
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

    transmit.broadcast('global', { message: 'Hello' })

    return view.render('pages/index', { polls: latestPolls })
  }

  async store({ request, response, session }: HttpContext) {
    // TODO: Add validation

    const { name, options } = request.only(['name', 'options'])
    let ownerUuid: string = request.cookie('owner_uuid')

    if (!ownerUuid) {
      ownerUuid = uuidv4()
      response.cookie('owner_uuid', `${ownerUuid}`, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days.
      })
    }

    const poll = await Poll.create({ name, ownerUuid })

    for (const optionName of options) {
      const option = await poll.related('options').create({ name: optionName })
      await Vote.create({ optionId: option.id, count: 0 })
    }

    session.flash('success', "Poll created successfully! Share the URL with you're fwends!")
    return response.redirect(`/poll/${poll.id}`)
  }

  async show({ params, view, request }: HttpContext) {
    // TODO: Add validation

    const poll: Poll = await Poll.query()
      .where('id', params.id)
      .preload('options', (query) => {
        query.preload('vote')
      })
      .firstOrFail()

    const totalVotes: number = poll.options.reduce(
      (sum, option) => sum + (option.vote?.count ?? 0),
      0
    )

    const optionsWithPercentage = poll.options.map((option) => {
      const count: number = option.vote?.count ?? 0
      const percentage: number = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

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
        owner: this.validateOwnerShipByCookie(poll.ownerUuid, request.cookie('owner_uuid')),
      },
    })
  }

  async delete({ params, response, request, session }: HttpContext) {
    // TODO: Add validation

    const poll = await Poll.query().where('id', params.id).firstOrFail()

    if (!this.validateOwnerShipByCookie(poll.ownerUuid, request.cookie('owner_uuid'))) {
      return response.redirect().back()
    }
    await poll.delete()

    session.flash('success', 'Poll deleted!')
    return response.redirect('/')
  }

  async vote({ params, session, response, request }: HttpContext) {
    // TODO: Add validation
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

    // TODO: Fix duplicate code
    const poll: Poll = await Poll.query()
      .where('id', pollId)
      .preload('options', (query) => {
        query.preload('vote')
      })
      .firstOrFail()

    const totalVotes: number = poll.options.reduce(
      (sum, option) => sum + (option.vote?.count ?? 0),
      0
    )

    const optionsWithPercentage = poll.options.map((option) => {
      const count: number = option.vote?.count ?? 0
      const percentage: number = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

      return {
        id: option.id,
        name: option.name,
        count,
        percentage,
      }
    })

    transmit.broadcast('poll-updated', {
      pollId,
      pollName: poll.name,
      totalVotes,
      options: optionsWithPercentage,
    })

    response.cookie(`voted_poll_${pollId}`, optionId, {
      httpOnly: true,
      maxAge: '7d',
    })

    session.flash('success', 'Your vote has been updated!')
    return response.json({
      pollId,
      pollName: poll.name,
      totalVotes,
      optionId,
      options: optionsWithPercentage,
    })
  }

  validateOwnerShipByCookie(ownerUuid: string, cookieOwnerUuid: string): boolean {
    // TODO: add validation
    if (ownerUuid === undefined || cookieOwnerUuid === undefined) return false
    return ownerUuid.toLowerCase() === cookieOwnerUuid.toLowerCase()
  }
}
