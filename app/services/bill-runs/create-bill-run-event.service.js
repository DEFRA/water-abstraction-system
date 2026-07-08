/**
 * Creates the event for when a new bill run is initialised
 * @module CreateBillRunEventService
 */

import CreateBillRunEventPresenter from '../../presenters/bill-runs/create-bill-run-event.presenter.js'
import EventModel from '../../models/event.model.js'
import { timestampForPostgres } from '../../lib/general.lib.js'

/**
 * Create an event for when a new bill run is initialised
 *
 * @param {module:BillRunModel} billRun - An instance of `BillRunModel` representing the initialised bill run
 * @param {string} issuer - The email address of the user triggering the event
 *
 * @returns {Promise<object>} The newly created event record
 */
export default async function go(billRun, issuer) {
  // The legacy `water.events` table does not have a default set for its timestamp fields. So, we have to manually set
  // them when creating the record
  const timestamp = timestampForPostgres()

  const event = await EventModel.query()
    .insert({
      type: 'billing-batch',
      subtype: billRun.batchType,
      issuer,
      metadata: _metadata(billRun),
      licences: JSON.stringify([]),
      status: 'start',
      createdAt: timestamp,
      updatedAt: timestamp
    })
    .returning('*')

  return event
}

function _metadata(billRun) {
  return CreateBillRunEventPresenter(billRun)
}
