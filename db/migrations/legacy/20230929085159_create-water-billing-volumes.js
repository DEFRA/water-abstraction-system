'use strict'

const tableName = 'billing_volumes'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('billing_volume_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('charge_element_id').notNullable()
      table.integer('financial_year').notNullable()
      table.boolean('is_summer').notNullable()
      table.decimal('calculated_volume')
      table.boolean('two_part_tariff_error').notNullable().defaultTo(false)
      table.integer('two_part_tariff_status')
      table.jsonb('two_part_tariff_review')
      table.boolean('is_approved').notNullable().defaultTo(false)
      table.uuid('billing_batch_id').notNullable()
      table.decimal('volume')
      table.timestamp('errored_on')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
