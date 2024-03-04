'use strict'

const viewName = 'gauging_stations'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      view.as(knex('gauging_stations').withSchema('water').select([
        'label',
        'lat',
        'long',
        'easting',
        'northing',
        'grid_reference',
        'catchment_name ',
        'river_name',
        'wiski_id',
        'station_reference',
        'status',
        'metadata',
        'gauging_station_id',
        'hydrology_station_id',
        'date_created AS created_at',
        'date_updated AS updated_at',
        'is_test'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
