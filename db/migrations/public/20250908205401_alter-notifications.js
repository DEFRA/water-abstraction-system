'use strict'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists('notifications').createView('notifications', (view) => {
    view.as(
      knex('scheduled_notification').withSchema('water').select([
        'id',
        'recipient',
        'message_type',
        'message_ref',
        'personalisation',
        // 'send_after',
        'status',
        'log AS notify_error',
        'licences',
        // 'individual_entity_id AS individual_id',
        // 'company_entity_id AS company_id',
        // 'medium',
        'notify_id',
        'notify_status',
        'plaintext',
        'event_id',
        // 'metadata',
        // 'status_checks',
        // 'next_status_check',
        // 'notification_type',
        // 'job_id',
        'licence_gauging_station_id AS licence_monitoring_station_id',
        'date_created AS created_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists('notifications').createView('notifications', (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('scheduled_notification').withSchema('water').select([
        'id',
        'recipient',
        'message_type',
        'message_ref',
        'personalisation',
        // 'send_after',
        'status',
        'log AS notify_error',
        'licences',
        // 'individual_entity_id AS individual_id',
        // 'company_entity_id AS company_id',
        // 'medium',
        'notify_id',
        'notify_status',
        'plaintext',
        'event_id',
        // 'metadata',
        // 'status_checks',
        // 'next_status_check',
        // 'notification_type',
        // 'job_id',
        'date_created AS created_at'
      ])
    )
  })
}
