'use strict'

const viewName = 'licence_document_headers'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('document_header').withSchema('crm').select([
        'document_id AS id',
        // This could be ignored as it is always set to the same ID. But that id comes from a single record in the
        // crm.entity table which has the `entity_type` regime. So, for the purposes of testing we just have to live
        // with always populating it even though we don't care about it.
        'regime_entity_id',
        // 'system_id',
        'system_internal_id AS nald_id',
        'system_external_id AS licence_ref',
        'metadata',
        // 'company_entity_id',
        // 'verification_id',
        // 'document_name',
        'date_created AS created_at',
        'date_updated AS updated_at',
        'date_deleted AS deleted_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
