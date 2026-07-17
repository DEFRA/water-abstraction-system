const tableName = 'change_reasons'

export function up(knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('change_reason_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('description').notNullable()
    table.boolean('triggers_minimum_charge').notNullable().defaultTo(false)
    table.string('type').notNullable()
    table.boolean('is_enabled_for_new_charge_versions').notNullable()

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable()
    table.timestamp('date_updated', { useTz: false })
  })
}

export function down(knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
