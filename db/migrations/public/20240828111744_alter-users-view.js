'use strict'

const viewName = 'users'

exports.up = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('users').withSchema('idm').select([
        'users.user_id AS id',
        'users.user_name AS username',
        'users.password',
        // 'users.user_data', // inconsistently set and in most cases is {}
        'users.reset_guid',
        'users.reset_required',
        'users.last_login',
        'users.bad_logins',
        'users.application',
        // 'users.role', // was made redundant when roles were moved to be stored separately in tables
        'users.external_id AS licence_entity_id',
        'users.reset_guid_date_created AS reset_guid_created_at',
        'users.enabled',
        'users.date_created AS created_at',
        'users.date_updated AS updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('users').withSchema('idm').select([
        'users.user_id AS id',
        'users.user_name AS username',
        'users.password',
        // 'users.user_data', // inconsistently set and in most cases is {}
        'users.reset_guid',
        'users.reset_required',
        'users.last_login',
        'users.bad_logins',
        'users.application',
        // 'users.role', // was made redundant when roles were moved to be stored separately in tables
        // 'users.external_id', // was set during a migration of users from the crm schema but is never used
        'users.reset_guid_date_created AS reset_guid_created_at',
        'users.enabled',
        'users.date_created AS created_at',
        'users.date_updated AS updated_at'
      ]))
    })
}
