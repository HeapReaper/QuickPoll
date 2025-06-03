import vine from '@vinejs/vine'

export const newVoteValidator = vine.compile(
  vine.object({
    pollId: vine.number(),
    optionId: vine.number(),
  })
)
