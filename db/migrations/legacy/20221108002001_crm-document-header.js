'use strict'

const tableName = 'document_header'

exports.up = function (knex) {
  return knex.schema.withSchema('crm').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('document_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('regime_entity_id').notNullable()
    table.string('system_id').notNullable().defaultTo('permit-repo')
    table.string('system_internal_id').notNullable()
    table.string('system_external_id').notNullable()
    table.jsonb('metadata')
    table.string('company_entity_id')
    table.string('verification_id')
    table.string('document_name')
    table.date('date_deleted')

    // Legacy timestamps
    table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['system_id', 'system_internal_id', 'regime_entity_id'], {
      useConstraint: true,
      indexName: 'external_key'
    })
    table.unique([
      'document_id',
      'regime_entity_id',
      'system_id',
      'system_internal_id',
      'system_external_id',
      'company_entity_id',
      'verification_id'
    ])
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm').dropTableIfExists(tableName)
}
