'use strict'

const viewName = 'charge_references'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('charge_elements').withSchema('water').select([
        'charge_element_id AS id',
        'charge_version_id',
        // 'external_id', // is not populated for SROC
        // 'abstraction_period_start_day', // is not populated for SROC
        // 'abstraction_period_start_month', // is not populated for SROC
        // 'abstraction_period_end_day', // is not populated for SROC
        // 'abstraction_period_end_month', // is not populated for SROC
        // 'authorised_annual_quantity', // is not populated for SROC
        // 'season',  // is not populated for SROC
        // 'season_derived', // is not populated for SROC
        'source',
        'loss',
        // 'factors_overridden', // is not populated for SROC
        'billable_annual_quantity',
        'time_limited_start_date',
        'time_limited_end_date',
        'description',
        // 'purpose_primary_id', // is not populated for SROC
        // 'purpose_secondary_id', // is not populated for SROC
        // 'purpose_use_id', // is not populated for SROC
        'is_section_127_agreement_enabled',
        'scheme',
        'is_restricted_source',
        'water_model',
        'volume',
        'billing_charge_category_id AS charge_category_id',
        'additional_charges',
        'adjustments',
        'is_section_126_agreement_enabled',
        'is_section_130_agreement_enabled',
        'eiuc_region',
        'is_test',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
