/**
 * Formats a transaction as a Charging Module API transaction request
 * @module CreateTransactionPresenter
 */

import { formatChargingModuleDate } from 'water-abstraction-engine/presenters/base.presenter.js'

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
export default function createTransactionPresenter(transaction, accountNumber, licence) {
  const periodStart = formatChargingModuleDate(transaction.startDate)
  const periodEnd = formatChargingModuleDate(transaction.endDate)

  return {
    abatementFactor: transaction.section126Factor,
    actualVolume: transaction.volume,
    adjustmentFactor: transaction.adjustmentFactor,
    aggregateProportion: transaction.aggregateFactor,
    areaCode: licence.historicalAreaCode,
    authorisedDays: transaction.authorisedDays,
    authorisedVolume: transaction.authorisedQuantity,
    billableDays: transaction.billableDays,
    chargeCategoryCode: transaction.chargeCategoryCode,
    chargeCategoryDescription: transaction.chargeCategoryDescription,
    chargePeriod: `${periodStart} - ${periodEnd}`,
    clientId: transaction.id,
    compensationCharge: transaction.chargeType === 'compensation',
    credit: transaction.credit,
    customerReference: accountNumber,
    licenceNumber: licence.licenceRef,
    lineDescription: transaction.description,
    loss: transaction.loss,
    periodEnd,
    periodStart,
    region: licence.region.chargeRegionId,
    regionalChargingArea: licence.regionalChargeArea,
    ruleset: transaction.scheme,
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
