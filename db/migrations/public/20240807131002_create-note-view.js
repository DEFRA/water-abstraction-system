'use strict'

const viewName = 'notes'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      view.as(knex('notes').withSchema('water').select([
        'note_id AS id',
        'text',
        'type',
        'type_id',
        'user_id',
        'licence_id',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
