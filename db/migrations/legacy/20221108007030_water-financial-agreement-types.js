const tableName = 'financial_agreement_types'

export function up(knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('financial_agreement_type_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('financial_agreement_code').notNullable()
    table.string('description').notNullable()
    table.boolean('disabled').default(false)
    table.boolean('is_test').notNullable().default(false)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['financial_agreement_code'])
  })
}

export function down(knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
