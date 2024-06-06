'use strict'

const tableName = 'financial_agreement_types'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('financial_agreement_type_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('financial_agreement_code')
      table.string('description')
      table.boolean('disabled')
      table.boolean('is_test')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

      // Constraints
      table.unique(['financial_agreement_code'])
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
