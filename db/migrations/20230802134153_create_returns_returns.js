'use strict'

const tableName = 'returns'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('returns')
    .createTable(tableName, table => {
      // Primary Key
      table.string('return_id').primary()

      // Data
      table.string('regime')
      table.string('licence_type')
      table.string('licence_ref')
      table.date('start_date')
      table.date('end_date')
      table.string('returns_frequency')
      table.string('status')
      table.string('source')
      table.jsonb('metadata')
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.date('received_date')
      table.string('return_requirement')
      table.date('due_date')
      table.boolean('under_query')
      table.string('under_query_comment')
      table.boolean('is_test')
      table.uuid('return_cycle_id')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('returns')
    .dropTableIfExists(tableName)
}
