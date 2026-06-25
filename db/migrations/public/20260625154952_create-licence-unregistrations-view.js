'use strict'

const viewName = 'licence_unregistrations'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex(viewName)
        .withSchema('water')
        .select([
          'id',
          'created_by',
          'licence_id',
          'created_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
