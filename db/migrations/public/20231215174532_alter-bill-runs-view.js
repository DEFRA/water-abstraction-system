'use strict'

const viewName = 'bill_runs'

exports.up = function (knex) {
  return knex.schema.dropView(viewName).createView(viewName, (view) => {
    view.as(
      knex('billing_batches')
        .withSchema('water')
        .select([
          'billing_batch_id AS id',
          'region_id',
          'batch_type',
          'from_financial_year_ending',
          'to_financial_year_ending',
          'status',
          'invoice_count',
          'credit_note_count',
          'net_total',
          'bill_run_number',
          'error_code',
          'external_id',
          'is_summer AS summer',
          'source',
          'legacy_id',
          'metadata',
          'invoice_value',
          'credit_note_value',
          'transaction_file_reference',
          'scheme',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropView(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('billing_batches').withSchema('water').select([
        'billing_batch_id AS id',
        'region_id',
        'batch_type',
        'from_financial_year_ending',
        'to_financial_year_ending',
        'status',
        'invoice_count AS bill_count',
        'credit_note_count',
        'net_total',
        'bill_run_number',
        // 'error_code',
        'external_id',
        'is_summer AS summer',
        'source',
        'legacy_id',
        'metadata',
        'invoice_value',
        'credit_note_value',
        'transaction_file_reference',
        'scheme',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}
