import type { HttpContext } from '@adonisjs/core/http'
import { PollValidator } from '#validators/poll'
import { PollService } from '#services/poll_service'

export default class PollsController {
  async index({ view, request }: HttpContext) {
    const polls = await PollService.handlePollIndex(request)

    return view.render('pages/index', { polls: polls })
  }

  async store({ request, response, session }: HttpContext) {
    const body = request.body()
    if (Array.isArray(body.options)) body.options.pop()

    const { name, options } = await request.validateUsing(PollValidator)
    let ownerUuid: string = request.cookie('owner_uuid')

    const poll = await PollService.savePoll(name, options, ownerUuid, response)

    session.flash('success', "Poll created successfully! Share the URL with you're fwends!")
    return response.redirect(`/poll/${poll.id}`)
  }

  async show({ params, view, request }: HttpContext) {
    const { poll, optionsWithPercentage } = await PollService.handlePollShow(params)

    return view.render('pages/show', {
      poll: {
        id: poll.id,
        name: poll.name,
        createdAt: poll.createdAt ? poll.createdAt.toFormat('dd-MM-yyyy HH:mm:ss') : 'N/A',
        options: optionsWithPercentage,
        owner: await PollService.valPollOwner(poll.ownerUuid, request.cookie('owner_uuid')),
      },
    })
  }

  async delete({ params, response, request }: HttpContext) {
    await PollService.handleDelete(params, response, request)

    //    session.flash('notification', {
    //      type: 'success',
    //      message: 'Poll deleted!',
    //    })

    return response.redirect('/')
  }

  async vote({ params, response, request }: HttpContext) {
    try {
      const result = await PollService.handleVote(params.pollId, params.optionId, response, request)

      if (!result) {
        return response.status(204)
      }

      const { poll, totalVotes, optionsWithPercentage } = result

      return response.status(200).json({
        pollId: params.pollId,
        pollName: poll.name,
        totalVotes,
        optionId: params.optionId,
        options: optionsWithPercentage,
      })
    } catch (error) {
      if (error.message === 'Too many votes from this IP') {
        return response.status(429).json({ message: error.message })
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({ message: 'Poll or option not found' })
      }

      return response.status(500).json({ message: 'Unexpected error occurred' })
    }
  }
}
