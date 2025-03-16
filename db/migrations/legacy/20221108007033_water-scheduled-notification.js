'use strict'

const tableName = 'scheduled_notification'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('recipient')
    table.string('message_type')
    table.string('message_ref')
    table.jsonb('personalisation')
    table.timestamp('send_after')
    table.string('status')
    table.string('log')
    table.jsonb('licences')
    table.string('individual_entity_id')
    table.string('company_entity_id')
    table.string('medium')
    table.string('notify_id')
    table.string('notify_status')
    table.text('plaintext')
    table.uuid('event_id')
    table.jsonb('metadata')
    table.bigint('status_checks')
    table.timestamp('next_status_check')
    table.decimal('notification_type')
    table.string('job_id')

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable()

    // Constraints
    table.unique(['job_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
