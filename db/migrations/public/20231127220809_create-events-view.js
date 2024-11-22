'use strict'

const viewName = 'events'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('events').withSchema('water').select([
        'event_id AS id',
        'reference_code',
        'type',
        'subtype',
        'issuer',
        'licences',
        'entities',
        // 'comment',
        'metadata',
        'status',
        'created AS created_at',
        'modified AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
