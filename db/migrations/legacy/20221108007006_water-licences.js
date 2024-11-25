'use strict'

const tableName = 'licences'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('licence_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('region_id').notNullable()
    table.string('licence_ref').notNullable().unique()
    table.boolean('is_water_undertaker').notNullable()
    table.jsonb('regions').notNullable()
    table.date('start_date').notNullable()
    table.date('expired_date')
    table.date('lapsed_date')
    table.date('revoked_date')
    table.boolean('suspend_from_billing').notNullable().defaultTo(false)
    table.boolean('is_test').notNullable().defaultTo(false)
    table.string('include_in_supplementary_billing').notNullable().defaultTo('no')
    table.boolean('include_in_sroc_supplementary_billing').notNullable().defaultTo(false)
    table.boolean('include_in_sroc_tpt_supplementary_billing').notNullable().defaultTo(false)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
