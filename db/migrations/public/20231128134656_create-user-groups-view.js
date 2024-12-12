'use strict'

const viewName = 'user_groups'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('user_groups')
        .withSchema('idm')
        .select([
          'user_groups.user_group_id AS id',
          'user_groups.user_id',
          'user_groups.group_id',
          'user_groups.date_created AS created_at',
          'user_groups.date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
