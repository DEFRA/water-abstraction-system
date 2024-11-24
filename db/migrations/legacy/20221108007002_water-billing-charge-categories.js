'use strict'

const tableName = 'billing_charge_categories'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('billing_charge_category_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('reference').notNullable().unique()
    table.integer('subsistence_charge').notNullable()
    table.string('description').notNullable()
    table.string('short_description').notNullable()
    table.boolean('is_tidal').defaultTo(false)
    table.string('loss_factor')
    table.string('model_tier')
    table.boolean('is_restricted_source').defaultTo(false)
    table.bigInteger('min_volume').notNullable().defaultTo(0)
    table.bigInteger('max_volume').notNullable().defaultTo(0)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable()
    table.timestamp('date_updated', { useTz: false })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
