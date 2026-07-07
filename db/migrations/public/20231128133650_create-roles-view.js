const viewName = 'roles'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('roles').withSchema('idm').select([
        'roles.role_id AS id',
        // 'roles.application', // is always water_admin
        'roles.role',
        'roles.description',
        'roles.date_created AS created_at',
        'roles.date_updated AS updated_at'
      ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
