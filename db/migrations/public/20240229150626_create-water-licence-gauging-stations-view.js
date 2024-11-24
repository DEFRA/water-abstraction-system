'use strict'

const viewName = 'licence_gauging_stations'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('licence_gauging_stations').withSchema('water').select([
        'licence_gauging_station_id AS id',
        'licence_id',
        'gauging_station_id',
        'source',
        'licence_version_purpose_condition_id',
        'abstraction_period_start_day',
        'abstraction_period_start_month ',
        'abstraction_period_end_day',
        'abstraction_period_end_month',
        'restriction_type',
        'threshold_unit',
        'threshold_value',
        'status',
        'date_status_updated',
        'date_deleted',
        'alert_type',
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
