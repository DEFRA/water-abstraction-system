'use strict'

const { formatChargingModuleDate } = require('../base.presenter.js')

/**
 * Formats a transaction as a Charging Module API transaction request
 *
 * @param {object} transaction - the transaction object
 * @param {object} billingPeriod - The billing period of the transaction
 * @param {string} accountNumber - known as the customer reference in the Charging Module API
 * @param {module:LicenceModel} licence - an instance of LicenceModel
 *
 * @returns {object} an object to be used as the body in a Charging Module POST transaction request
 */
function go (transaction, accountNumber, licence) {
  const periodStart = formatChargingModuleDate(transaction.startDate)
  const periodEnd = formatChargingModuleDate(transaction.endDate)

  return {
    clientId: transaction.id,
    ruleset: transaction.scheme,
    periodStart,
    periodEnd,
    credit: transaction.credit,
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
    customerReference: accountNumber,
    licenceNumber: licence.licenceRef,
    lineDescription: transaction.description,
    loss: transaction.loss,
    region: licence.region.chargeRegionId,
    regionalChargingArea: licence.regionalChargeArea,
    section127Agreement: transaction.section127Agreement,
    section130Agreement: transaction.section130Agreement,
    supportedSource: transaction.supportedSource,
    supportedSourceName: transaction.supportedSourceName,
    twoPartTariff: transaction.secondPartCharge,
    waterCompanyCharge: transaction.waterCompanyCharge,
    waterUndertaker: transaction.waterUndertaker,
    winterOnly: transaction.winterOnly
  }
}

module.exports = {
  go
}
