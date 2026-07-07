const tableName = 'review_charge_elements'

export async function up(knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.decimal('amended_allocated', null, null).defaultTo(0).alter()
  })
}

export async function down(knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.decimal('amended_allocated').alter()
  })
}
