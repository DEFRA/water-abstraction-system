'use strict'

const tableName = 'purposes_uses'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('purpose_use_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('legacy_id').notNullable().unique()
    table.string('description').notNullable()
    table.string('loss_factor').notNullable()
    table.boolean('is_two_part_tariff').notNullable().defaultTo(false)
    table.boolean('is_test').notNullable().defaultTo(false)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
