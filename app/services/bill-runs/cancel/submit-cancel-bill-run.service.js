'use strict'

/**
 * Orchestrates the cancelling of a bill run
 * @module SubmitCancelBillRunService
 */

const BillModel = require('../../../models/bill.model.js')
const BillLicenceModel = require('../../../models/bill-licence.model.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const BillRunChargeVersionYearModel = require('../../../models/bill-run-charge-version-year.model.js')
const BillRunVolumeModel = require('../../../models/bill-run-volume.model.js')
const { db } = require('../../../../db/db.js')
const ChargingModuleDeleteBillRunRequest = require('../../../requests/charging-module/delete-bill-run.request.js')
const { calculateAndLogTimeTaken, timestampForPostgres } = require('../../../lib/general.lib.js')
const ReviewChargeVersionModel = require('../../../models/review-charge-version.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')
const ReviewReturnModel = require('../../../models/review-return.model.js')

/**
 * Orchestrates the cancelling of a bill run
 *
 * After checking that the bill run has a status that can be cancelled (sending and sent bill runs cannot be cancelled)
 * we set the status of the bill run to `cancel`. At this point we return control to the controller so that it can
 * redirect the user to the bill runs page.
 *
 * Meantime now in the background, we send a request to the Charging Module API to delete the bill run there. Then we
 * delete all details of the bill run from our tables.
 *
 * Where possible we do these in parallel to speed up the process. We also are not to fussed about errors. For example,
 * if the CHA returns an error we don't stop the process as an orphaned CHA bill run won't impact us.
 *
 * The final thing worth noting that due to the number of constraints placed on the legacy tables deleting records can
 * take some time. For example, an Anglian annual bill run in production will take more than 30 mins to delete
 * everything.
 *
 * @param {string} billRunId  - UUID of the bill run to be cancelled
 *
 * @returns {Promise} the promise returned is not intended to resolve to any particular value
 */
async function go (billRunId) {
  const billRun = await _fetchBillRun(billRunId)

  const cannotBeDeleted = _cannotBeDeleted(billRun.status)

  if (cannotBeDeleted) {
    return
  }

  await _updateStatusToCancel(billRunId)

  // NOTE: We originally believed that should anything error in _cancelBillRun() the try/catch in the controller would
  // catch it. However, when testing this theory we found it crashed the test framework. So, we tried it for real and
  // again confirmed we'd crash the service. The controller would never see the error. It is because we are not awaiting
  // this call that any errors thrown are considered uncaught. However, if we instead use the ES6 variant the error _is_
  // caught. All we can do at this point is log it.
  _cancelBillRun(billRun).catch((error) => {
    global.GlobalNotifier.omfg(error.message, { billRunId }, error)
  })
}

async function _cancelBillRun (billRun) {
  const startTime = process.hrtime.bigint()

  const { id: billRunId, externalId } = billRun

  // Within the scope of this method we await all 3 processes to complete and then log the time taken. For a small
  // supplementary bill run the request to the charge module might be the one that takes the longest. In the case of
  // an annual bill run it will be removing the bill run. Either way, all 3 processes can be run in parallel as none of
  // them have a dependence on the other
  await Promise.all([
    // If the Charging Module errors whilst doing this it shouldn't block us carrying on with deleting the bill run on
    // our side. It just means the the CHA will be storing an 'orphaned' bill run that will never get sent.
    ChargingModuleDeleteBillRunRequest.send(externalId),
    // We can be deleting these records whilst getting on with deleting the other things. But should it fail we'll just
    // be left with orphaned review results. As long as it's an incidental occurrence this wouldn't be a problem.
    _removeReviewResults(billRunId),
    // Finally we get on with deleting the billing records which in some cases (Anglian annual bill run) can take more
    // than 30 mins!
    _removeBillingRecords(billRunId)
  ])

  calculateAndLogTimeTaken(startTime, 'Cancel bill run complete', { billRunId })
}

function _cannotBeDeleted (status) {
  // NOTE: We have intentionally left 'cancel' out of the list of statuses. Arguably, you shouldn't be able to cancel
  // a bill run that is already being cancelled!
  //
  // But we know that there are existing 'stuck' cancelling bill runs at the time this gets shipped. Plus should an
  // error cause any future cancelling bill runs this will give us a 'backdoor' means of trying to remove them again.
  //
  // Because our version of cancel bill run redirects the user to the bill runs page as soon as the status is set it
  // is only by intention that someone could get back to the cancel bill run page. But it is this we intend to exploit
  // to clear up existing stuck bill runs and deal with any of our own in future!
  const invalidStatusesForDeleting = ['sending', 'sent']

  return invalidStatusesForDeleting.includes(status)
}

/**
 * This service handles the POST request from the confirm cancel bill run page. We _could_ have included the the
 * externalId as a hidden field in the form and included it in the request. This would give the impression we could
 * avoid a query to the DB.
 *
 * But we need to ensure no one exploits the `POST /bill-runs/{id}/cancel` endpoint to try and delete a 'sent' bill
 * run. So, we always have to fetch the bill run to check its status is not one that prevents us deleting it.
 *
 * @private
 */
async function _fetchBillRun (id) {
  return BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'externalId',
      'status'
    ])
}

/**
 * These deals with all the tables that may be populated for a bill run. Because we have to deal with bills created
 * using the legacy engine and the new engine there will be times where a table won't have any records. But as this
 * won't effect the outcome we dispense with checking the scheme or type and just get on with clearing all tables to
 * keep the process simpler.
 *
 * Some tables have to be cleared before others because of foreign key constraints the previous team added. Those along
 * with other constraints are why clearing the billing tables can take more than 30 mins!!
 *
 * Transactions have to be deleted before bill licences. Bill licences have to be cleared before bills. Bills, batch
 * charge version years, and bill run volumes have to be cleared before we can delete the bill run. But we can do
 * those in parallel.
 *
 * @private
 */
async function _removeBillingRecords (billRunId) {
  try {
    // NOTE: This needs to run first but is also typically the one that takes the longest to complete. In production
    // deleting the transactions for an Anglian annual bill run can take more than 30 mins!!
    await _removeBillRunTransactions(billRunId)

    await _removeBillLicences(billRunId)

    await Promise.all([
      _removeBills(billRunId),
      _removeBillRunChargeVersionYears(billRunId),
      _removeBillRunVolumes(billRunId)
    ])

    // We can now finally delete the bill run record
    await BillRunModel.query().deleteById(billRunId)
  } catch (error) {
    global.GlobalNotifier.omfg('Failed to remove billing records', { billRunId }, error)
  }
}

async function _removeBills (billRunId) {
  return BillModel.query().delete().where('billRunId', billRunId)
}

async function _removeBillLicences (billRunId) {
  return BillLicenceModel.query()
    .delete()
    .whereExists(BillLicenceModel.relatedQuery('bill').where('bill.billRunId', billRunId))
}

async function _removeBillRunChargeVersionYears (billRunId) {
  return BillRunChargeVersionYearModel.query().delete().where('billRunId', billRunId)
}

/**
 * We've opted to do this particular query using knex raw rather than via the Objection models due to the need for
 * multiple joins.
 *
 * @private
 */
async function _removeBillRunTransactions (billRunId) {
  return db.raw(`
    DELETE FROM water.billing_transactions WHERE billing_transaction_id IN (
      SELECT bt.billing_transaction_id FROM water.billing_transactions bt
      INNER JOIN water.billing_invoice_licences bil ON bil.billing_invoice_licence_id = bt.billing_invoice_licence_id
      INNER JOIN water.billing_invoices bi ON bi.billing_invoice_id = bil.billing_invoice_id
      WHERE
        bi.billing_batch_id = ?
    );
  `, billRunId
  )
}

async function _removeBillRunVolumes (billRunId) {
  return BillRunVolumeModel.query().delete().where('billRunId', billRunId)
}

async function _removeChargeElements (billRunId) {
  return db
    .del()
    .from('reviewChargeElements AS rce')
    .innerJoin('reviewChargeReferences AS rcr', 'rce.reviewChargeReferenceId', 'rcr.id')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
}

/**
 * As the `review_charge_elements` table has a join with the `review_charge_references` table we need to delete the
 * `review_charge_elements` table first. This function does that so we can process in parallel the deletion of the
 * elements and references whilst also deleting the records from the `review_charge_elements_returns` table.
 *
 * @private
 */
async function _removeChargeElementsAndReferences (billRunId) {
  await _removeChargeElements(billRunId)
  await _removeChargeReferences(billRunId)
}

async function _removeChargeElementReturns (billRunId) {
  return db
    .withSchema('water')
    .del()
    .from('reviewChargeElementReturns AS rcer')
    .innerJoin('reviewReturns AS rr', 'rcer.reviewReturnId', 'rr.id')
    .innerJoin('reviewLicences AS rl', 'rr.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
}

async function _removeChargeReferences (billRunId) {
  return db
    .withSchema('water')
    .del()
    .from('reviewChargeReferences AS rcr')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
}

async function _removeChargeVersions (billRunId) {
  return ReviewChargeVersionModel.query()
    .delete()
    .innerJoinRelated('reviewLicence')
    .where('reviewLicence.billRunId', billRunId)
}

async function _removeReturns (billRunId) {
  return ReviewReturnModel.query()
    .delete()
    .innerJoinRelated('reviewLicence')
    .where('reviewLicence.billRunId', billRunId)
}

/**
 * We always call this function as part of cancelling a bill run. However, there will only be records if the bill run
 * is an SROC tw-part tariff bill run in 'review'.
 *
 * @private
 */
async function _removeReviewResults (billRunId) {
  try {
    // To help performance we allow both these processes to run in parallel. Because their where clause depends on
    // `review_charge_versions` and `review_returns` we have to wait for them to complete before we proceed. This is
    // the same for deleting the charge versions and returns.
    await Promise.all([_removeChargeElementReturns(billRunId), _removeChargeElementsAndReferences(billRunId)])
    await Promise.all([_removeChargeVersions(billRunId), _removeReturns(billRunId)])

    return ReviewLicenceModel.query().delete().where('billRunId', billRunId)
  } catch (error) {
    global.GlobalNotifier.omfg('Failed to remove review results', { billRunId }, error)
  }
}

async function _updateStatusToCancel (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .patch({ status: 'cancel', updatedAt: timestampForPostgres() })
}

module.exports = {
  go
}
