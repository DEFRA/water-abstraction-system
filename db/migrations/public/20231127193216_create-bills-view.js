'use strict'

const viewName = 'bills'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('billing_invoices')
        .withSchema('water')
        .select([
          'billing_invoice_id AS id',
          'invoice_account_id AS billing_account_id',
          'address',
          'invoice_account_number AS account_number',
          'net_amount',
          'is_credit AS credit',
          'billing_batch_id AS bill_run_id',
          'financial_year_ending',
          'invoice_number',
          'legacy_id',
          'metadata',
          'credit_note_value',
          'invoice_value',
          'is_de_minimis AS deminimis',
          'external_id',
          'is_flagged_for_rebilling AS flagged_for_rebilling',
          'original_billing_invoice_id AS original_bill_id',
          'rebilling_state',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
