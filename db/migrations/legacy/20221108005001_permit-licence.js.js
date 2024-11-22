'use strict'

const tableName = 'licence'

exports.up = function (knex) {
  return knex.schema.withSchema('permit').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('licence_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.integer('licence_status_id').notNullable()
    table.integer('licence_type_id').notNullable()
    table.integer('licence_regime_id').notNullable()
    table.string('licence_search_key')
    table.tinyint('is_public_domain')
    table.date('licence_start_dt')
    table.date('licence_end_dt')
    table.string('licence_ref').notNullable()
    table.jsonb('licence_data_value')
    table.jsonb('licence_summary')
    table.jsonb('metadata')
    table.dateTime('date_licence_version_purpose_conditions_last_copied')
    table.dateTime('date_gauging_station_links_last_copied')

    // Constraints
    table.unique(['licence_regime_id', 'licence_type_id', 'licence_ref'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('permit').dropTableIfExists(tableName)
}
