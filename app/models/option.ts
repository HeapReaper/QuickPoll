import type { HasOne, BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, hasOne, belongsTo } from '@adonisjs/lucid/orm'
import Poll from '#models/poll'
import Vote from '#models/vote'

export default class Option extends BaseModel {
  public static table: string = 'poll_options'

  @column({ isPrimary: true })
  public id!: number

  @column()
  public pollId!: number

  @column()
  public name!: string

  @belongsTo(() => Poll)
  public poll!: BelongsTo<typeof Poll>

  @hasOne(() => Vote)
  public vote!: HasOne<typeof Vote>
}
