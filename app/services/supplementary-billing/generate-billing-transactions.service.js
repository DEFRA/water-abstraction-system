'use strict'

/**
 * Transforms provided data into the format required for an sroc transaction line
 *
 * @module FormatSrocTransactionLineService
 */

const { randomUUID } = require('crypto')

const CalculateAuthorisedAndBillableDaysServiceService = require('./calculate-authorised-and-billable-days.service.js')

/**
 * Takes a charge element, charge version and financial year and returns an object representing an sroc transaction
 * line, formatted ready to be inserted into the db.
 *
 * @param {Object} chargeElement The charge element the transaction is to be created for.
 * @param {Integer} billingPeriod The billing period the transaction is to be created for.
 *
 * @returns {Object} The formatted transaction line data.
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
    // We set `disableEntropyCache` to `false` as normally, for performance reasons node caches enough random data to
    // generate up to 128 UUIDs. We disable this as we may need to generate more than this and the performance hit in
    // disabling this cache is a rounding error in comparison to the rest of the process.
    //
    // https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
    billingTransactionId: randomUUID({ disableEntropyCache: true }),
    authorisedDays,
    billableDays,
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
    isNewLicence,
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
    isWaterUndertaker,
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
