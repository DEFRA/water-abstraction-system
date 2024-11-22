'use strict'

const viewName = 'group_roles'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('group_roles')
        .withSchema('idm')
        .select([
          'group_roles.group_role_id AS id',
          'group_roles.group_id',
          'group_roles.role_id',
          'group_roles.date_created AS created_at',
          'group_roles.date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
