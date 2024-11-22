'use strict'

const viewName = 'bill_run_charge_version_years'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('billing_batch_charge_version_years')
        .withSchema('water')
        .select([
          'billing_batch_charge_version_year_id AS id',
          'billing_batch_id AS bill_run_id',
          'charge_version_id',
          'financial_year_ending',
          'status',
          'transaction_type AS batch_type',
          'is_summer AS summer',
          'has_two_part_agreement AS two_part_agreement',
          'is_chargeable AS chargeable',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
