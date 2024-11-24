'use strict'

const viewName = 'transactions'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('billing_transactions').withSchema('water').select([
        'billing_transaction_id AS id',
        'billing_invoice_licence_id as bill_licence_id',
        'charge_element_id AS charge_reference_id',
        'start_date',
        'end_date',
        'abstraction_period',
        'source',
        'season',
        'loss',
        'net_amount',
        'is_credit AS credit',
        'charge_type',
        'authorised_quantity',
        'billable_quantity',
        'authorised_days',
        'billable_days',
        'status',
        'description',
        'external_id',
        'volume',
        'section_126_factor',
        'section_127_agreement',
        'section_130_agreement',
        'is_de_minimis AS deminimis',
        'is_new_licence AS new_licence',
        'legacy_id',
        'metadata',
        'source_transaction_id',
        'calc_source_factor',
        'calc_season_factor',
        'calc_loss_factor',
        'calc_suc_factor',
        'calc_s_126_factor',
        'calc_s_127_factor',
        'calc_eiuc_factor',
        'calc_eiuc_source_factor',
        'is_credited_back AS credited_back',
        'is_two_part_second_part_charge AS second_part_charge',
        'scheme',
        'aggregate_factor',
        'adjustment_factor',
        'charge_category_code',
        'charge_category_description',
        'is_supported_source AS supported_source',
        'supported_source_name',
        'is_water_company_charge AS water_company_charge',
        'is_winter_only AS winter_only',
        'is_water_undertaker AS water_undertaker',
        'purposes',
        'gross_values_calculated',
        // 'winter_discount_factor',
        // 'calc_adjustment_factor',
        'calc_winter_discount_factor',
        'calc_s_130_factor',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
