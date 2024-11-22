'use strict'

const viewName = 'billing_accounts'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('invoice_accounts').withSchema('crm_v2').select([
        'invoice_accounts.invoice_account_id AS id',
        'invoice_accounts.company_id',
        'invoice_accounts.invoice_account_number AS account_number',
        // 'invoice_accounts.start_date', // is populated but is never displayed in the UI or used
        // 'invoice_accounts.end_date', // is null for all records
        // 'invoice_accounts.is_test', // we ignore this legacy test column in tables
        'invoice_accounts.last_transaction_file_reference AS last_transaction_file',
        'invoice_accounts.date_last_transaction_file_reference_updated AS last_transaction_file_created_at',
        'invoice_accounts.date_created AS created_at',
        'invoice_accounts.date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
