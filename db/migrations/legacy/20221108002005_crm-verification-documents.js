'use strict'

const tableName = 'verification_documents'

exports.up = function (knex) {
  return knex.schema.withSchema('crm').createTable(tableName, (table) => {
    // Data
    table.string('verification_id').notNullable()
    table.string('document_id').notNullable()

    // Primary Key
    table.primary(['verification_id', 'document_id'])
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm').dropTableIfExists(tableName).drop
}
