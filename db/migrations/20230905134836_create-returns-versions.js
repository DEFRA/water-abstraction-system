'use strict'

const tableName = 'versions'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('returns')
    .createTable(tableName, (table) => {
      // Primary Key
      table.string('version_id').primary()

      // Data
      table.string('return_id').notNullable()
      table.string('user_id').notNullable()
      table.string('user_type').notNullable()
      table.integer('version_number').notNullable()
      table.jsonb('metadata').notNullable()
      table.boolean('nil_return').notNullable()
      table.boolean('current')

      table.unique(['return_id', 'version_number'], { useConstraint: true })

      // Legacy timestamps
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('returns')
    .dropTableIfExists(tableName)
}
