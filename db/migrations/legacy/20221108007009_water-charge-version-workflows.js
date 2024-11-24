'use strict'

const tableName = 'charge_version_workflows'

exports.up = function (knex) {
  return (
    // If it was a simple check constraint we could have used https://knexjs.org/guide/schema-builder.html#checks
    // But because of the complexity of the constraint we have had to drop to using raw() to add the constraint after
    // Knex has created the table.
    knex.schema.withSchema('water').createTable(tableName, (table) => {
      // Primary Key
      table.uuid('charge_version_workflow_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('licence_id').notNullable()
      table.jsonb('created_by')
      table.string('approver_comments')
      table.string('status').notNullable()
      table.jsonb('data')
      table.uuid('licence_version_id')
      table.timestamp('date_deleted', { useTz: false })

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable()
      table.timestamp('date_updated', { useTz: false })
    }).raw(`
      CREATE UNIQUE INDEX unique_licence_version_id_date_deleted_null
      ON water.charge_version_workflows USING btree (
        licence_version_id
      )
      WHERE (date_deleted IS NULL);
    `)
  )
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
