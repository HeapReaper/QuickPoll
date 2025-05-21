import vine from '@vinejs/vine'

export const createPollValidator = vine.compile(
  vine.object({
    question: vine.string().trim().minLength(6),
    options: vine.array()
  })
)
