'use strict'

const viewName = 'licence_versions'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('licence_versions').withSchema('water').select([
        'licence_version_id AS id',
        'licence_id',
        'issue',
        'increment',
        'status',
        'start_date',
        'end_date',
        'external_id',
        // 'is_test',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
