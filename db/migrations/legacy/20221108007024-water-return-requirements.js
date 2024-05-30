'use strict'

const tableName = 'return_requirements'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('return_requirement_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('return_version_id').notNullable()
      table.string('returns_frequency').notNullable()
      table.boolean('is_summer').notNullable()
      table.boolean('is_upload').notNullable()
      table.smallint('abstraction_period_start_day')
      table.smallint('abstraction_period_start_month')
      table.smallint('abstraction_period_end_day')
      table.smallint('abstraction_period_end_month')
      table.string('site_description')
      table.string('description')
      table.integer('legacy_id')
      table.string('external_id')
      table.string('collection_frequency')
      table.boolean('gravity_fill')
      table.boolean('reabstraction')
      table.boolean('two_part_tariff')
      table.boolean('fifty_six_exception')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable()
      table.timestamp('date_updated', { useTz: false })

      // Constraints
      table.unique(['external_id'], { useConstraint: true })
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
