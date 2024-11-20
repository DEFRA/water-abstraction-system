'use strict'

const tableName = 'review_returns'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('review_licence_id').notNullable()
      table.string('return_id').notNullable()
      table.string('return_reference').notNullable()
      // Specifying `null, null` creates a decimal column that can store numbers of any precision and scale
      table.decimal('quantity', null, null).notNullable().defaultTo(0)
      table.decimal('allocated', null, null).notNullable().defaultTo(0)
      table.boolean('under_query').notNullable().defaultTo(false)
      table.string('return_status').notNullable()
      table.boolean('nil_return').notNullable().defaultTo(false)
      table.boolean('abstraction_outside_period').notNullable().defaultTo(false)
      table.date('received_date')
      table.date('due_date').notNullable()
      table.jsonb('purposes')
      table.string('description')
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.text('issues')

      // Timestamps
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
