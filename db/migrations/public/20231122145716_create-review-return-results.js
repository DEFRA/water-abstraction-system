'use strict'

const tableName = 'review_return_results'

exports.up = function (knex) {
  return knex.schema
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('return_id').notNullable()
      table.string('return_reference')
      table.date('start_date')
      table.date('end_date')
      table.date('due_date')
      table.date('received_date')
      table.string('status')
      table.boolean('under_query').defaultTo(false)
      table.boolean('nil_return').defaultTo(false)
      table.string('description')
      table.jsonb('purposes')
      // Specifying `null, null` creates a decimal column that can store numbers of any precision and scale
      table.decimal('quantity', null, null).defaultTo(0)
      table.decimal('allocated', null, null).defaultTo(0)
      table.boolean('abstraction_outside_period').defaultTo(false)

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
  return knex.schema.dropTableIfExists(tableName)
}
