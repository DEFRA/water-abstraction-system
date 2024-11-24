'use strict'

const tableName = 'contacts'

exports.up = function (knex) {
  return knex.schema.withSchema('crm_v2').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('contact_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('salutation')
    table.string('first_name')
    table.string('middle_initials')
    table.string('last_name')
    table.string('external_id').unique()
    table.string('initials')
    table.boolean('is_test').notNullable().defaultTo(false)
    table.string('data_source').notNullable()
    table.string('contact_type')
    table.string('suffix')
    table.string('department')
    table.string('last_hash')
    table.string('current_hash')
    table.string('email')

    // Legacy timestamps
    table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm_v2').dropTableIfExists(tableName)
}
