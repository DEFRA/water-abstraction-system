'use strict'

const viewName = 'points'

exports.up = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
    .createView(viewName, (view) => {
      view.as(knex('points').withSchema('water').select([
        'id',
        'description',
        'ngr_1',
        'ngr_2',
        'ngr_3',
        'ngr_4',
        'source_id',
        'category',
        'primary_type',
        'secondary_type',
        'note',
        'location_note',
        'depth',
        'bgs_reference',
        'well_reference',
        'hydro_reference',
        'hydro_intercept_distance',
        'hydro_offset_distance',
        'external_id',
        'created_at',
        'updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
