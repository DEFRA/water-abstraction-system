'use strict'

/**
 * Handles the reissuing of a single bill
 * @module ReissueBillService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

const ChargingModuleBillRunStatusService = require('../../charging-module/bill-run-status.service.js')
const ChargingModuleReissueBillService = require('../../charging-module/reissue-bill.service.js')
const ChargingModuleViewBillService = require('../../charging-module/view-bill.service.js')
const ExpandedError = require('../../../errors/expanded.error.js')
const GenerateBillLicenceService = require('./generate-bill-licence.service.js')
const GenerateBillService = require('./generate-bill.service.js')

/**
 * Handles the reissuing of a single bill
 *
 * This service raises a reissue request with the Charging Module for an bill (referred to as the "source" bill) which
 * creates 2 invoices on the CM side: a "cancelling" invoice (ie. one which cancels out the source bill by being a
 * credit for the same amount instead of a debit, or vice-versa) and a "reissuing" invoice (ie. the replacement for the
 * source bill).
 *
 * This request is all that needs to be done on the CM, so we then move on to our side of things. We create two new
 * bills on our side (a cancelling bill and a reissuing bill), and for each one we re-create the bill licences and
 * transactions of the source bill. While doing this we are loading up a `dataToReturn` object with the new bill,
 * bill licences and transactions.
 *
 * Once the bill has been handled, we mark the source bill as `rebilled` in the db (note that "rebill" is legacy
 * terminology for "reissue") along with the `originalBillId` field; if this is empty then we update it with
 * the source bill's ID, or if it's already filled in then we leave it as-is. This ensures that if a bill is reissued,
 * and that reissuing bill is itself reissued, then `originalBillId` will still point directly to the original
 * source bill.
 *
 * @param {module:BillModel} sourceBill The bill to be reissued. Note that we expect it to include the bill
 * licences and transactions
 * @param {module:BillRunModel} reissueBillRun The bill run that the new bills should belong to
 *
 * @returns {Object} dataToReturn Data that has been generated while reissuing the bill
 * @returns {Object[]} dataToReturn.bills Array of bills
 * @returns {Object[]} dataToReturn.billLicences Array of bill licences
 * @returns {Object[]} dataToReturn.transactions Array of transactions
 */

async function go (sourceBill, reissueBillRun) {
  const dataToReturn = {
    bills: [],
    billLicences: [],
    transactions: []
  }

  // When a reissue request is sent to the Charging Module, it creates 2 new invoices (one to cancel out the original
  // invoice and one to be the new version of it) and returns their IDs
  const chargingModuleReissueInvoiceIds = await _sendReissueRequest(
    reissueBillRun.externalId,
    sourceBill.externalId
  )

  // We can't get the reissue bills right away as the CM might be busy reissuing so we wait until the status
  // indicated that it's ready for us to proceed
  await _pauseUntilNotPending(reissueBillRun.externalId)

  for (const chargingModuleReissueInvoiceId of chargingModuleReissueInvoiceIds) {
    // Because we only have the CM invoice's id we now need to fetch its details via the "view invoice" endpoint
    const chargingModuleReissueInvoice = await _sendViewBillRequest(
      reissueBillRun,
      chargingModuleReissueInvoiceId
    )

    const reissueBill = _retrieveOrGenerateBill(
      dataToReturn,
      sourceBill,
      reissueBillRun,
      chargingModuleReissueInvoice
    )

    // The bill we want to reissue will have one or more bill licences on it which we need to re-create
    for (const sourceBillLicence of sourceBill.billLicences) {
      const reissueBillLicence = _retrieveOrGenerateBillLicence(
        dataToReturn,
        sourceBill,
        reissueBill.id,
        sourceBillLicence
      )

      const chargingModuleLicence = _retrieveChargingModuleLicence(
        chargingModuleReissueInvoice,
        sourceBillLicence.licenceRef
      )

      // The bill licence we are re-creating will have one or more transactions on it which we also need to re-create
      for (const sourceTransaction of sourceBillLicence.transactions) {
        // Get the original transaction from the charging module data so we can create our new one
        const chargingModuleReissueTransaction = _retrieveChargingModuleTransaction(
          chargingModuleLicence,
          sourceTransaction.externalId
        )

        const reissueTransaction = _generateTransaction(
          chargingModuleReissueTransaction,
          sourceTransaction,
          reissueBillLicence.id
        )

        dataToReturn.transactions.push(reissueTransaction)
      }
    }
  }

  await _markSourceBillAsRebilled(sourceBill)

  return dataToReturn
}

/**
 * Once a reissue request is sent, we need to wait until it's completed before we can proceed. The CM indicates that
 * it's busy by setting the status `pending` on a bill run. Once the status is no longer `pending`, the CM has finished
 * its task.
 *
 * This service sends "view status" requests to the CM (every second to avoid bombarding it) until the status is not
 * `pending`, at which point it returns.
 */
async function _pauseUntilNotPending (billRunExternalId) {
  let status

  do {
    // If status is set then we know that we've already sent a request, so we wait for a second to ensure we aren't
    // bombarding the CM with requests
    if (status) {
      // Create a new promise that resolves after 1000ms and wait until it's resolved before continuing
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const result = await ChargingModuleBillRunStatusService.go(billRunExternalId)

    if (!result.succeeded) {
      const error = new ExpandedError(
        'Charging Module reissue request failed',
        { billRunExternalId, responseBody: result.response.body }
      )

      throw error
    }

    status = result.response.body.status
  } while (status === 'pending')
}

/**
 * Generates a new transaction using sourceTransaction as a base and amending properties as appropriate
 */
function _generateTransaction (chargingModuleReissueTransaction, sourceTransaction, billLicenceId) {
  return {
    ...sourceTransaction,
    id: generateUUID(),
    externalId: chargingModuleReissueTransaction.id,
    credit: chargingModuleReissueTransaction.credit,
    netAmount: _determineSignOfNetAmount(
      chargingModuleReissueTransaction.chargeValue,
      chargingModuleReissueTransaction.credit
    ),
    billLicenceId
  }
}

/**
 * The Charging Module always returns a positive value for net amount whereas our db has a positive amount for debits
 * and a negative value for credits. We therefore use the CM charge value and credit flag to determine whether our net
 * amount should be positive or negative
 */
function _determineSignOfNetAmount (chargeValue, credit) {
  return credit ? -chargeValue : chargeValue
}

/**
 * Maps the provided CM invoice fields to their bill equivalents
 */
function _mapChargingModuleInvoice (chargingModuleInvoice) {
  const chargingModuleRebilledTypes = new Map()
    .set('C', 'reversal')
    .set('R', 'rebill')
    .set('O', null)

  return {
    externalId: chargingModuleInvoice.id,
    netAmount: chargingModuleInvoice.netTotal,
    deminimis: chargingModuleInvoice.deminimisInvoice,
    invoiceValue: chargingModuleInvoice.debitLineValue,
    // As per legacy code we invert the sign of creditLineValue
    creditNoteValue: -chargingModuleInvoice.creditLineValue,
    rebillingState: chargingModuleRebilledTypes.get(chargingModuleInvoice.rebilledType)
  }
}

/**
 * Updates the source bill's rebilling state and original bill ID
 */
async function _markSourceBillAsRebilled (sourceBill) {
  await sourceBill.$query().patch({
    rebillingState: 'rebilled',
    // If the source bill's originalBillId field is `null` then we update it with the bill's id; otherwise, we use its
    // existing value. This ensures that if we reissue a bill, then reissue that reissuing bill, every bill in the chain
    // will have originalBillId pointing back to the very first bill in the chain
    originalBillId: sourceBill.originalBillId ?? sourceBill.id
  })
}

function _retrieveChargingModuleTransaction (chargingModuleLicence, id) {
  return chargingModuleLicence.transactions.find((transaction) => {
    return transaction.rebilledTransactionId === id
  })
}

function _retrieveChargingModuleLicence (chargingModuleInvoice, licenceRef) {
  return chargingModuleInvoice.licences.find((licence) => {
    return licence.licenceNumber === licenceRef
  })
}

/**
 * If a bill exists for this combination of source bill and CM reissue invoice then return it; otherwise,
 * generate it, store it and then return it.
 */
function _retrieveOrGenerateBill (dataToReturn, sourceBill, reissueBillRun, chargingModuleReissueInvoice) {
  // Because we have nested iteration of source bill and Charging Module reissue invoice, we need to ensure we have
  // a bill for every combination of these, hence we search by both of their ids
  const existingBill = dataToReturn.bills.find((bill) => {
    return bill.billingAccountId === sourceBill.billingAccountId &&
      bill.externalId === chargingModuleReissueInvoice.id
  })

  if (existingBill) {
    return existingBill
  }

  const translatedChargingModuleInvoice = _mapChargingModuleInvoice(chargingModuleReissueInvoice)

  // GenerateBillService expects a BillingAccount instance and was built for supplementary billing. We only have the
  // Bill object. So, we create a 'billing account' from its data that GenerateBillService can then use.
  const billingAccount = {
    id: sourceBill.billingAccountId,
    accountNumber: sourceBill.accountNumber
  }

  const generatedBill = GenerateBillService.go(
    billingAccount,
    reissueBillRun.id,
    sourceBill.financialYearEnding
  )

  // Construct our new bill by taking the generated bill and combining it with the mapped fields from the CM invoice,
  // then updating its `originalBillId` field
  const newBill = {
    ...generatedBill,
    ...translatedChargingModuleInvoice,
    originalBillId: sourceBill.id
  }

  dataToReturn.bills.push(newBill)

  return newBill
}

/**
 * If a bill licence exists for this billing account id then return it; otherwise, generate it, store it and then return
 * it.
 */
function _retrieveOrGenerateBillLicence (dataToReturn, sourceBill, billingId, sourceBillLicence) {
  const existingBillLicence = dataToReturn.billLicences.find((billLicence) => {
    return billLicence.billingAccountId === sourceBill.billingAccountId
  })

  if (existingBillLicence) {
    return existingBillLicence
  }

  // GenerateBillLicenceService expects a Licence object and was built for supplementary billing. We only have the
  // BillLicence object. So, we create a 'licence' from its data that GenerateBillLicenceService can then use.
  const licence = {
    id: sourceBillLicence.licenceId,
    licenceRef: sourceBillLicence.licenceRef
  }

  const newBillLicence = GenerateBillLicenceService.go(billingId, licence)

  dataToReturn.billLicences.push(newBillLicence)

  return newBillLicence
}

async function _sendReissueRequest (billRunExternalId, billExternalId) {
  const result = await ChargingModuleReissueBillService.go(billRunExternalId, billExternalId)

  if (!result.succeeded) {
    const error = new ExpandedError(
      'Charging Module reissue request failed',
      {
        billRunExternalId,
        billExternalId,
        responseBody: result.response.body
      }
    )

    throw error
  }

  // The CM returns a few bits of info but we only need the id
  return result.response.body.invoices.map((invoice) => {
    return invoice.id
  })
}

async function _sendViewBillRequest (billRun, reissueBillId) {
  const result = await ChargingModuleViewBillService.go(billRun.externalId, reissueBillId)

  if (!result.succeeded) {
    const error = new ExpandedError(
      'Charging Module view bill request failed',
      {
        billRunExternalId: billRun.externalId,
        reissueInvoiceExternalId: reissueBillId,
        responseBody: result.response.body
      }
    )

    throw error
  }

  return result.response.body.invoice
}

module.exports = {
  go
}
