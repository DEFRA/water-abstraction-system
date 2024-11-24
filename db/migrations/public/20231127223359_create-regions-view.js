'use strict'

const viewName = 'regions'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('regions').withSchema('water').select([
        'region_id AS id',
        'charge_region_id',
        'nald_region_id',
        'name',
        'display_name',
        // 'is_test',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
