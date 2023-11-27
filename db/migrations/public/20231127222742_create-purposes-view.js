'use strict'

const viewName = 'purposes'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      view.as(knex('purposes_uses').withSchema('water').select([
        'purpose_use_id AS id',
        'legacy_id',
        'description',
        'loss_factor',
        'is_two_part_tariff',
        'is_test',
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
