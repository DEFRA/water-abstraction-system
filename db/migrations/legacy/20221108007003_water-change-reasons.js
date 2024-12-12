'use strict'

const tableName = 'change_reasons'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('change_reason_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('description').notNullable()
    table.boolean('triggers_minimum_charge').notNullable().defaultTo(false)
    table.string('type').notNullable()
    table.boolean('is_enabled_for_new_charge_versions').notNullable()

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable()
    table.timestamp('date_updated', { useTz: false })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
