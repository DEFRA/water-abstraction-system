'use strict'

const { formatNumber } = require('../base.presenter.js')

/**
 * Formats the abstraction quantities from a `licenceVersionPurpose` as strings of two decimal places and their measure
 *
 * @param {object} licenceVersionPurpose - An object containing abstraction quantities (annual, daily, hourly, instant)
 *
 * @returns {string[]} An array of formatted strings representing the abstraction amounts per time period
 */
function formatAbstractionAmounts(licenceVersionPurpose) {
  const details = []

  const { annualQuantity, dailyQuantity, hourlyQuantity, instantQuantity } = licenceVersionPurpose

  if (annualQuantity) {
    details.push(`${formatNumber(annualQuantity, 2, 2)} cubic metres per year`)
  }

  if (dailyQuantity) {
    details.push(`${formatNumber(dailyQuantity, 2, 2)} cubic metres per day`)
  }

  if (hourlyQuantity) {
    details.push(`${formatNumber(hourlyQuantity, 2, 2)} cubic metres per hour`)
  }

  if (instantQuantity) {
    details.push(`${formatNumber(instantQuantity, 2, 2)} litres per second`)
  }

  return details
}

module.exports = {
  formatAbstractionAmounts
}
