'use strict'

const tableName = 'return_requirement_purposes'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('return_requirement_purpose_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('return_requirement_id').notNullable()
    table.uuid('purpose_primary_id').notNullable()
    table.uuid('purpose_secondary_id').notNullable()
    table.uuid('purpose_use_id').notNullable()
    table.string('purpose_alias')
    table.string('external_id')

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['external_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
