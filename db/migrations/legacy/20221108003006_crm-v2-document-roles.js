'use strict'

const tableName = 'document_roles'

exports.up = function (knex) {
  return (
    // If it was a simple check constraint we could have used https://knexjs.org/guide/schema-builder.html#checks
    // But because of the complexity of the constraint we have had to drop to using raw() to add the constraint after
    // Knex has created the table.
    knex.schema.withSchema('crm_v2').createTable(tableName, (table) => {
      // Primary Key
      table.uuid('document_role_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('document_id').notNullable()
      table.uuid('company_id')
      table.uuid('contact_id')
      table.uuid('address_id')
      table.uuid('role_id').notNullable()
      table.date('start_date').notNullable()
      table.date('end_date')
      table.uuid('invoice_account_id')
      table.boolean('is_test').notNullable().defaultTo(false)

      // Legacy timestamps
      table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())

      // Constraints
      table.unique(['document_id', 'role_id', 'start_date'], { useConstraint: true })
    }).raw(`
      ALTER TABLE crm_v2.document_roles
      ADD CONSTRAINT company_or_invoice_account
      CHECK (
        ((company_id IS NOT NULL AND address_id IS NOT NULL) OR invoice_account_id IS NOT NULL)
      );
    `)
  )
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm_v2').dropTableIfExists(tableName)
}
