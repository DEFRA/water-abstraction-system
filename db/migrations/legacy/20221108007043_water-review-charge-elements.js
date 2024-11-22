'use strict'

const tableName = 'review_charge_elements'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('review_charge_reference_id').notNullable()
    table.uuid('charge_element_id').notNullable()
    // Specifying `null, null` creates a decimal column that can store numbers of any precision and scale
    table.decimal('allocated', null, null).notNullable().defaultTo(0)
    table.decimal('amended_allocated', null, null).notNullable().defaultTo(0)
    table.boolean('charge_dates_overlap').notNullable().defaultTo(false)
    table.text('issues')
    table.string('status').notNullable().defaultTo('ready')

    // Timestamps
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
