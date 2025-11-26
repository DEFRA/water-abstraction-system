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
 * The licence summary and set-up pages show a notification when a licence is marked for supplementary bill runs.
 *
 * @param {object} licence - The licence to determine if a notification is needed
 *
 * @returns {object | null} an object containing the notification text and title text if the licence is marked for a
 * supplementary bill run, else null
 */
function supplementaryBillingNotification(licence) {
  const { includeInPresrocBilling, includeInSrocBilling, includeInTwoPartTariffBilling } = licence
  const baseMessage = 'This licence has been marked for the next '

  if (includeInTwoPartTariffBilling) {
    return {
      text: _tptNotification(baseMessage, includeInPresrocBilling, includeInSrocBilling),
      titleText: 'Important'
    }
  }

  if (includeInPresrocBilling === 'yes' && includeInSrocBilling === true) {
    return {
      text: baseMessage + 'supplementary bill runs for the current and old charge schemes.',
      titleText: 'Important'
    }
  }
  if (includeInPresrocBilling === 'yes') {
    return {
      text: baseMessage + 'supplementary bill run for the old charge scheme.',
      titleText: 'Important'
    }
  }

  if (includeInSrocBilling === true) {
    return {
      text: baseMessage + 'supplementary bill run.',
      titleText: 'Important'
    }
  }

  return null
}

/**
 * Pluralise a word based on a count
 *
 * When the count is 1, the word is returned unchanged. Otherwise, the word is appended with an 's'.
 *
 * @param {string} word - the singular version of the word
 * @param {number} count - The count of items that the word refers
 *
 * @returns {string} The pluralised version of the word if count is greater than 1, else word.
 */
function pluralise(word, count) {
  return count > 1 ? `${word}s` : word
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

function _tptNotification(baseMessage, includeInPresrocBilling, includeInSrocBilling) {
  if (includeInPresrocBilling === 'yes' && includeInSrocBilling === true) {
    return (
      baseMessage +
      'two-part tariff supplementary bill run and supplementary bill runs for the current and old charge schemes.'
    )
  }
  if (includeInPresrocBilling === 'yes') {
    return (
      baseMessage + 'two-part tariff supplementary bill run and the supplementary bill run for the old charge scheme.'
    )
  }

  if (includeInSrocBilling === true) {
    return baseMessage + 'two-part tariff supplementary bill run and the supplementary bill run.'
  }

  return baseMessage + 'two-part tariff supplementary bill run.'
}

module.exports = {
  formatAbstractionAmounts,
  supplementaryBillingNotification,
  pluralise,
  userRoles
}
