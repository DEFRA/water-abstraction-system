'use strict'

const tableName = 'gauging_stations'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('gauging_station_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('label').notNullable()
    table.decimal('lat')
    table.decimal('long')
    table.integer('easting')
    table.integer('northing')
    table.string('grid_reference')
    table.string('catchment_name')
    table.string('river_name')
    table.string('wiski_id')
    table.string('station_reference')
    table.string('status')
    table.jsonb('metadata')
    table.uuid('hydrology_station_id').notNullable()
    table.boolean('is_test').defaultTo(false)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false })
    table.timestamp('date_updated', { useTz: false })

    // Constraints
    table.unique(['hydrology_station_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
