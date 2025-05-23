import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'polls'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('owner_uuid')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('owner_uuid')
    })
  }
}
