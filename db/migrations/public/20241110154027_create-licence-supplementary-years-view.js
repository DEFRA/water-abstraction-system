'use strict'

const viewName = 'licence_supplementary_years'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('licence_supplementary_years')
        .withSchema('water')
        .select([
          'id',
          'licence_id',
          'bill_run_id',
          'financial_year_end',
          'two_part_tariff',
          'created_at',
          'updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
