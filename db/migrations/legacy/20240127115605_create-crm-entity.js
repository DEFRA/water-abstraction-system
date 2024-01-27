'use strict'

const tableName = 'entity'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('crm')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('entity_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('entity_nm').notNullable()
      table.string('entity_type').notNullable()
      table.jsonb('entity_definition')
      table.string('source')

      // Legacy timestamps
      // NOTE: They are not automatically set and there are large numbers of records where these fields are null!
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Constraints
      table.unique(['entity_id', 'entity_nm', 'entity_type'], { useConstraint: true })
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('crm')
    .dropTableIfExists(tableName)
}
