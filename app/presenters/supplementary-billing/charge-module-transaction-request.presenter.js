'use strict'

const { formatDate } = require('../base.presenter.js')

function go (transaction, billingPeriod, invoiceAccountNumber, licence) {
  const periodStart = formatDate(billingPeriod.startDate)
  const periodEnd = formatDate(billingPeriod.endDate)

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
