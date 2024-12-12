'use strict'

const viewName = 'licence_document_roles'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('document_roles').withSchema('crm_v2').select([
        'document_role_id AS id',
        'document_id AS licence_document_id',
        'company_id',
        'contact_id',
        'address_id',
        'role_id AS licence_role_id',
        // 'invoice_account_id',
        'start_date',
        'end_date',
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
