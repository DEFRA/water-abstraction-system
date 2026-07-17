const tableName = 'return_cycles'

export function up(knex) {
  return knex.schema.withSchema('returns').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('return_cycle_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.date('start_date').notNullable()
    table.date('end_date').notNullable()
    table.date('due_date')
    table.boolean('is_summer')
    table.boolean('is_submitted_in_wrls')

    // Legacy timestamps
    // NOTE: They are not automatically set
    table.timestamp('date_created').notNullable()
    table.timestamp('date_updated')

    // Constraints
    table.unique(['start_date', 'end_date', 'is_summer'])
  })
}

export function down(knex) {
  return knex.schema.withSchema('returns').dropTableIfExists(tableName)
}
