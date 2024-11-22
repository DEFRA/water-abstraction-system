'use strict'

exports.up = function (knex) {
  return knex.schema
    .dropViewIfExists('licence_monitoring_stations')
    .createView('licence_monitoring_stations', (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(
        knex('licence_gauging_stations').withSchema('water').select([
          'licence_gauging_station_id AS id',
          'licence_id',
          'gauging_station_id AS monitoring_station_id',
          'source',
          'licence_version_purpose_condition_id',
          'abstraction_period_start_day',
          'abstraction_period_start_month ',
          'abstraction_period_end_day',
          'abstraction_period_end_month',
          'restriction_type AS measure_type',
          'threshold_unit',
          'threshold_value',
          'status',
          'date_status_updated AS status_updated_at',
          'date_deleted AS deleted_at',
          'alert_type AS restriction_type',
          // 'is_test',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
      )
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropViewIfExists('licence_monitoring_stations')
    .createView('licence_monitoring_stations', (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(
        knex('licence_gauging_stations').withSchema('water').select([
          'licence_gauging_station_id AS id',
          'licence_id',
          'gauging_station_id AS monitoring_station_id',
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
          'date_status_updated AS status_updated_at',
          'date_deleted AS deleted_at',
          'alert_type',
          // 'is_test',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
      )
    })
}
