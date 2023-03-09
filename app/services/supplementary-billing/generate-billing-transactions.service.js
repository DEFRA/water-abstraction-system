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
 * @param {Object} chargeElement the charge element the transaction generated from
 * @param {Object} billingPeriod a start and end date representing the billing period for the billing batch
 * @param {Object} chargePeriod a start and end date representing the charge period for the charge version
 * @param {boolean} isNewLicence whether the charge version is linked to a new licence
 * @param {boolean} isWaterUndertaker whether the charge version is linked to a water undertaker licence
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

  billingTransactions.push(
    _standardTransaction(
      authorisedDays,
      billableDays,
      chargeElement,
      chargePeriod,
      isNewLicence,
      isWaterUndertaker
    )
  )

  if (!isWaterUndertaker) {
    billingTransactions.push(_compensationTransaction(billingTransactions[0]))
  }

  return billingTransactions
}

function _compensationTransaction (standardTransaction) {
  return {
    ...standardTransaction,
    billingTransactionId: randomUUID({ disableEntropyCache: true }),
    chargeType: 'compensation',
    description: 'Compensation charge: calculated from the charge reference, activity description and regional environmental improvement charge; excludes any supported source additional charge and two-part tariff charge agreement'
  }
}

function _standardTransaction (
  authorisedDays,
  billableDays,
  chargeElement,
  chargePeriod,
  isNewLicence,
  isWaterUndertaker
) {
  return {
    authorisedDays,
    billableDays,
    isNewLicence,
    // We set `disableEntropyCache` to `false` as normally, for performance reasons node caches enough random data to
    // generate up to 128 UUIDs. We disable this as we may need to generate more than this and the performance hit in
    // disabling this cache is a rounding error in comparison to the rest of the process.
    //
    // https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
    billingTransactionId: randomUUID({ disableEntropyCache: true }),
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

/**
 * Returns a json representation of all charge purposes in a charge element
 */
function _generatePurposes (chargeElement) {
  const jsonChargePurposes = chargeElement.chargePurposes.map((chargePurpose) => {
    return chargePurpose.toJSON()
  })

  return JSON.stringify(jsonChargePurposes)
}

module.exports = {
  go
}
