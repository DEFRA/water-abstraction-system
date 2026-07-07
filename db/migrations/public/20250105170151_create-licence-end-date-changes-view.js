const viewName = 'licence_end_date_changes'

export function up(knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('licence_end_date_changes')
        .withSchema('water')
        .select(['id', 'licence_id', 'date_type', 'change_date', 'nald_date', 'wrls_date', 'created_at', 'updated_at'])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
