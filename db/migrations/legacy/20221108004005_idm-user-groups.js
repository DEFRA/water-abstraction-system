const tableName = 'user_groups'

export function up(knex) {
  return knex.schema.withSchema('idm').createTable(tableName, (table) => {
    // Primary Key
    table.string('user_group_id').primary().notNullable()

    // Data
    table.integer('user_id').notNullable()
    table.string('group_id').notNullable()

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

export function down(knex) {
  return knex.schema.withSchema('idm').dropTableIfExists(tableName)
}
