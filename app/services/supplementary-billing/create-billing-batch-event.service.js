'use strict'

/**
 * Creates the event for when a new billing batch is initialised
 * @module CreateBillingBatchEventService
 */

const CreateBillingBatchEventPresenter = require('../../presenters/supplementary-billing/create-billing-batch-event.presenter.js')
const EventModel = require('../../models/water/event.model.js')
const GeneralLib = require('../../lib/general.lib.js')

/**
 * Create an event for when a new bill run is initialised
 *
 * @param {module:BillingBatchModel} [billingBatch] An instance of `BillingBatchModel` representing the initialised
 *   billing batch
 * @param {String} [issuer] The email address of the user triggering the event
 *
 * @returns {Object} The newly created event record
 */
async function go (billingBatch, issuer) {
  // The legacy `water.events` table does not have a default set for its timestamp fields. So, we have to manually set
  // them when creating the record
  const timestamp = GeneralLib.timestampForPostgres()

  const event = await EventModel.query()
    .insert({
      type: 'billing-batch',
      subtype: billingBatch.batchType,
      issuer,
      metadata: _metadata(billingBatch),
      licences: [],
      status: 'start',
      createdAt: timestamp,
      updatedAt: timestamp
    })
    .returning('*')

  return event
}

function _metadata (billingBatch) {
  return CreateBillingBatchEventPresenter.go(billingBatch)
}

module.exports = {
  go
}
