'use strict'

/**
 * Formats data for a standard charge transaction for the bill-licence page
 * @module ViewStandardChargeTransactionPresenter
 */

const {
  capitalize,
  formatAbstractionPeriod,
  formatLongDate,
  formatMoney,
  formatPounds
} = require('../base.presenter.js')

/**
 * Formats data for standard charge transaction for the bill-licence page
 *
 * The format of the object the presenter returns will differ depending on the scheme the transaction is for.
 *
 * @param {module:TransactionModel} transaction an instance of `TransactionModel` that represents a compensation charge
 * transaction
 *
 * @returns {Object} a formatted representation of the transaction specifically for the bill-licence page
 */
function go (transaction) {
  if (transaction.scheme === 'sroc') {
    return _srocContent(transaction)
  }

  return _presrocContent(transaction)
}

function _additionalCharges (isCredit, isWaterCompanyCharge, supportedSourceCharge, supportedSourceName) {
  const charges = []

  if (supportedSourceName) {
    let chargeInPounds = 0
    if (isCredit) {
      chargeInPounds = formatPounds(supportedSourceCharge * -1)
    } else {
      chargeInPounds = formatPounds(supportedSourceCharge)
    }

    charges.push(`Supported source ${supportedSourceName} (£${chargeInPounds})`)
  }

  if (isWaterCompanyCharge) {
    charges.push('Public Water Supply')
  }

  return charges.join(', ')
}

function _adjustments (
  adjustmentFactor,
  aggregateFactor,
  isWinterOnly,
  section126Factor,
  section127Agreement,
  section130Agreement
) {
  const adjustments = []

  if (aggregateFactor !== 1) {
    adjustments.push(`Aggregate factor (${aggregateFactor})`)
  }

  if (adjustmentFactor !== 1) {
    adjustments.push(`Adjustment factor (${adjustmentFactor})`)
  }

  if (section126Factor !== 1) {
    adjustments.push(`Abatement factor (${section126Factor})`)
  }

  if (section127Agreement) {
    adjustments.push('Two-part tariff (0.5)')
  }

  if (section130Agreement === 'true') {
    adjustments.push('Canal and River Trust (0.5)')
  }

  if (isWinterOnly) {
    adjustments.push('Winter discount (0.5)')
  }

  return adjustments.join(', ')
}

function _agreement (section127Agreement) {
  if (section127Agreement) {
    return 'Two-part tariff'
  }

  return null
}

function _chargeElement (purpose, startDay, startMonth, endDay, endMonth, source, season, loss) {
  return {
    purpose: purpose.description,
    abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
    source: capitalize(source),
    season: capitalize(season),
    loss: capitalize(loss)
  }
}

function _chargeElements (chargeElements) {
  return chargeElements.map((chargeElement) => {
    const {
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth,
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth,
      authorisedAnnualQuantity,
      purpose
    } = chargeElement

    return {
      purpose: purpose.description,
      abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
      volume: `${authorisedAnnualQuantity}ML`
    }
  })
}

function _chargeReference (baselineCharge, chargeCategoryCode) {
  return `${chargeCategoryCode} (£${formatPounds(baselineCharge)})`
}

function _presrocContent (transaction) {
  const {
    authorisedDays,
    billableDays,
    chargeReference,
    chargeType,
    description,
    endDate,
    isCredit,
    loss,
    netAmount,
    season,
    section127Agreement,
    source,
    startDate,
    volume,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth,
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth
  } = transaction

  return {
    agreement: _agreement(section127Agreement),
    billableDays: `${billableDays}/${authorisedDays}`,
    chargeElement: _chargeElement(
      chargeReference.purpose,
      startDay,
      startMonth,
      endDay,
      endMonth,
      source,
      season,
      loss
    ),
    chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    chargeType,
    creditAmount: isCredit ? formatMoney(netAmount) : '',
    debitAmount: isCredit ? '' : formatMoney(netAmount),
    description,
    quantity: `${volume}ML`
  }
}

function _srocContent (transaction) {
  const {
    adjustmentFactor,
    aggregateFactor,
    authorisedDays,
    baselineCharge,
    billableDays,
    chargeCategoryCode,
    chargeCategoryDescription,
    chargeReference,
    chargeType,
    description,
    endDate,
    isCredit,
    isWaterCompanyCharge,
    isWinterOnly,
    netAmount,
    section126Factor,
    section127Agreement,
    section130Agreement,
    startDate,
    supportedSourceCharge,
    supportedSourceName,
    volume
  } = transaction

  return {
    additionalCharges: _additionalCharges(isCredit, isWaterCompanyCharge, supportedSourceCharge, supportedSourceName),
    adjustments: _adjustments(
      adjustmentFactor,
      aggregateFactor,
      isWinterOnly,
      section126Factor,
      section127Agreement,
      section130Agreement
    ),
    billableDays: `${billableDays}/${authorisedDays}`,
    chargeCategoryDescription,
    chargeElements: _chargeElements(chargeReference.chargeElements),
    chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    chargeReference: _chargeReference(baselineCharge, chargeCategoryCode),
    chargeType,
    creditAmount: isCredit ? formatMoney(netAmount) : '',
    debitAmount: isCredit ? '' : formatMoney(netAmount),
    description,
    quantity: `${volume}ML`
  }
}

module.exports = {
  go
}
