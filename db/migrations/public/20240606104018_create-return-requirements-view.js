'use strict'

const viewName = 'return_requirements'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('return_requirements')
        .withSchema('water')
        .select([
          'return_requirement_id AS id',
          'return_version_id',
          'returns_frequency',
          'is_summer AS summer',
          'is_upload AS upload',
          'abstraction_period_start_day',
          'abstraction_period_start_month',
          'abstraction_period_end_day',
          'abstraction_period_end_month',
          'site_description',
          'legacy_id',
          'external_id',
          'reporting_frequency',
          'collection_frequency',
          'gravity_fill',
          'reabstraction',
          'two_part_tariff',
          'fifty_six_exception',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
