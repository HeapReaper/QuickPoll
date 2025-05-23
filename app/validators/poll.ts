import vine from '@vinejs/vine'

export const PollValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    options: vine.array(vine.string().trim().minLength(1).maxLength(255)).minLength(2),
  })
)
