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
const GenerateBillingTransactionsService = require('./generate-billing-transactions.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const HandleErroredBillingBatchService = require('./handle-errored-billing-batch.service.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')
const ProcessBillingTransactionsService = require('./process-billing-transactions.service.js')

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

  const currentBillingData = {
    isEmpty: true,
    licence: null,
    billingInvoice: null,
    billingInvoiceLicence: null,
    standardTransactions: []
  }

  try {
    // Mark the start time for later logging
    const startTime = process.hrtime.bigint()

    await _updateStatus(billingBatchId, 'processing')

    const chargeVersions = await _fetchChargeVersions(billingBatch, billingPeriod)

    for (const chargeVersion of chargeVersions) {
      const { billingInvoice, billingInvoiceLicence } = await _generateInvoiceData(
        currentBillingData,
        billingBatch,
        chargeVersion,
        billingPeriod
      )

      // We need to deal with the very first iteration when currentBillingData is all nulls! So, we check both there is
      // a billingInvoiceLicence and that its ID is different
      if (
        currentBillingData.billingInvoiceLicence &&
        currentBillingData.billingInvoiceLicence.billingInvoiceLicenceId !== billingInvoiceLicence.billingInvoiceLicenceId
      ) {
        await _finaliseCurrentInvoiceLicence(currentBillingData, billingPeriod, billingBatch)
        currentBillingData.standardTransactions = []
      }

      currentBillingData.licence = chargeVersion.licence
      currentBillingData.billingInvoice = billingInvoice
      currentBillingData.billingInvoiceLicence = billingInvoiceLicence

      const standardTransactions = _generateStandardTransactions(billingPeriod, chargeVersion, billingBatchId, billingInvoiceLicence)
      currentBillingData.standardTransactions.push(...standardTransactions)
    }
    await _finaliseCurrentInvoiceLicence(currentBillingData, billingPeriod, billingBatch)

    await _finaliseBillingBatch(billingBatch, currentBillingData.isEmpty)

    // Log how long the process took
    _calculateAndLogTime(billingBatchId, startTime)
  } catch (error) {
    global.GlobalNotifier.omfg('Billing Batch process errored', { billingBatch, error })
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
    return await FetchChargeVersionsService.go(billingBatch.regionId, billingPeriod)
  } catch (error) {
    HandleErroredBillingBatchService.go(
      billingBatch.billingBatchId,
      BillingBatchModel.errorCodes.failedToProcessChargeVersions
    )

    throw error
  }
}

async function _finaliseBillingBatch (billingBatch, isEmpty) {
  try {
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
    const cleansedTransactions = await ProcessBillingTransactionsService.go(
      currentBillingData.standardTransactions,
      currentBillingData.billingInvoice,
      currentBillingData.billingInvoiceLicence,
      billingPeriod
    )

    if (cleansedTransactions.length > 0) {
      currentBillingData.isEmpty = false

      await _createBillingTransactions(currentBillingData, billingBatch, cleansedTransactions, billingPeriod)
      await _createBillingInvoiceLicence(currentBillingData, billingBatch)
    }
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

    throw error
  }
}

async function _generateInvoiceData (currentBillingData, billingBatch, chargeVersion, billingPeriod) {
  try {
    const { invoiceAccountId, licence } = chargeVersion
    const { billingBatchId } = billingBatch
    const financialYearEnding = billingPeriod.endDate.getFullYear()

    const billingInvoice = await GenerateBillingInvoiceService.go(currentBillingData.billingInvoice, invoiceAccountId, billingBatchId, financialYearEnding)
    const billingInvoiceLicence = GenerateBillingInvoiceLicenceService.go(currentBillingData.billingInvoiceLicence, billingInvoice.billingInvoiceId, licence)

    return {
      billingInvoice,
      billingInvoiceLicence
    }
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

    throw error
  }
}

function _generateStandardTransactions (billingPeriod, chargeVersion, billingBatchId, billingInvoiceLicence) {
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
      result.billingInvoiceLicenceId = billingInvoiceLicence.billingInvoiceLicenceId
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
