import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Option from '#models/option'
import { DateTime } from 'luxon'

export default class Vote extends BaseModel {
  public static table: string = 'poll_votes'

  @column({ isPrimary: true })
  public id!: number

  @column()
  public optionId!: number

  @column()
  public count!: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Option)
  public option!: BelongsTo<typeof Option>
}
