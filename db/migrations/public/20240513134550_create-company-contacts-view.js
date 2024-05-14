'use strict'

const viewName = 'company_contacts'
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('company_contacts').withSchema('crm_v2').select([
        'company_contacts.company_contact_id AS id',
        'company_contacts.company_id',
        'company_contacts.contact_id',
        'company_contacts.role_id',
        'company_contacts.date_created AS created_at',
        'company_contacts.date_updated AS updated_at'
        // company_contacts.is_default
        // company_contacts.email_address
        // company_contacts.start_date
        // company_contacts.end_date
        // company_contacts.is_test
        // company_contacts.water_abstraction_alerts_enabled
      ]))
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
