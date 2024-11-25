'use strict'

const viewName = 'licence_documents'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('documents').withSchema('crm_v2').select([
        'document_id AS id',
        // 'regime',
        // 'document_type',
        'document_ref AS licence_ref',
        'start_date',
        'end_date',
        // 'is_test',
        'date_deleted AS deleted_at',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
