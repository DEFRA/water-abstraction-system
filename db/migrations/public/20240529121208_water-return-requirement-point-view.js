'use strict'

const viewName = 'return_requirement_points'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      view.as(knex('return_requirement_points').withSchema('water').select([
        'id',
        'return_requirement_id',
        'description',
        'ngr_1',
        'ngr_2',
        'ngr_3',
        'ngr_4',
        'external_id'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
