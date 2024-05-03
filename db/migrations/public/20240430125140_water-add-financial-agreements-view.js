'use strict'

const viewName = 'financial_agreements'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      view.as(knex('financial_agreement_types').withSchema('water').select([
        'financial_agreement_type_id AS id',
        'financial_agreement_code',
        'description',
        'disabled',
        // 'is_test',
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
