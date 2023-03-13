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

let generatedInvoices = []
let generatedInvoiceLicences = []

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

  try {
    await _updateStatus(billingBatchId, 'processing')

    const chargeVersions = await _fetchChargeVersions(billingBatch, billingPeriod)

    for (const chargeVersion of chargeVersions) {
      const { chargeElements, licence } = chargeVersion

      const billingInvoice = await _generateBillingInvoice(chargeVersion, billingBatchId, billingPeriod)
      const billingInvoiceLicence = _generateBillingInvoiceLicence(billingInvoice, licence)

      if (chargeElements) {
        const transactionLines = _generateTransactionLines(billingPeriod, chargeVersion, billingBatchId)

        if (transactionLines.length > 0) {
          await _createTransactionLines(
            transactionLines,
            billingPeriod,
            billingInvoice,
            billingInvoiceLicence,
            chargeVersion,
            billingBatch
          )
        }
      }
    }

    await _finaliseBillingBatch(billingBatch, generatedInvoices, generatedInvoiceLicences)
  } catch (error) {
    global.GlobalNotifier.omfg('Billing Batch process errored', { billingBatch, error })
  }
}

async function _generateBillingInvoice (chargeVersion, billingBatchId, billingPeriod) {
  try {
    const billingInvoiceData = await GenerateBillingInvoiceService.go(
      generatedInvoices,
      chargeVersion.invoiceAccountId,
      billingBatchId,
      billingPeriod.endDate.getFullYear()
    )
    generatedInvoices = billingInvoiceData.billingInvoices

    return billingInvoiceData.billingInvoice
  } catch (error) {
    HandleErroredBillingBatchService.go(billingBatchId)

    throw error
  }
}

function _generateBillingInvoiceLicence (billingInvoice, licence) {
  try {
    const billingInvoiceLicenceData = GenerateBillingInvoiceLicenceService.go(
      generatedInvoiceLicences,
      billingInvoice.billingInvoiceId,
      licence
    )
    generatedInvoiceLicences = billingInvoiceLicenceData.billingInvoiceLicences

    return billingInvoiceLicenceData.billingInvoiceLicence
  } catch (error) {
    HandleErroredBillingBatchService.go(billingInvoice.billingBatchId)

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

    return chargeVersions
  } catch (error) {
    HandleErroredBillingBatchService.go(
      billingBatch.billingBatchId,
      BillingBatchModel.errorCodes.failedToProcessChargeVersions
    )

    throw error
  }
}

async function _createTransactionLines (
  transactionLines,
  billingPeriod,
  billingInvoice,
  billingInvoiceLicence,
  chargeVersion,
  billingBatch
) {
  try {
    for (const transaction of transactionLines) {
      const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
        transaction,
        billingPeriod,
        billingInvoice.invoiceAccountNumber,
        chargeVersion.licence
      )

      const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(billingBatch.externalId, chargingModuleRequest)

      // TODO: Handle a failed request
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

async function _finaliseBillingBatch (billingBatch, generatedInvoices, generatedInvoiceLicences) {
  try {
    const { billingBatchId, externalId } = billingBatch

    const billingInvoicesToInsert = generatedInvoices.filter((billingInvoice) => billingInvoice.persist)

    // The bill run is considered empty. We just need to set the status to indicate this in the UI
    if (billingInvoicesToInsert.length === 0) {
      await _updateStatus(billingBatchId, 'empty')

      return
    }

    // We need to persist the billing invoice and billing invoice licence records
    const billingInvoiceLicencesToInsert = generatedInvoiceLicences.filter((invoiceLicence) => invoiceLicence.persist)

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
    HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

    throw error
  }
}

function _generateTransactionLines (billingPeriod, chargeVersion, billingBatchId) {
  try {
    const financialYearEnding = billingPeriod.endDate.getFullYear()
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, financialYearEnding)
    const isNewLicence = DetermineMinimumChargeService.go(chargeVersion, financialYearEnding)
    const isWaterUndertaker = chargeVersion.licence.isWaterUndertaker

    const transactionLines = []
    for (const chargeElement of chargeVersion.chargeElements) {
      const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)
      transactionLines.push(...result)
    }

    return transactionLines
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
