import type { HttpContext } from '@adonisjs/core/http'
import Poll from '../models/poll'

export default class PollsController {
  async index({ view }: HttpContext) {
    return view.render('pages/poll')
  }

  async create({}: HttpContext) {
  }

  async store({ request }: HttpContext) {
    const data: { name: string; options: array } = request.only(['name', 'options'])

    await Poll.create({
      name: data.name,

    })

    return data.name
  }

  async show({ params }: HttpContext) {}

  async edit({ params }: HttpContext) {}

  async update({ params, request }: HttpContext) {}

  async destroy({ params }: HttpContext) {}
}
