'use strict'

const tableName = 'scheduled_notification'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.bigint('status_checks')
      table.date('send_after')
      table.integer('notification_type')
      table.jsonb('licences')
      table.jsonb('metadata')
      table.jsonb('personalisation')
      table.string('company_entity_id')
      table.string('individual_entity_id')
      table.string('job_id').unique()
      table.string('log')
      table.string('medium')
      table.string('message_ref')
      table.string('message_type')
      table.string('notify_id')
      table.string('notify_status')
      table.string('plaintext')
      table.string('recipient')
      table.string('status')
      table.timestamp('next_status_check')
      table.uuid('event_id')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
    .raw(`
        CREATE INDEX idx_scheduled_notification_statuses ON water.scheduled_notification USING btree (status, notify_status);
        CREATE INDEX scheduled_notification_idx_send_after ON water.scheduled_notification USING btree (send_after);
    `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
