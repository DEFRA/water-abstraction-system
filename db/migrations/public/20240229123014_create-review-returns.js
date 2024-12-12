'use strict'

const tableName = 'review_returns'
const replacedTableName = 'review_return_results'

exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists(replacedTableName)
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('review_licence_id').notNullable()
      table.string('return_id').notNullable()
      table.string('return_reference')
      // Specifying `null, null` creates a decimal column that can store numbers of any precision and scale
      table.decimal('quantity', null, null).defaultTo(0)
      table.decimal('allocated', null, null).defaultTo(0)
      table.boolean('under_query').defaultTo(false)
      table.string('return_status')
      table.boolean('nil_return').defaultTo(false)
      table.boolean('abstraction_outside_period').defaultTo(false)
      table.date('received_date')
      table.date('due_date')
      table.jsonb('purposes')
      table.string('description')
      table.date('start_date')
      table.date('end_date')
      table.string('issues')

      // Automatic timestamps
      table.timestamps(false, true)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${tableName}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists(tableName)
    .createTable(replacedTableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('return_id').notNullable()
      table.string('return_reference')
      // Specifying `null, null` creates a decimal column that can store numbers of any precision and scale
      table.decimal('quantity', null, null).defaultTo(0)
      table.decimal('allocated', null, null).defaultTo(0)
      table.boolean('under_query').defaultTo(false)
      table.string('status')
      table.boolean('nil_return').defaultTo(false)
      table.boolean('abstraction_outside_period').defaultTo(false)
      table.date('received_date')
      table.date('due_date')
      table.jsonb('purposes')
      table.string('description')
      table.date('start_date')
      table.date('end_date')

      // Automatic timestamps
      table.timestamps(false, true)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${tableName}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })
}
