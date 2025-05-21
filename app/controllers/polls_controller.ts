import type { HttpContext } from '@adonisjs/core/http'

export default class PollsController {
  public async index({ view }: HttpContext) {
    return view.render('pages/poll')
  }
}
