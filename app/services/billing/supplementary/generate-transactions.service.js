'use strict'

/**
 * Generate transaction data from the the charge reference and other information passed in
 * @module GenerateTransactionsService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

const CalculateAuthorisedAndBillableDaysServiceService = require('./calculate-authorised-and-billable-days.service.js')

/**
 * Generates an array of transactions ready to be persisted as `billing_transactions`
 *
 * The service first uses the charge reference and period data to determine if there are any billable days. If there are
 * none, it returns an empty array. With nothing to bill there is no point in generating any transaction line objects.
 *
 * If there are billable days, it will generate a transaction object where the `chargeType` is 'standard'.
 *
 * If the `isWaterUndertaker` flag was false, it will then generate a second 'compensation' transaction object based on
 * the first. The only differences are the charge type and description properties. This is something the Charging
 * Module expects to receive when the licence is for a water undertaker.
 *
 * They will then be returned in an array for further processing before being persisted to the DB as
 * `billing_transactions`.
 *
 * @param {Object} chargeReference The charge reference the transaction generated from
 * @param {Object} billingPeriod A start and end date representing the billing period for the bill run
 * @param {Object} chargePeriod A start and end date representing the charge period for the charge version
 * @param {Boolean} isNewLicence Whether the charge version is linked to a new licence
 * @param {Boolean} isWaterUndertaker Whether the charge version is linked to a water undertaker licence
 *
 * @returns {Object[]} an array of 0, 1 or 2 transaction objects
 */
function go (chargeReference, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker) {
  const { authorisedDays, billableDays } = CalculateAuthorisedAndBillableDaysServiceService.go(
    chargePeriod,
    billingPeriod,
    chargeReference
  )

  const transactions = []

  if (billableDays === 0) {
    return transactions
  }

  const standardTransaction = _standardTransaction(
    generateUUID(),
    authorisedDays,
    billableDays,
    chargeReference,
    chargePeriod,
    isNewLicence,
    isWaterUndertaker
  )
  transactions.push(standardTransaction)

  if (!isWaterUndertaker) {
    const compensationTransaction = _compensationTransaction(generateUUID(), standardTransaction)
    transactions.push(compensationTransaction)
  }

  return transactions
}

/**
 * Generates a compensation transaction by taking a standard transaction and overwriting it with the supplied billing id
 * and the correct charge type and description for a compensation charge.
 */
function _compensationTransaction (transactionId, standardTransaction) {
  return {
    ...standardTransaction,
    billingTransactionId: transactionId,
    chargeType: 'compensation',
    description: 'Compensation charge: calculated from the charge reference, activity description and regional environmental improvement charge; excludes any supported source additional charge and two-part tariff charge agreement'
  }
}

function _description (chargeReference) {
  // If the value is false, undefined, null or simply doesn't exist we return the standard description
  if (!chargeReference.adjustments.s127) {
    return `Water abstraction charge: ${chargeReference.description}`
  }

  return `Two-part tariff basic water abstraction charge: ${chargeReference.description}`
}

/**
 * Returns a json representation of all charge purposes in a charge element
 */
function _generatePurposes (chargeReference) {
  const jsonChargePurposes = chargeReference.chargePurposes.map((chargePurpose) => {
    return chargePurpose.toJSON()
  })

  return JSON.stringify(jsonChargePurposes)
}

/**
 * Generates a standard transaction based on the supplied data, along with some default fields (eg. status)
 */
function _standardTransaction (
  transactionId,
  authorisedDays,
  billableDays,
  chargeReference,
  chargePeriod,
  isNewLicence,
  isWaterUndertaker
) {
  return {
    billingTransactionId: transactionId,
    authorisedDays,
    billableDays,
    isNewLicence,
    isWaterUndertaker,
    chargeElementId: chargeReference.chargeElementId,
    startDate: chargePeriod.startDate,
    endDate: chargePeriod.endDate,
    source: chargeReference.source,
    season: 'all year',
    loss: chargeReference.loss,
    isCredit: false,
    chargeType: 'standard',
    authorisedQuantity: chargeReference.volume,
    billableQuantity: chargeReference.volume,
    status: 'candidate',
    description: _description(chargeReference),
    volume: chargeReference.volume,
    section126Factor: Number(chargeReference.adjustments.s126) || 1,
    section127Agreement: !!chargeReference.adjustments.s127,
    section130Agreement: !!chargeReference.adjustments.s130,
    // NOTE: We do not currently support two part tariff bill runs. We set this to false until we implement that
    // functionality and understand what determines the flag
    isTwoPartSecondPartCharge: false,
    scheme: 'sroc',
    aggregateFactor: Number(chargeReference.adjustments.aggregate) || 1,
    adjustmentFactor: Number(chargeReference.adjustments.charge) || 1,
    chargeCategoryCode: chargeReference.chargeCategory.reference,
    chargeCategoryDescription: chargeReference.chargeCategory.shortDescription,
    isSupportedSource: !!chargeReference.additionalCharges?.supportedSource?.name,
    supportedSourceName: chargeReference.additionalCharges?.supportedSource?.name || null,
    isWaterCompanyCharge: !!chargeReference.additionalCharges?.isSupplyPublicWater,
    isWinterOnly: !!chargeReference.adjustments.winter,
    purposes: _generatePurposes(chargeReference)
  }
}

module.exports = {
  go
}
