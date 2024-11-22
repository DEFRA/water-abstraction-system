'use strict'

const viewName = 'charge_references'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('charge_elements').withSchema('water').select([
        'charge_element_id AS id',
        'charge_version_id',
        'external_id',
        'abstraction_period_start_day',
        'abstraction_period_start_month',
        'abstraction_period_end_day',
        'abstraction_period_end_month',
        'authorised_annual_quantity',
        'season',
        'season_derived',
        'source',
        'loss',
        'factors_overridden',
        'billable_annual_quantity',
        'time_limited_start_date',
        'time_limited_end_date',
        'description',
        // 'is_test',
        'purpose_primary_id',
        'purpose_secondary_id',
        'purpose_use_id AS purpose_id',
        'is_section_127_agreement_enabled AS section_127_agreement',
        'scheme',
        'is_restricted_source AS restricted_source',
        'water_model',
        'volume',
        'billing_charge_category_id AS charge_category_id',
        'additional_charges',
        'adjustments',
        'is_section_126_agreement_enabled AS section_126_agreement',
        'is_section_130_agreement_enabled AS section_130_agreement',
        'eiuc_region',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
