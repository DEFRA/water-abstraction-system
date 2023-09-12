'use strict'

const { formatChargingModuleDate } = require('../base.presenter.js')

/**
 * Formats a transaction as a Charging Module API transaction request
 *
 * @param {Object} transaction the transaction object
 * @param {Object} billingPeriod The billing period of the transaction
 * @param {string} invoiceAccountNumber known as the customer reference in the Charging Module API
 * @param {module:LicenceModel} licence an instance of LicenceModel
 *
 * @returns {Object} an object to be used as the body in a Charging Module POST transaction request
 */
function go (transaction, billingPeriod, invoiceAccountNumber, licence) {
  const periodStart = formatChargingModuleDate(billingPeriod.startDate)
  const periodEnd = formatChargingModuleDate(billingPeriod.endDate)

  return {
    clientId: transaction.billingTransactionId,
    ruleset: transaction.scheme,
    periodStart,
    periodEnd,
    credit: transaction.isCredit,
    abatementFactor: transaction.section126Factor,
    adjustmentFactor: transaction.adjustmentFactor,
    actualVolume: transaction.volume,
    aggregateProportion: transaction.aggregateFactor,
    areaCode: licence.historicalAreaCode,
    authorisedDays: transaction.authorisedDays,
    authorisedVolume: transaction.authorisedQuantity,
    billableDays: transaction.billableDays,
    chargeCategoryCode: transaction.chargeCategoryCode,
    chargeCategoryDescription: transaction.chargeCategoryDescription,
    chargePeriod: `${periodStart} - ${periodEnd}`,
    compensationCharge: transaction.chargeType === 'compensation',
    customerReference: invoiceAccountNumber,
    licenceNumber: licence.licenceRef,
    lineDescription: transaction.description,
    loss: transaction.loss,
    region: licence.region.chargeRegionId,
    regionalChargingArea: licence.regionalChargeArea,
    section127Agreement: transaction.section127Agreement,
    section130Agreement: transaction.section130Agreement,
    supportedSource: transaction.isSupportedSource,
    supportedSourceName: transaction.supportedSourceName,
    twoPartTariff: transaction.isTwoPartSecondPartCharge,
    waterCompanyCharge: transaction.isWaterCompanyCharge,
    waterUndertaker: transaction.isWaterUndertaker,
    winterOnly: transaction.isWinterOnly
  }
}

module.exports = {
  go
}
