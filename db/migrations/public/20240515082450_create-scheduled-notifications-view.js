'use strict'

const viewName = 'scheduled_notification'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('scheduled_notification').withSchema('water').select([
        'scheduled_notification.date_created AS created_at',
        'scheduled_notification.event_id',
        'scheduled_notification.id',
        'scheduled_notification.licences',
        'scheduled_notification.message_type',
        'scheduled_notification.notify_status',
        'scheduled_notification.send_after',
        'scheduled_notification.status'

        // 'scheduled_notification.company_entity_id',
        // 'scheduled_notification.individual_entity_id',
        // 'scheduled_notification.job_id',
        // 'scheduled_notification.log',
        // 'scheduled_notification.medium',
        // 'scheduled_notification.message_ref',
        // 'scheduled_notification.metadata',
        // 'scheduled_notification.next_status_check',
        // 'scheduled_notification.notification_type',
        // 'scheduled_notification.notify_id',
        // 'scheduled_notification.personalisation',
        // 'scheduled_notification.plaintext',
        // 'scheduled_notification.recipient',
        // 'scheduled_notification.status_checks'
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
