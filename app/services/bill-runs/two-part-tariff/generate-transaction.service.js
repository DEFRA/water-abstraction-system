'use strict'

/**
 * Generate transaction data from the the charge reference and other information passed in
 * @module GenerateTransactionService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

function go (billLicenceId, chargeReference, chargePeriod, newLicence, waterUndertaker) {
  const billableQuantity = _billableQuantity(chargeReference.chargeElements)

  return _standardTransaction(
    billLicenceId,
    billableQuantity,
    chargeReference,
    chargePeriod,
    newLicence,
    waterUndertaker
  )
}

function _billableQuantity (chargeElements) {
  return chargeElements.reduce((total, chargeElement) => {
    total += chargeElement.reviewChargeElements[0].amendedAllocated

    return total
  }, 0)
}

function _description (chargeReference) {
  // If the value is false, undefined, null or simply doesn't exist we return the standard description
  if (!chargeReference.adjustments.s127) {
    return `Water abstraction charge: ${chargeReference.description}`
  }

  return `Two-part tariff basic water abstraction charge: ${chargeReference.description}`
}

/**
 * Returns a json representation of all charge elements in a charge reference
 */
function _generateElements (chargeReference) {
  const jsonChargeElements = chargeReference.chargeElements.map((chargeElement) => {
    delete chargeElement.reviewChargeElements

    return chargeElement.toJSON()
  })

  return JSON.stringify(jsonChargeElements)
}

/**
 * Generates a standard transaction based on the supplied data, along with some default fields (eg. status)
 */
function _standardTransaction (
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
    volume: chargeReference.volume,
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
