const viewName = 'licence_unregistrations'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(knex(viewName).withSchema('water').select(['id', 'created_by', 'licence_id', 'created_at']))
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
