'use strict'

const viewName = 'bill_run_volumes'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('billing_volumes').withSchema('water').select([
        'billing_volume_id AS id',
        'charge_element_id AS charge_reference_id',
        'financial_year',
        'is_summer AS summer',
        'calculated_volume',
        'two_part_tariff_error',
        'two_part_tariff_status',
        'two_part_tariff_review',
        'is_approved AS approved',
        'billing_batch_id AS bill_run_id',
        'volume'
        // 'errored_on'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
