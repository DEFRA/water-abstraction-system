'use strict'

const viewName = 'contacts'

exports.up = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex(viewName).withSchema('crm_v2').select([
        'contacts.contact_id AS id',
        'contacts.salutation',
        'contacts.first_name',
        'contacts.middle_initials',
        'contacts.last_name',
        'contacts.external_id', // is populated for contacts migrated from NALD and is used to resolve import conflicts
        'contacts.initials',
        // 'contacts.is_test', // we ignore this legacy test column in tables
        'contacts.data_source',
        'contacts.contact_type',
        'contacts.suffix',
        'contacts.department',
        // 'contacts.last_hash', // is populated but is only used by the legacy import process
        // 'contacts.current_hash', // is populated but is only used by the legacy import process
        'contacts.email',
        'contacts.date_created AS created_at',
        'contacts.date_updated AS updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropView(viewName)
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex(viewName).withSchema('crm_v2').select([
        'contacts.contact_id AS id',
        'contacts.salutation',
        'contacts.first_name',
        'contacts.middle_initials',
        'contacts.last_name',
        // 'external_id', // is populated for contacts migrated from NALD and is used to resolve import conflicts
        // 'contacts.external_id',
        'contacts.initials',
        // 'contacts.is_test', // we ignore this legacy test column in tables
        'contacts.data_source',
        'contacts.contact_type',
        'contacts.suffix',
        'contacts.department',
        // 'contacts.last_hash', // is populated but is only used by the legacy import process
        // 'contacts.current_hash', // is populated but is only used by the legacy import process
        'contacts.email',
        'contacts.date_created AS created_at',
        'contacts.date_updated AS updated_at'
      ]))
    })
}
