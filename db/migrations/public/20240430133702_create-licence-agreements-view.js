'use strict'

const viewName = 'licence_agreements'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('licence_agreements').withSchema('water').select([
        'licence_agreement_id AS id',
        'financial_agreement_type_id AS financial_agreement_id',
        'licence_ref',
        'start_date',
        'end_date',
        'date_signed AS signed_on',
        'date_deleted AS deleted_at',
        'source',
        // 'is_test',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
