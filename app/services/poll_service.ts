import Poll from '#models/poll'
import Vote from '#models/vote'
import { Request, Response } from '@adonisjs/http-server'
import { v4 as uuidv4 } from 'uuid'
import transmit from '@adonisjs/transmit/services/main'
import redis from '@adonisjs/redis/services/main'

export class PollService {
  static async handlePollIndex(request: Request) {
    const page = request.input('page', 1)
    const latestPollsRaw = await Poll.query()
      .orderBy('id', 'desc')
      .preload('options', (query) => {
        query.preload('vote')
      })
      .paginate(page, 5)

    return latestPollsRaw.map((poll) => {
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
        // @ts-ignore
        createdAt: poll.createdAt ? poll.createdAt.toFormat('dd-MM-yyyy HH:mm:ss') : 'N/A',
        options: optionsWithPercentage,
      }
    })
  }

  static async savePoll(name: string, options: any, ownerUuid: string, response: Response) {
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

    return poll
  }

  static async handlePollShow(params: Record<string, any>) {
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

    return {
      poll,
      optionsWithPercentage,
    }
  }

  static async handleDelete(params: Record<string, any>, response: Response, request: Request) {
    const poll = await Poll.query().where('id', params.id).firstOrFail()

    if (!(await this.valPollOwner(poll.ownerUuid, request.cookie('owner_uuid')))) {
      return response.redirect().back()
    }
    await poll.delete()
  }

  static async handleVote(pollId: number, optionId: number, response: any, request: Request) {
    const newVote: Vote = await Vote.findByOrFail('id', optionId)
    const previousOptionId = request.cookie(`voted_poll_${pollId}`)

    const redisKey = `poll_votes:${pollId}:${request.ip()}`
    const maxVotesPerIP = 5

    const currentVotes = await redis.incr(redisKey)
    if (currentVotes === 1) {
      await redis.expire(redisKey, 60 * 30)
    }

    if (currentVotes > maxVotesPerIP) {
      return response.status(429).send('Too many votes from this IP')
    }

    if (previousOptionId && optionId === Number(previousOptionId)) {
      return response.redirect().back()
    }

    if (previousOptionId) {
      const previousVote = await Vote.find(previousOptionId)
      if (previousVote) {
        previousVote.count = Math.max(0, previousVote.count - 1)
        await previousVote.save()
      }
    }

    newVote.count += 1
    await newVote.save()

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

    return {
      poll,
      totalVotes,
      optionsWithPercentage,
    }
  }


  static async valPollOwner(ownerUuid: string, cookieOwnerUuid: string): Promise<boolean> {
    if (ownerUuid === undefined || cookieOwnerUuid === undefined) return false

    return ownerUuid.toLowerCase() === cookieOwnerUuid.toLowerCase()
  }
}
