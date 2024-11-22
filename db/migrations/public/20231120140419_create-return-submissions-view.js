'use strict'

const viewName = 'return_submissions'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('versions')
        .withSchema('returns')
        .select([
          'version_id AS id',
          'return_id as return_log_id',
          'user_id',
          'user_type',
          'version_number as version',
          'metadata',
          'nil_return',
          'current',
          'created_at',
          'updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
