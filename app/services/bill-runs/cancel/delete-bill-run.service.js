'use strict'

/**
 * Deletes a bill run, all its associated records and the its match in the Charging Module API
 * @module DeleteBillRunService
 */

const BillModel = require('../../../models/bill.model.js')
const BillLicenceModel = require('../../../models/bill-licence.model.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const BillRunChargeVersionYearModel = require('../../../models/bill-run-charge-version-year.model.js')
const BillRunVolumeModel = require('../../../models/bill-run-volume.model.js')
const { db } = require('../../../../db/db.js')
const ChargingModuleDeleteBillRunRequest = require('../../../requests/charging-module/delete-bill-run.request.js')
const { calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')
const ReviewChargeVersionModel = require('../../../models/review-charge-version.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')
const ReviewReturnModel = require('../../../models/review-return.model.js')

/**
 * Deletes a bill run, all its associated records and the its match in the Charging Module API
 *
 * We first send a request to the Charging Module API to delete the bill run there. Then we delete all details of the
 * bill run from our tables.
 *
 * Where possible we do these in parallel to speed up the process. We also are not to fussed about errors. For example,
 * if the CHA returns an error we don't stop the process as an orphaned CHA bill run won't impact us.
 *
 * The final thing worth noting that due to the number of constraints placed on the legacy tables deleting records can
 * take some time. For example, an Anglian annual bill run in production will take more than 30 mins to delete
 * everything.
 *
 * @param {module:BillRunModule} billRun - The bill run to be deleted
 */
async function go (billRun) {
  try {
    const startTime = process.hrtime.bigint()

    const { id: billRunId, externalId } = billRun

    // Within the scope of this method we await all 3 processes to complete and then log the time taken. For a small
    // supplementary bill run the request to the charge module might be the one that takes the longest. In the case of
    // an annual bill run it will be removing the bill run. Either way, all 3 processes can be run in parallel as none
    // of them have a dependence on the
    // other
    const results = await Promise.allSettled([
      // If the Charging Module errors whilst doing this it shouldn't block us carrying on with deleting the bill run on
      // our side. It just means the the CHA will be storing an 'orphaned' bill run that will never get sent.
      ChargingModuleDeleteBillRunRequest.send(externalId),
      // We can be deleting these records whilst getting on with deleting the other things. But should it fail we'll
      // just be left with orphaned review results. As long as it's an incidental occurrence this wouldn't be a problem.
      _deleteReviewResults(billRunId),
      // Finally we get on with deleting the billing records which in some cases (Anglian annual bill run) can take more
      // than 30 mins!
      _deleteBillingRecords(billRunId)
    ])

    _logResult(startTime, billRun, results)
  } catch (error) {
    global.GlobalNotifier.omfg('Delete bill run failed', billRun, error)
  }
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
async function _deleteBillingRecords (billRunId) {
  // NOTE: This needs to run first but is also typically the one that takes the longest to complete. In production
  // deleting the transactions for an Anglian annual bill run can take more than 30 mins!!
  await _deleteBillRunTransactions(billRunId)

  await _deleteBillLicences(billRunId)

  await Promise.all([
    _deleteBills(billRunId),
    _deleteBillRunChargeVersionYears(billRunId),
    _deleteBillRunVolumes(billRunId)
  ])

  // We can now finally delete the bill run record
  await BillRunModel.query().deleteById(billRunId)
}

async function _deleteBills (billRunId) {
  return BillModel.query().delete().where('billRunId', billRunId)
}

async function _deleteBillLicences (billRunId) {
  return BillLicenceModel.query()
    .delete()
    .whereExists(BillLicenceModel.relatedQuery('bill').where('bill.billRunId', billRunId))
}

async function _deleteBillRunChargeVersionYears (billRunId) {
  return BillRunChargeVersionYearModel.query().delete().where('billRunId', billRunId)
}

/**
 * We've opted to do this particular query using knex raw rather than via the Objection models due to the need for
 * multiple joins.
 *
 * @private
 */
async function _deleteBillRunTransactions (billRunId) {
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

async function _deleteBillRunVolumes (billRunId) {
  return BillRunVolumeModel.query().delete().where('billRunId', billRunId)
}

async function _deleteChargeElements (billRunId) {
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
async function _deleteChargeElementsAndReferences (billRunId) {
  await _deleteChargeElements(billRunId)
  await _deleteChargeReferences(billRunId)
}

async function _deleteChargeElementReturns (billRunId) {
  return db
    .withSchema('water')
    .del()
    .from('reviewChargeElementReturns AS rcer')
    .innerJoin('reviewReturns AS rr', 'rcer.reviewReturnId', 'rr.id')
    .innerJoin('reviewLicences AS rl', 'rr.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
}

async function _deleteChargeReferences (billRunId) {
  return db
    .withSchema('water')
    .del()
    .from('reviewChargeReferences AS rcr')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
}

async function _deleteChargeVersions (billRunId) {
  return ReviewChargeVersionModel.query()
    .delete()
    .innerJoinRelated('reviewLicence')
    .where('reviewLicence.billRunId', billRunId)
}

async function _deleteReturns (billRunId) {
  return ReviewReturnModel.query()
    .delete()
    .innerJoinRelated('reviewLicence')
    .where('reviewLicence.billRunId', billRunId)
}

/**
 * We always call this function as part of deleting a bill run. However, there will only be records if the bill run
 * is an SROC two-part tariff bill run in 'review'.
 *
 * @private
 */
async function _deleteReviewResults (billRunId) {
  // To help performance we allow both these processes to run in parallel. Because their where clause depends on
  // `review_charge_versions` and `review_returns` we have to wait for them to complete before we proceed. This is
  // the same for deleting the charge versions and returns.
  await Promise.all([_deleteChargeElementReturns(billRunId), _deleteChargeElementsAndReferences(billRunId)])
  await Promise.all([_deleteChargeVersions(billRunId), _deleteReturns(billRunId)])

  return ReviewLicenceModel.query().delete().where('billRunId', billRunId)
}

/**
 * Deals with what log message to output. By using Promise.allSettled rather than Promise.all we know all three calls
 * will be allowed to resolve instead of stopping as soon as one fails.
 *
 * This means we can handle any errors thrown in one place, rather than in each of the individual functions.
 *
 * Obviously, if no errors are thrown we can just log our complete message!
 *
 * @private
 */
function _logResult (startTime, billRun, results) {
  const firstError = results.find((result) => {
    return result.status === 'rejected'
  })

  if (!firstError) {
    calculateAndLogTimeTaken(startTime, 'Delete bill run complete', { billRun })
  }

  global.GlobalNotifier.omfg('Delete bill run failed', billRun, firstError.reason)
}

module.exports = {
  go
}
