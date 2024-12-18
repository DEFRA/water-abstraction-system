'use strict'

const tableName = 'licence_version_purpose_condition_types'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('licence_version_purpose_condition_type_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('code').notNullable()
    table.string('subcode').notNullable()
    table.string('description').notNullable()
    table.string('subcode_description').notNullable()
    table.string('display_title').notNullable()
    table.string('param_1_label')
    table.string('param_2_label')

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    table.unique(['code', 'subcode'], 'uidx_code_subcode')
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
