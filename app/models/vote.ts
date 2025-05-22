import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Option from '#models/option'

export default class Vote extends BaseModel {
  public static table: string = 'poll_votes'

  @column({ isPrimary: true })
  public id!: number

  @column()
  public optionId!: number

  @column()
  public count!: number

  @belongsTo(() => Option)
  public option!: BelongsTo<typeof Option>
}
