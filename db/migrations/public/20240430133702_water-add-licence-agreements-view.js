'use strict'

const viewName = 'licence_agreements'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      view.as(knex('licence_agreements').withSchema('water').select([
        'licence_agreement_id AS id',
        'financial_agreement_type_id',
        'licence_ref',
        'start_date',
        'end_date',
        'date_signed',
        'date_deleted',
        'source',
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
