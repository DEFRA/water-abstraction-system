'use strict'

const viewName = 'billing_account_addresses'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('invoice_account_addresses').withSchema('crm_v2').select([
        'invoice_account_addresses.invoice_account_address_id AS id',
        'invoice_account_addresses.invoice_account_id AS billing_account_id',
        'invoice_account_addresses.address_id',
        'invoice_account_addresses.start_date',
        'invoice_account_addresses.end_date',
        // 'invoice_account_addresses.is_test', // we ignore this legacy test column in tables
        'invoice_account_addresses.agent_company_id AS company_id',
        'invoice_account_addresses.contact_id',
        'invoice_account_addresses.date_created AS created_at',
        'invoice_account_addresses.date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
