import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Option from '#models/option'

export default class Poll extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public name!: string

  @hasMany(() => Option)
  public options!: HasMany<typeof Option>
}
