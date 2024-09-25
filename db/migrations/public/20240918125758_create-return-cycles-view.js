'use strict'

const viewName = 'return_cycles'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      view.as(knex('return_cycles').withSchema('returns').select([
        'return_cycle_id AS id',
        'start_date',
        'end_date',
        'due_date',
        'is_summer',
        'is_submitted_in_wrls',
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
