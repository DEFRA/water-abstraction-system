export async function up(knex) {
  await knex.schema.alterTable('review_charge_elements', (table) => {
    table.text('issues').alter()
  })

  await knex.schema.alterTable('review_licences', (table) => {
    table.text('issues').alter()
  })

  return knex.schema.alterTable('review_returns', (table) => {
    table.text('issues').alter()
  })
}

export async function down(knex) {
  await knex.schema.alterTable('review_charge_elements', (table) => {
    table.string('issues').alter()
  })

  await knex.schema.alterTable('review_licences', (table) => {
    table.string('issues').alter()
  })

  return knex.schema.alterTable('review_returns', (table) => {
    table.string('issues').alter()
  })
}
