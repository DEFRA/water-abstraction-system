'use strict'

const tableName = 'review_charge_references'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('review_charge_version_id').notNullable()
    table.uuid('charge_reference_id').notNullable()
    // Specifying `null, null` creates a decimal column that can store numbers of any precision and scale
    table.decimal('aggregate', null, null).notNullable().defaultTo(1)
    table.decimal('amended_aggregate', null, null).notNullable().defaultTo(1)
    table.decimal('authorised_volume', null, null).notNullable().defaultTo(0)
    table.decimal('amended_authorised_volume', null, null).notNullable().defaultTo(0)
    table.decimal('charge_adjustment', null, null).notNullable().defaultTo(1)
    table.decimal('amended_charge_adjustment', null, null).notNullable().defaultTo(1)
    table.decimal('abatement_agreement', null, null).notNullable().defaultTo(1)
    table.boolean('winter_discount').notNullable().defaultTo(false)
    table.boolean('two_part_tariff_agreement').notNullable().defaultTo(false)
    table.boolean('canal_and_river_trust_agreement').notNullable().defaultTo(false)

    // Timestamps
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
