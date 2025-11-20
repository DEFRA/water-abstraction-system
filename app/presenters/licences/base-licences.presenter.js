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

/**
 * Pluralise a word based on a count
 *
 * When the count is 1, the word is returned unchanged. Otherwise, the word is appended with an 's'.
 *
 * @param {string }word
 * @param {number} count
 *
 * @returns {string} The pluralised word
 */
function pluralise(word, count) {
  return count === 1 ? word : `${word}s`
}

/**
 * Flatten the 'auth.credentials.roles' to and array of roles e.g. ['returns', 'billing']
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {string[]} An array of roles
 */
function userRoles(auth) {
  return auth.credentials.roles.map((role) => {
    return role.role
  })
}

module.exports = {
  formatAbstractionAmounts,
  userRoles,
  pluralise
}
