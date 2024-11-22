'use strict'

const viewName = 'licence_version_purpose_points'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('licence_version_purpose_points')
        .withSchema('water')
        .select([
          'id',
          'licence_version_purpose_id',
          'point_id',
          'external_id',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('licence_version_purpose_points')
        .withSchema('water')
        .select([
          'id',
          'licence_version_purpose_id',
          'description',
          'ngr_1',
          'ngr_2',
          'ngr_3',
          'ngr_4',
          'external_id',
          'nald_point_id',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}
