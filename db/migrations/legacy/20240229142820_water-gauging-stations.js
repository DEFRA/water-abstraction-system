'use strict'

const tableName = 'gauging_stations'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('gauging_station_id').primary()

      // Data
      table.string('label').notNullable()
      table.decimal('lat').notNullable()
      table.decimal('long').notNullable()
      table.integer('easting')
      table.integer('northing')
      table.string('grid_reference').notNullable()
      table.string('catchment_name')
      table.string('river_name')
      table.string('wiski_id')
      table.string('station_reference')
      table.string('status')
      table.jsonb('metadata')
      table.uuid('hydrology_station_id').notNullable()
      table.boolean('is_test')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
