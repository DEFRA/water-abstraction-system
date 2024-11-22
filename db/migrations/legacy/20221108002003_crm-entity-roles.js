'use strict'

const tableName = 'entity_roles'

exports.up = function (knex) {
  return (
    // If it was a simple check constraint we could have used https://knexjs.org/guide/schema-builder.html#checks
    // But because of the complexity of the constraint we have had to drop to using raw() to add the constraint after
    // Knex has created the table.
    knex.schema.withSchema('crm').createTable(tableName, (table) => {
      // Primary Key
      table.string('entity_role_id').primary()

      // Data
      table.string('entity_id')
      table.string('role')
      table.string('regime_entity_id')
      table.string('company_entity_id')
      table.string('created_by')

      // Legacy timestamps
      // NOTE: They are not automatically set
      table.timestamp('created_at').defaultTo(knex.fn.now())
    }).raw(`
      CREATE UNIQUE INDEX unique_role
      ON crm.entity_roles USING btree (
        entity_id,
        COALESCE(regime_entity_id, '00000000-0000-0000-0000-000000000000'::character varying),
        company_entity_id,
        role
      );
    `)
  )
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm').dropTableIfExists(tableName).drop
}
