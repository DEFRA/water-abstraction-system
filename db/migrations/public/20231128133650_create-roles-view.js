'use strict'

const viewName = 'roles'

exports.up = function (knex) {
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

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
