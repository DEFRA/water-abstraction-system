'use strict'

const viewName = 'charge_version_workflows'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('charge_version_workflows').withSchema('water').select([
        'charge_version_workflows.charge_version_workflow_id as id',
        'charge_version_workflows.licence_id',
        'charge_version_workflows.licence_version_id',
        'charge_version_workflows.data',
        'charge_version_workflows.status',
        'charge_version_workflows.approver_comments',
        'charge_version_workflows.created_by',
        'charge_version_workflows.date_created AS created_at',
        'charge_version_workflows.date_deleted AS deleted_at',
        'charge_version_workflows.date_updated AS updated_at'
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
