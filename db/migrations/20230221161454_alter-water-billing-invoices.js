'use strict'

const tableName = 'billing_invoices'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.uuid('invoice_account_id')
      table.jsonb('address')
      table.string('invoice_account_number')
      table.decimal('net_amount')
      table.boolean('is_credit')
      table.string('invoice_number')
      table.string('legacy_id')
      table.jsonb('metadata')
      table.decimal('credit_note_value')
      table.decimal('invoice_value')
      table.boolean('is_de_minimis')
      table.uuid('external_id')
      table.boolean('is_flagged_for_rebilling')
      table.uuid('original_billing_invoice_id')
      table.string('rebilling_state')
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.dropColumns(
        'invoice_account_id',
        'address',
        'invoice_account_number',
        'net_amount',
        'is_credit',
        'invoice_number',
        'legacy_id',
        'metadata',
        'credit_note_value',
        'invoice_value',
        'is_de_minimis',
        'external_id',
        'is_flagged_for_rebilling',
        'original_billing_invoice_id',
        'rebilling_state'
      )
    })
}
