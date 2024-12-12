'use strict'

const viewName = 'licence_entity_roles'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('entity_roles').withSchema('crm').select([
        'entity_role_id AS id',
        'entity_id AS licence_entity_id',
        'role',
        // This could be ignored as it is always set to the same ID. But that id comes from a single record in the
        // crm.entity table which has the `entity_type` regime. So, for the purposes of testing we just have to live
        // with always populating it even though we don't care about it.
        'regime_entity_id',
        'company_entity_id',
        // NOTE: Can be a UUID to another entity or the email address of the user or NULL
        'created_by',
        'created_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
