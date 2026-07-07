const tableName = 'verification_documents'

export function up(knex) {
  return knex.schema.withSchema('crm').createTable(tableName, (table) => {
    // Data
    table.string('verification_id').notNullable()
    table.string('document_id').notNullable()

    // Primary Key
    table.primary(['verification_id', 'document_id'])
  })
}

export function down(knex) {
  return knex.schema.withSchema('crm').dropTableIfExists(tableName).drop
}
