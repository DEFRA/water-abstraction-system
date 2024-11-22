'use strict'

const tableName = 'entity'

exports.up = function (knex) {
  return knex.schema.withSchema('crm').createTable(tableName, (table) => {
    // Data
    table.string('entity_id').notNullable()
    table.string('entity_nm').notNullable()
    table.string('entity_type').notNullable()
    table.jsonb('entity_definition')
    table.string('source')

    // Legacy timestamps
    // NOTE: They are not automatically set
    table.timestamp('created_at')
    table.timestamp('updated_at')

    // Primary Key
    // NOTE: It is not entity_id. The primary key is made up of all these columns
    table.primary(['entity_id', 'entity_nm', 'entity_type'])
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm').dropTableIfExists(tableName)
}
