import vine from '@vinejs/vine'

export const pollOwnershipValidator = vine.compile(
  vine.object({
    ownerUuid: vine.string().uuid(),
    cookieOwnerUuid: vine.string().uuid(),
  })
)
