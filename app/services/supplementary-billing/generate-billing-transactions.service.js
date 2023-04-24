'use strict'

/**
 * Generate billing transaction data from the the charge element and other information passed in
 * @module GenerateBillingTransactionsService
 */

const { randomUUID } = require('crypto')

const CalculateAuthorisedAndBillableDaysServiceService = require('./calculate-authorised-and-billable-days.service.js')

/**
 * Generates an array of transactions ready to be persisted as `billing_transactions`
 *
 * The service first uses the charge element and period data to determine if there are any billable days. If there are
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
 * @param {Object} chargeElement The charge element the transaction generated from
 * @param {Object} billingPeriod A start and end date representing the billing period for the billing batch
 * @param {Object} chargePeriod A start and end date representing the charge period for the charge version
 * @param {Boolean} isNewLicence Whether the charge version is linked to a new licence
 * @param {Boolean} isWaterUndertaker Whether the charge version is linked to a water undertaker licence
 *
 * @returns {Object[]} an array of 0, 1 or 2 transaction objects
 */
function go (chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker) {
  const { authorisedDays, billableDays } = CalculateAuthorisedAndBillableDaysServiceService.go(
    chargePeriod,
    billingPeriod,
    chargeElement
  )

  const billingTransactions = []

  if (billableDays === 0) {
    return billingTransactions
  }

  const standardTransaction = _standardTransaction(
    _generateUuid(),
    authorisedDays,
    billableDays,
    chargeElement,
    chargePeriod,
    isNewLicence,
    isWaterUndertaker
  )
  billingTransactions.push(standardTransaction)

  if (!isWaterUndertaker) {
    const compensationTransaction = _compensationTransaction(_generateUuid(), standardTransaction)
    billingTransactions.push(compensationTransaction)
  }

  return billingTransactions
}

function _compensationTransaction (billingTransactionId, standardTransaction) {
  return {
    ...standardTransaction,
    billingTransactionId,
    chargeType: 'compensation',
    description: 'Compensation charge: calculated from the charge reference, activity description and regional environmental improvement charge; excludes any supported source additional charge and two-part tariff charge agreement'
  }
}

/**
 * Return a unique UUID to be used as an ID
 *
 * We only intend to persist the transaction and associated billing invoice and licence if there is something to bill!
 * But we have to provide the charging module with the ID of our transaction so it can protect against duplicates.
 *
 * So, we generate our transaction ID's in the code and avoid having to send a DB insert just to get back an ID to use.
 *
 * @returns {string} a unique UUID
 */
function _generateUuid () {
  // We set `disableEntropyCache` to `false` as normally, for performance reasons node caches enough random data to
  // generate up to 128 UUIDs. We disable this as we may need to generate more than this and the performance hit in
  // disabling this cache is a rounding error in comparison to the rest of the process.
  //
  // https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
  return randomUUID({ disableEntropyCache: true })
}

/**
 * Returns a json representation of all charge purposes in a charge element
 */
function _generatePurposes (chargeElement) {
  const jsonChargePurposes = chargeElement.chargePurposes.map((chargePurpose) => {
    return chargePurpose.toJSON()
  })

  return JSON.stringify(jsonChargePurposes)
}

function _standardTransaction (
  billingTransactionId,
  authorisedDays,
  billableDays,
  chargeElement,
  chargePeriod,
  isNewLicence,
  isWaterUndertaker
) {
  return {
    billingTransactionId,
    authorisedDays,
    billableDays,
    isNewLicence,
    isWaterUndertaker,
    chargeElementId: chargeElement.chargeElementId,
    startDate: chargePeriod.startDate,
    endDate: chargePeriod.endDate,
    source: chargeElement.source,
    season: 'all year',
    loss: chargeElement.loss,
    isCredit: false,
    chargeType: 'standard',
    authorisedQuantity: chargeElement.volume,
    billableQuantity: chargeElement.volume,
    status: 'candidate',
    description: `Water abstraction charge: ${chargeElement.description}`,
    volume: chargeElement.volume,
    section126Factor: chargeElement.adjustments.s126 || 1,
    section127Agreement: !!chargeElement.adjustments.s127,
    section130Agreement: !!chargeElement.adjustments.s130,
    // NOTE: We do not currently support two part tariff bill runs. We set this to false until we implement that
    // functionality and understand what determines the flag
    isTwoPartSecondPartCharge: false,
    scheme: 'sroc',
    aggregateFactor: chargeElement.adjustments.aggregate || 1,
    adjustmentFactor: chargeElement.adjustments.charge || 1,
    chargeCategoryCode: chargeElement.billingChargeCategory.reference,
    chargeCategoryDescription: chargeElement.billingChargeCategory.shortDescription,
    isSupportedSource: !!chargeElement.additionalCharges?.supportedSource?.name,
    supportedSourceName: chargeElement.additionalCharges?.supportedSource?.name || null,
    isWaterCompanyCharge: !!chargeElement.additionalCharges?.isSupplyPublicWater,
    isWinterOnly: !!chargeElement.adjustments.winter,
    purposes: _generatePurposes(chargeElement)
  }
}

module.exports = {
  go
}
