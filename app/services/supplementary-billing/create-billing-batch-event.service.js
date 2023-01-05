'use strict'

/**
 * Creates the event for when a new billing batch is initialised
 * @module CreateBillingBatchEventService
 */

const CreateBillingBatchEventPresenter = require('../../presenters/supplementary-billing/create-billing-batch-event.presenter.js')
const EventModel = require('../../models/water/event.model.js')

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
  const event = await EventModel.query()
    .insert({
      type: 'billing-batch',
      subtype: billingBatch.batchType,
      issuer,
      metadata: _metadata(billingBatch),
      status: 'start'
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
