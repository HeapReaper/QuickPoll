import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('username').nullable()
      table.string('reset_token').nullable()
    })
  }

  async down() {
    //
  }
}
