const viewName = 'gauging_stations'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('gauging_stations').withSchema('water').select([
        'gauging_station_id AS id',
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
        'hydrology_station_id',
        // 'is_test'
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
