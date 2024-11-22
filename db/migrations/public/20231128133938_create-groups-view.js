'use strict'

const viewName = 'groups'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('groups').withSchema('idm').select([
        'groups.group_id AS id',
        // 'groups.application', // is always water_admin
        'groups.group',
        'groups.description',
        'groups.date_created AS created_at',
        'groups.date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
