'use strict'

const viewName = 'permit_licences'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('licence')
        .withSchema('permit')
        .select([
          'licence_id AS id',
          'licence_status_id',
          'licence_type_id',
          'licence_regime_id',
          'licence_search_key',
          'is_public_domain AS public_domain',
          'licence_start_dt AS start_date ',
          'licence_end_dt AS end_date',
          'licence_ref',
          'licence_data_value',
          'licence_summary',
          'metadata',
          'date_licence_version_purpose_conditions_last_copied',
          'date_gauging_station_links_last_copied'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
