'use strict'

const tableName = 'licence_version_purpose_conditions'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('licence_version_purpose_condition_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('licence_version_purpose_id').notNullable()
    table.uuid('licence_version_purpose_condition_type_id').notNullable()
    table.string('param_1')
    table.string('param_2')
    table.string('notes')
    table.string('external_id').notNullable()
    table.string('source').notNullable()

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['external_id'])
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
