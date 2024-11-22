'use strict'

const viewName = 'bill_licences'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('billing_invoice_licences')
        .withSchema('water')
        .select([
          'billing_invoice_licence_id AS id',
          'billing_invoice_id AS bill_id',
          'licence_ref',
          'licence_id',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
