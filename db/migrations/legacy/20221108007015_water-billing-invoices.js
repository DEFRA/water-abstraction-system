'use strict'

const tableName = 'billing_invoices'

exports.up = function (knex) {
  return (
    // If it was a simple check constraint we could have used https://knexjs.org/guide/schema-builder.html#checks
    // But because of the complexity of the constraint we have had to drop to using raw() to add the constraint after
    // Knex has created the table.
    knex.schema.withSchema('water').createTable(tableName, (table) => {
      // Primary Key
      table.uuid('billing_invoice_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('invoice_account_id').notNullable()
      table.jsonb('address').notNullable()
      table.string('invoice_account_number')
      table.decimal('net_amount')
      table.boolean('is_credit')
      table.uuid('billing_batch_id').notNullable()
      table.smallint('financial_year_ending').notNullable()
      table.string('invoice_number')
      table.string('legacy_id')
      table.jsonb('metadata')
      table.decimal('credit_note_value')
      table.decimal('invoice_value')
      table.boolean('is_de_minimis').notNullable().defaultTo(false)
      table.uuid('external_id').unique()
      table.boolean('is_flagged_for_rebilling').notNullable().defaultTo(false)
      table.uuid('original_billing_invoice_id')
      table.string('rebilling_state')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    }).raw(`
      CREATE UNIQUE INDEX unique_batch_year_invoice
      ON water.billing_invoices USING btree (
        billing_batch_id,
        financial_year_ending,
        invoice_account_id
      )
      WHERE ((legacy_id IS NULL) AND (rebilling_state IS NULL));
    `).raw(`
      CREATE UNIQUE INDEX unique_batch_year_rebilling_invoice
      ON water.billing_invoices USING btree (
        billing_batch_id,
        financial_year_ending,
        invoice_account_id,
        rebilling_state
      )
      WHERE ((legacy_id IS NULL) AND (rebilling_state IS NOT NULL));
    `)
  )
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
