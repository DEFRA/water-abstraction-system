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
const FetchInvoiceAccountNumbersService = require('./fetch-invoice-account-numbers.service.js')
const GenerateBillingTransactionsService = require('./generate-billing-transactions.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const HandleErroredBillingBatchService = require('./handle-errored-billing-batch.service.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')
const ProcessBillingTransactionsService = require('./process-billing-transactions.service.js')
const UnflagUnbilledLicencesService = require('./unflag-unbilled-licences.service.js')

/**
 * Creates the invoices and transactions in both WRLS and the Charging Module API
 *
 * TODO: Currently a placeholder service. Proper implementation is coming
 *
 * @param {module:BillingBatchModel} billingBatch The newly created bill batch we need to process
 * @param {Object} billingPeriod An object representing the financial year the transaction is for
 */
async function go (billingBatch, billingPeriod) {
  const { billingBatchId } = billingBatch

  let isEmpty = true

  const billingData = {}

  try {
    // Mark the start time for later logging
    const startTime = process.hrtime.bigint()

    await _updateStatus(billingBatchId, 'processing')

    const chargeVersions = await _fetchChargeVersions(billingBatch, billingPeriod)
    const invoiceAccounts = await _fetchInvoiceAccounts(chargeVersions, billingBatchId)

    const billingInvoices = _preGenerateBillingInvoices(invoiceAccounts, billingBatchId, billingPeriod)
    const billingInvoiceLicences = _preGenerateBillingInvoiceLicences(chargeVersions, billingInvoices, billingBatch)

    for (const chargeVersion of chargeVersions) {
      const { billingInvoiceLicence, billingInvoice } = _retrievePreGeneratedData(
        chargeVersion,
        billingInvoices,
        billingInvoiceLicences
      )

      const { billingInvoiceLicenceId } = billingInvoiceLicence

      billingData[billingInvoiceLicenceId] = _updateBillingData(
        billingData[billingInvoiceLicenceId],
        chargeVersion,
        billingInvoice,
        billingInvoiceLicence
      )

      const calculatedTransactions = _generateTransactionsIfStatusIsCurrent(
        chargeVersion,
        billingPeriod,
        billingBatchId,
        billingData[billingInvoiceLicenceId]
      )
      billingData[billingInvoiceLicenceId].calculatedTransactions.push(...calculatedTransactions)
    }

    for (const currentBillingData of Object.values(billingData)) {
      const emptyInvoiceLicence = await _finaliseCurrentInvoiceLicence(currentBillingData, billingPeriod, billingBatch)
      if (!emptyInvoiceLicence) {
        isEmpty = false
      }
    }

    await _finaliseBillingBatch(billingBatch, chargeVersions, isEmpty)

    // Log how long the process took
    _calculateAndLogTime(billingBatchId, startTime)
  } catch (error) {
    _logError(billingBatch, error)
  }
}

function _retrievePreGeneratedData (chargeVersion, billingInvoices, billingInvoiceLicences) {
  const billingInvoice = billingInvoices[chargeVersion.invoiceAccountId]

  const billingInvoiceLicenceKey = _billingInvoiceLicenceKey(
    billingInvoice.billingInvoiceId,
    chargeVersion.licence.licenceId
  )
  const billingInvoiceLicence = billingInvoiceLicences[billingInvoiceLicenceKey]

  return { billingInvoice, billingInvoiceLicence }
}

async function _fetchInvoiceAccounts (chargeVersions, billingBatchId) {
  try {
    const invoiceAccounts = await FetchInvoiceAccountNumbersService.go(chargeVersions)

    return invoiceAccounts
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatchId)

    throw error
  }
}

/**
  * We pre-generate billing invoice licences for every combination of billing invoice and licence in the charge versions
  * so that we don't need to fetch any data from the db during the main charge version processing loop. This function
  * generates the required billing invoice licences and returns an object where each key is a concatenated billing
  * invoice id and licence id, and each value is the billing invoice licence for that combination of billing invoice and
  * licence, ie:
  *
  * {
  *   'key-1': { billingInvoiceLicenceId: 'billing-invoice-licence-1', ... },
  *   'key-2': { billingInvoiceLicenceId: 'billing-invoice-licence-2', ... }
  * }
  */
function _preGenerateBillingInvoiceLicences (chargeVersions, billingInvoices, billingBatch) {
  try {
    const keyedBillingInvoiceLicences = chargeVersions.reduce((acc, chargeVersion) => {
      const { billingInvoiceId } = billingInvoices[chargeVersion.invoiceAccountId]
      const { licence } = chargeVersion

      const key = _billingInvoiceLicenceKey(billingInvoiceId, licence.licenceId)

      // The charge versions may contain a combination of billing invoice and licence multiple times, so we check to see
      // if this combination has already had a billing invoice licence generated for it and return early if so
      if (acc.key) {
        return acc
      }

      return {
        ...acc,
        [key]: GenerateBillingInvoiceLicenceService.go(billingInvoiceId, licence)
      }
    }, {})

    return keyedBillingInvoiceLicences
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

    throw error
  }
}

function _billingInvoiceLicenceKey (billingInvoiceId, licenceId) {
  return `${billingInvoiceId}-${licenceId}`
}

/**
  * We pre-generate billing invoices for every invoice account so that we don't need to fetch any data from the db
  * during the main charge version processing loop. This function generates the required billing invoice licences and
  * returns an object where each key is the invoice account id, and each value is the billing invoice, ie:
  *
  * {
  *   'uuid-1': { invoiceAccountId: 'uuid-1', ... },
  *   'uuid-2': { invoiceAccountId: 'uuid-2', ... }
  * }
  */
function _preGenerateBillingInvoices (invoiceAccounts, billingBatchId, billingPeriod) {
  try {
    const keyedBillingInvoices = invoiceAccounts.reduce((acc, invoiceAccount) => {
      // Note that the array of invoice accounts will already have been deduped so we don't need to check whether a
      // billing invoice licence already exists in the object before generating one
      return {
        ...acc,
        [invoiceAccount.invoiceAccountId]: GenerateBillingInvoiceService.go(
          invoiceAccount,
          billingBatchId,
          billingPeriod.endDate.getFullYear()
        )
      }
    }, {})

    return keyedBillingInvoices
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatchId)

    throw error
  }
}

function _generateTransactionsIfStatusIsCurrent (chargeVersion, billingPeriod, billingBatchId) {
  // If the charge version status isn't 'current' then we don't need to add any new debit lines to the bill
  if (chargeVersion.status !== 'current') {
    return []
  }

  // Otherwise, it's likely to be something we have never billed previously so we need to calculate debit line(s)
  return _generateCalculatedTransactions(
    billingPeriod,
    chargeVersion,
    billingBatchId
  )
}

function _updateBillingData (currentBillingData, chargeVersion, billingInvoice, billingInvoiceLicence) {
  return {
    licence: chargeVersion.licence || null,
    billingInvoice: billingInvoice || null,
    billingInvoiceLicence: billingInvoiceLicence || null,
    calculatedTransactions: currentBillingData?.calculatedTransactions || []
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

async function _createBillingInvoiceLicence (currentBillingData, billingBatch) {
  const { billingInvoice, billingInvoiceLicence } = currentBillingData

  try {
    if (!billingInvoice.persisted) {
      await BillingInvoiceModel.query().insert(billingInvoice)
      billingInvoice.persisted = true
    }

    await BillingInvoiceLicenceModel.query().insert(billingInvoiceLicence)
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

    throw error
  }
}

async function _createBillingTransactions (currentBillingData, billingBatch, billingTransactions, billingPeriod) {
  const { licence, billingInvoice, billingInvoiceLicence } = currentBillingData

  try {
    for (const transaction of billingTransactions) {
      const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
        transaction,
        billingPeriod,
        billingInvoice.invoiceAccountNumber,
        licence
      )

      const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(billingBatch.externalId, chargingModuleRequest)

      transaction.status = 'charge_created'
      transaction.externalId = chargingModuleResponse.response.body.transaction.id
      transaction.billingInvoiceLicenceId = billingInvoiceLicence.billingInvoiceLicenceId

      await CreateBillingTransactionService.go(transaction)
    }
  } catch (error) {
    HandleErroredBillingBatchService.go(
      billingBatch.billingBatchId,
      BillingBatchModel.errorCodes.failedToCreateCharge
    )

    throw error
  }
}

async function _fetchChargeVersions (billingBatch, billingPeriod) {
  try {
    // We know in the future we will be calculating multiple billing periods and so will have to iterate through each,
    // generating bill runs and reviewing if there is anything to bill. For now, whilst our knowledge of the process
    // is low we are focusing on just the current financial year, and intending to ship a working version for just it.
    // This is why we are only passing through the first billing period; we know there is only one!
    const chargeVersions = await FetchChargeVersionsService.go(billingBatch.regionId, billingPeriod)

    // We don't just `return FetchChargeVersionsService.go()` as we need to call HandleErroredBillingBatchService if it
    // fails
    return chargeVersions
  } catch (error) {
    HandleErroredBillingBatchService.go(
      billingBatch.billingBatchId,
      BillingBatchModel.errorCodes.failedToProcessChargeVersions
    )

    throw error
  }
}

async function _finaliseBillingBatch (billingBatch, chargeVersions, isEmpty) {
  try {
    await UnflagUnbilledLicencesService.go(billingBatch.billingBatchId, chargeVersions)

    // The bill run is considered empty. We just need to set the status to indicate this in the UI
    if (isEmpty) {
      await _updateStatus(billingBatch.billingBatchId, 'empty')

      return
    }

    // We then need to tell the Charging Module to run its generate process. This is where the Charging module finalises
    // the debit and credit amounts, and adds any additional transactions needed, for example, minimum charge
    await ChargingModuleGenerateService.go(billingBatch.externalId)

    await LegacyRequestLib.post('water', `billing/batches/${billingBatch.billingBatchId}/refresh`)
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

    throw error
  }
}

async function _finaliseCurrentInvoiceLicence (currentBillingData, billingPeriod, billingBatch) {
  try {
    // Guard clause which is most likely to hit in the event that no charge versions were 'fetched' to be billed in the
    // first place
    if (!currentBillingData.billingInvoice) {
      return true
    }

    const cleansedTransactions = await ProcessBillingTransactionsService.go(
      currentBillingData.calculatedTransactions,
      currentBillingData.billingInvoice,
      currentBillingData.billingInvoiceLicence,
      billingPeriod
    )

    if (cleansedTransactions.length > 0) {
      await _createBillingTransactions(currentBillingData, billingBatch, cleansedTransactions, billingPeriod)
      await _createBillingInvoiceLicence(currentBillingData, billingBatch)

      return false
    }

    return true
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

    throw error
  }
}

function _generateCalculatedTransactions (billingPeriod, chargeVersion, billingBatchId) {
  try {
    const financialYearEnding = billingPeriod.endDate.getFullYear()
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, financialYearEnding)
    const isNewLicence = DetermineMinimumChargeService.go(chargeVersion, financialYearEnding)
    const isWaterUndertaker = chargeVersion.licence.isWaterUndertaker

    // We use flatMap as GenerateBillingTransactionsService returns an array of transactions
    const transactions = chargeVersion.chargeElements.flatMap((chargeElement) => {
      return GenerateBillingTransactionsService.go(
        chargeElement,
        billingPeriod,
        chargePeriod,
        isNewLicence,
        isWaterUndertaker
      )
    })

    return transactions
  } catch (error) {
    HandleErroredBillingBatchService.go(
      billingBatchId,
      BillingBatchModel.errorCodes.failedToPrepareTransactions
    )

    throw error
  }
}

function _logError (billingBatch, error) {
  global.GlobalNotifier.omfg(
    'Billing Batch process errored',
    {
      billingBatch,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })
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
