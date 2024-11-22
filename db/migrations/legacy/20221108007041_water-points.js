'use strict'

const tableName = 'points'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.text('description').notNullable()
    table.text('ngr_1').notNullable()
    table.text('ngr_2')
    table.text('ngr_3')
    table.text('ngr_4')
    table.uuid('source_id').notNullable()
    table.text('category')
    table.text('primary_type')
    table.text('secondary_type')
    table.text('note')
    table.text('location_note')
    table.decimal('depth')
    table.text('bgs_reference')
    table.text('well_reference')
    table.text('hydro_reference')
    table.decimal('hydro_intercept_distance')
    table.decimal('hydro_offset_distance')
    table.text('external_id').notNullable()
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['external_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
