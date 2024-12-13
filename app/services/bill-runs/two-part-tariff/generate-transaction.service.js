'use strict'

/**
 * Generate a two-part tariff transaction data from the the charge reference and other information passed in
 * @module GenerateTransactionService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Generate a two-part tariff transaction data from the the charge reference and other information passed in
 *
 * Unlike a standard transaction, we don't have to calculate the billing days for the transaction. Instead, two-part
 * tariff transactions focus on volume. This information comes from the review data that results after the match &
 * allocate results have been checked and amended by users.
 *
 * As well as allocated volume, users can override in the review
 *
 * - the authorised volume
 * - the aggregate
 * - the charge adjustment
 *
 * So, we have to grab those values as well. Finally, because the standard annual bill run will have handled the
 * compensation charge we don't have to generate an additional transaction alongside our two-part tariff one.
 *
 * @param {string} billLicenceId - The UUID of the bill licence the transaction will be linked to
 * @param {module:ChargeReferenceModel} chargeReference - The charge reference the transaction generated will be
 * generated from
 * @param {object} chargePeriod - A start and end date representing the charge period for the transaction
 * @param {boolean} newLicence - Whether the charge reference is linked to a new licence
 * @param {boolean} waterUndertaker - Whether the charge reference is linked to a water undertaker licence
 *
 * @returns {object} the two-part tariff transaction
 */
function go(billLicenceId, chargeReference, chargePeriod, newLicence, waterUndertaker) {
  const billableQuantity = _billableQuantity(chargeReference.chargeElements)

  if (billableQuantity === 0) {
    return null
  }

  return _standardTransaction(
    billLicenceId,
    billableQuantity,
    chargeReference,
    chargePeriod,
    newLicence,
    waterUndertaker
  )
}

function _billableQuantity(chargeElements) {
  return chargeElements.reduce((total, chargeElement) => {
    total += chargeElement.reviewChargeElements[0].amendedAllocated

    return total
  }, 0)
}

function _description(chargeReference) {
  // If the value is false, undefined, null or simply doesn't exist we return the standard description
  if (!chargeReference.adjustments.s127) {
    return `Water abstraction charge: ${chargeReference.description}`
  }

  return `Two-part tariff second part water abstraction charge: ${chargeReference.description}`
}

/**
 * Returns a json representation of all charge elements in a charge reference
 *
 * @private
 */
function _generateElements(chargeReference) {
  const jsonChargeElements = chargeReference.chargeElements.map((chargeElement) => {
    delete chargeElement.reviewChargeElements

    return chargeElement.toJSON()
  })

  return JSON.stringify(jsonChargeElements)
}

/**
 * Generates a standard transaction based on the supplied data, along with some default fields (eg. status)
 *
 * @private
 */
function _standardTransaction(
  billLicenceId,
  billableQuantity,
  chargeReference,
  chargePeriod,
  newLicence,
  waterUndertaker
) {
  return {
    id: generateUUID(),
    billLicenceId,
    authorisedDays: 0,
    billableDays: 0,
    newLicence,
    waterUndertaker,
    chargeReferenceId: chargeReference.id,
    startDate: chargePeriod.startDate,
    endDate: chargePeriod.endDate,
    source: chargeReference.source,
    season: 'all year',
    loss: chargeReference.loss,
    credit: false,
    chargeType: 'standard',
    authorisedQuantity: chargeReference.reviewChargeReferences[0].amendedAuthorisedVolume,
    billableQuantity,
    status: 'candidate',
    description: _description(chargeReference),
    volume: billableQuantity,
    section126Factor: Number(chargeReference.adjustments.s126) || 1,
    section127Agreement: !!chargeReference.adjustments.s127,
    section130Agreement: !!chargeReference.adjustments.s130,
    secondPartCharge: true,
    scheme: 'sroc',
    aggregateFactor: chargeReference.reviewChargeReferences[0].amendedAggregate,
    adjustmentFactor: chargeReference.reviewChargeReferences[0].amendedChargeAdjustment,
    chargeCategoryCode: chargeReference.chargeCategory.reference,
    chargeCategoryDescription: chargeReference.chargeCategory.shortDescription,
    supportedSource: !!chargeReference.additionalCharges?.supportedSource?.name,
    supportedSourceName: chargeReference.additionalCharges?.supportedSource?.name || null,
    waterCompanyCharge: !!chargeReference.additionalCharges?.isSupplyPublicWater,
    winterOnly: !!chargeReference.adjustments.winter,
    purposes: _generateElements(chargeReference)
  }
}

module.exports = {
  go
}
