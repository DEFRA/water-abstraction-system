'use strict'

const viewName = 'return_submissions'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      view.as(knex('versions').withSchema('returns').select([
        'versions.version_id AS id',
        'versions.return_id as return_log_id',
        'versions.user_id',
        'versions.user_type',
        'versions.version_number as version',
        'versions.metadata',
        'versions.created_at',
        'versions.updated_at',
        'versions.nil_return',
        'versions.current'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
