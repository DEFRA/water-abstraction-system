'use strict'

/**
 * Processes a new billing batch
 * @module ProcessBillingBatchService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')
const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')
const ChargingModuleCreateTransactionService = require('../charging-module/create-transaction.service.js')
const ChargingModuleGenerateService = require('..//charging-module/generate-bill-run.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../presenters/charging-module/create-transaction.presenter.js')
const CreateBillingTransactionService = require('./create-billing-transaction.service.js')
const DetermineChargePeriodService = require('./determine-charge-period.service.js')
const DetermineMinimumChargeService = require('./determine-minimum-charge.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FetchBillingTransactionsService = require('./fetch-billing-transactions.service.js')
const GenerateBillingTransactionsService = require('./generate-billing-transactions.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const HandleErroredBillingBatchService = require('./handle-errored-billing-batch.service.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')
const ReverseBillingTransactionsService = require('./reverse-billing-transactions.service.js')

/**
 * Creates the invoices and transactions in both WRLS and the Charging Module API
 *
 * TODO: Currently a placeholder service. Proper implementation is coming
 *
 * @param {module:BillingBatchModel} billingBatch The newly created bill batch we need to process
 * @param {Object} billingPeriod an object representing the financial year the transaction is for
 */
async function go (billingBatch, billingPeriod) {
  const { billingBatchId } = billingBatch

  // NOTE: This is where we store generated data that _might_ be persisted when we finalise the billing batch. We need
  // to generate invoice and invoice licence information so we can persist those transactions we want to bill. When we
  // persist a transaction we flag the accompanying invoice and invoice licence as needing persisting. We use licenceIds
  // to track which licences we've already created reverse transactions for.
  //
  // So please note, a number of our methods are mutating this information as the billing batch is processed.
  const generatedData = {
    invoices: [],
    invoiceLicences: [],
    processedLicences: []
  }
  try {
    // Mark the start time for later logging
    const startTime = process.hrtime.bigint()

    await _updateStatus(billingBatchId, 'processing')

    const chargeVersions = await _fetchChargeVersions(billingBatch, billingPeriod)

    for (const chargeVersion of chargeVersions) {
      const standardTransactionsData = await _generateStandardTransactions(generatedData, chargeVersion, billingBatch, billingPeriod)
      const reverseTransactionsData = await _generateReverseTransactions(generatedData, chargeVersion, billingBatch, billingPeriod)

      const cleansedTransactionLines = _cleanseTransactionLines(standardTransactionsData, reverseTransactionsData)

      await _createTransactions(
        cleansedTransactionLines.standardTransactionLines,
        standardTransactionsData.billingPeriod,
        standardTransactionsData.billingInvoice,
        standardTransactionsData.billingInvoiceLicence,
        standardTransactionsData.chargeVersion,
        standardTransactionsData.billingBatch
      )

      if (reverseTransactionsData.length !== 0) {
        await _createTransactions(
          cleansedTransactionLines.reverseTransactionLines,
          reverseTransactionsData.billingPeriod,
          reverseTransactionsData.billingInvoice,
          reverseTransactionsData.billingInvoiceLicence,
          reverseTransactionsData.chargeVersion,
          reverseTransactionsData.billingBatch
        )
      }
    }

    await _finaliseBillingBatch(generatedData, billingBatch)

    // Log how long the process took
    _calculateAndLogTime(billingBatchId, startTime)
  } catch (error) {
    global.GlobalNotifier.omfg('Billing Batch process errored', { billingBatch, error })
  }
}

/**
 * Remove any "cancelling pairs" of transaction lines. We define a "cancelling pair" as a pair of transactions belonging
 * to the same billing invoice licence which would send the same data to the Charging Module (and therefore return the
 * same values) but with opposing credit flags -- in other words, a credit and a debit which cancel each other out.
 */
function _cleanseTransactionLines (standardTransactionsData, reverseTransactionsData) {
  const standardTransactionLines = standardTransactionsData.transactionLines
  const reverseTransactionLines = reverseTransactionsData.transactionLines

  const cmStandardTransactions = standardTransactionLines.map((transaction) => {
    return {
      ...ChargingModuleCreateTransactionPresenter.go(
        transaction,
        standardTransactionsData.billingPeriod,
        standardTransactionsData.billingInvoice.invoiceAccountNumber,
        standardTransactionsData.chargeVersion.licence
      ),
      // We add the billing invoice licence to each object to make identifying cancelling pairs easier
      billingInvoiceLicence: standardTransactionsData.billingInvoiceLicence
    }
  })

  const cmReverseTransactions = reverseTransactionLines.map((transaction) => {
    return {
      ...ChargingModuleCreateTransactionPresenter.go(
        transaction,
        reverseTransactionsData.billingPeriod,
        reverseTransactionsData.billingInvoice.invoiceAccountNumber,
        reverseTransactionsData.chargeVersion.licence
      ),
      // We add the billing invoice licence to each object to make identifying cancelling pairs easier
      billingInvoiceLicence: reverseTransactionsData.billingInvoiceLicence
    }
  })

  return {
    standardTransactionLines,
    reverseTransactionLines
  }
}

/**
   * Log the time taken to process the billing batch
   *
   * If `notifier` is not set then it will do nothing. If it is set this will get the current time and then calculate the
   * difference from `startTime`. This and the `billRunId` are then used to generate a log message.
   *
   * @param {string} billingBatchId Id of the billing batch currently being 'processed'
   * @param {BigInt} startTime The time the generate process kicked off. It is expected to be the result of a call to
   * `process.hrtime.bigint()`
   */
function _calculateAndLogTime (billingBatchId, startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg(`Time taken to process billing batch ${billingBatchId}: ${timeTakenMs}ms`)
}

async function _generateReverseTransactions (generatedData, chargeVersion, billingBatch, billingPeriod) {
  const { licence } = chargeVersion
  const { billingBatchId } = billingBatch

  try {
    const billingTransactions = await _fetchPreviousTransactions(generatedData, licence, billingPeriod)

    // If there are no previous transactions to reverse we stop processing at this point
    if (billingTransactions.length === 0) {
      return []
    }

    const billingInvoice = await _generateBillingInvoice(
      generatedData,
      { invoiceAccountId: billingTransactions[0].invoiceAccountId },
      billingBatch.billingBatchId,
      billingPeriod
    )

    const billingInvoiceLicence = _generateBillingInvoiceLicence(generatedData, billingInvoice, licence)

    const transactionLines = ReverseBillingTransactionsService.go(billingTransactions, billingInvoiceLicence)

    // Return an array which are the arguments in order that we will later supply to _createTransactions()
    return {
      transactionLines,
      billingPeriod,
      billingInvoice,
      billingInvoiceLicence,
      chargeVersion,
      billingBatch
    }
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatchId)

    throw error
  }
}

async function _generateStandardTransactions (generatedData, chargeVersion, billingBatch, billingPeriod) {
  const { licence } = chargeVersion
  const { billingBatchId } = billingBatch

  try {
    const billingInvoice = await _generateBillingInvoice(generatedData, chargeVersion, billingBatchId, billingPeriod)
    const billingInvoiceLicence = _generateBillingInvoiceLicence(generatedData, billingInvoice, licence)

    const transactionLines = _generateTransactions(billingPeriod, chargeVersion, billingBatchId)

    // Return an object containing the arguments we will later supply to _createTransactions()
    return {
      transactionLines,
      billingPeriod,
      billingInvoice,
      billingInvoiceLicence,
      chargeVersion,
      billingBatch
    }
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatchId)

    throw error
  }
}

async function _fetchPreviousTransactions (generatedData, licence, billingPeriod) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()

  const previousTransactionData = await FetchBillingTransactionsService.go(
    generatedData.processedLicences,
    licence,
    financialYearEnding
  )
  generatedData.processedLicences = previousTransactionData.processedLicences

  return previousTransactionData.billingTransactions
}

async function _generateBillingInvoice (generatedData, chargeVersion, billingBatchId, billingPeriod) {
  const billingInvoiceData = await GenerateBillingInvoiceService.go(
    generatedData.invoices,
    chargeVersion.invoiceAccountId,
    billingBatchId,
    billingPeriod.endDate.getFullYear()
  )
  generatedData.invoices = billingInvoiceData.billingInvoices

  return billingInvoiceData.billingInvoice
}

function _generateBillingInvoiceLicence (generatedData, billingInvoice, licence) {
  const billingInvoiceLicenceData = GenerateBillingInvoiceLicenceService.go(
    generatedData.invoiceLicences,
    billingInvoice.billingInvoiceId,
    licence
  )
  generatedData.invoiceLicences = billingInvoiceLicenceData.billingInvoiceLicences

  return billingInvoiceLicenceData.billingInvoiceLicence
}

async function _fetchChargeVersions (billingBatch, billingPeriod) {
  try {
    // We know in the future we will be calculating multiple billing periods and so will have to iterate through each,
    // generating bill runs and reviewing if there is anything to bill. For now, whilst our knowledge of the process
    // is low we are focusing on just the current financial year, and intending to ship a working version for just it.
    // This is why we are only passing through the first billing period; we know there is only one!
    return await FetchChargeVersionsService.go(billingBatch.regionId, billingPeriod)
  } catch (error) {
    HandleErroredBillingBatchService.go(
      billingBatch.billingBatchId,
      BillingBatchModel.errorCodes.failedToProcessChargeVersions
    )

    throw error
  }
}

async function _createTransactions (
  transactionLines,
  billingPeriod,
  billingInvoice,
  billingInvoiceLicence,
  chargeVersion,
  billingBatch
) {
  if (transactionLines.length === 0) {
    return
  }

  try {
    for (const transaction of transactionLines) {
      const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
        transaction,
        billingPeriod,
        billingInvoice.invoiceAccountNumber,
        chargeVersion.licence
      )

      const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(billingBatch.externalId, chargingModuleRequest)

      transaction.status = 'charge_created'
      transaction.externalId = chargingModuleResponse.response.body.transaction.id
      transaction.billingInvoiceLicenceId = billingInvoiceLicence.billingInvoiceLicenceId

      await CreateBillingTransactionService.go(transaction)
    }

    billingInvoice.persist = true
    billingInvoiceLicence.persist = true
  } catch (error) {
    HandleErroredBillingBatchService.go(
      billingBatch.billingBatchId,
      BillingBatchModel.errorCodes.failedToCreateCharge
    )

    throw error
  }
}

async function _finaliseBillingBatch (generatedData, billingBatch) {
  const { invoices, invoiceLicences } = generatedData
  const { billingBatchId, externalId } = billingBatch

  try {
    const billingInvoicesToInsert = invoices.filter((billingInvoice) => billingInvoice.persist)

    // The bill run is considered empty. We just need to set the status to indicate this in the UI
    if (billingInvoicesToInsert.length === 0) {
      await _updateStatus(billingBatchId, 'empty')

      return
    }

    // We need to persist the billing invoice and billing invoice licence records
    const billingInvoiceLicencesToInsert = invoiceLicences.filter((invoiceLicence) => invoiceLicence.persist)

    await _persistBillingInvoices(billingInvoicesToInsert)
    await _persistBillingInvoiceLicences(billingInvoiceLicencesToInsert)

    // We then need to tell the Charging Module to run its generate process. This is where the Charging module finalises
    // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
    await ChargingModuleGenerateService.go(externalId)

    // We then tell our legacy service to queue up its refresh totals job. This requests the finalised bill run and
    // invoice detail from the Charging Module and updates our data with it. The good news is the legacy code handles
    // all that within this job. We just need to queue it up 😁
    await LegacyRequestLib.post('water', `billing/batches/${billingBatchId}/refresh`)
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatchId)

    throw error
  }
}

function _generateTransactions (billingPeriod, chargeVersion, billingBatchId) {
  try {
    const financialYearEnding = billingPeriod.endDate.getFullYear()
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, financialYearEnding)
    const isNewLicence = DetermineMinimumChargeService.go(chargeVersion, financialYearEnding)
    const isWaterUndertaker = chargeVersion.licence.isWaterUndertaker

    const transactions = []
    for (const chargeElement of chargeVersion.chargeElements) {
      const result = GenerateBillingTransactionsService.go(
        chargeElement,
        billingPeriod,
        chargePeriod,
        isNewLicence,
        isWaterUndertaker
      )
      transactions.push(...result)
    }

    return transactions
  } catch (error) {
    HandleErroredBillingBatchService.go(
      billingBatchId,
      BillingBatchModel.errorCodes.failedToPrepareTransactions
    )

    throw error
  }
}

async function _persistBillingInvoiceLicences (billingInvoiceLicences) {
  // We have to remove the .persist flag we added else the SQL query Objection will generate will fail. So, we use
  // object destructuring assignment to assign the `persist:` property to one var, and the rest to 'another' (which we
  // name `propertiesToPersist`). We then have map() just return `propertiesToPersist` leaving 'persist' behind!
  // Credit: https://stackoverflow.com/a/46839399/6117745
  const insertData = billingInvoiceLicences.map((billingInvoiceLicence) => {
    const { persist, ...propertiesToPersist } = billingInvoiceLicence

    return propertiesToPersist
  })

  await BillingInvoiceLicenceModel.query()
    .insert(insertData)
}

async function _persistBillingInvoices (billingInvoices) {
  const insertData = billingInvoices.map((billingInvoice) => {
    const { persist, ...propertiesToPersist } = billingInvoice

    return propertiesToPersist
  })

  await BillingInvoiceModel.query()
    .insert(insertData)
}

async function _updateStatus (billingBatchId, status) {
  try {
    await BillingBatchModel.query()
      .findById(billingBatchId)
      .patch({ status })
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatchId)

    throw error
  }
}

module.exports = {
  go
}
