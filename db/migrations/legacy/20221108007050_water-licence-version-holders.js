'use strict'

const tableName = 'licence_version_holders'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('licence_version_id').notNullable()
    table.text('holder_type').notNullable()
    table.text('salutation')
    table.text('initials')
    table.text('forename')
    table.text('name')
    table.text('address_line_1')
    table.text('address_line_2')
    table.text('address_line_3')
    table.text('address_line_4')
    table.text('town')
    table.text('county')
    table.text('country')
    table.text('postcode')
    table.text('reference')
    table.text('description')
    table.text('local_name')
    table.date('last_changed')
    table.boolean('disabled').notNullable().defaultTo(false)

    // Timestamps
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['licence_version_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
