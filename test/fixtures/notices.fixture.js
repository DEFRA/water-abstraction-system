'use strict'

const { generateRandomInteger, generateUUID } = require('../../app/lib/general.lib.js')

/**
 * Represents a notice of type 'alert reduce'
 *
 * @returns {object}
 */
function alertReduce() {
  const data = _defaults()

  data.alertType = 'reduce'
  data.name = 'Water abstraction alert'
  data.referenceCode = `WAA-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'waterAbstractionAlerts'

  return data
}

/**
 * Represents a notice of type 'alert resume'
 *
 * @returns {object}
 */
function alertResume() {
  const data = _defaults()

  data.alertType = 'resume'
  data.name = 'Water abstraction alert'
  data.referenceCode = `WAA-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'waterAbstractionAlerts'

  return data
}

/**
 * Represents a notice of type 'alert stop'
 *
 * @returns {object}
 */
function alertStop() {
  const data = _defaults()

  data.alertType = 'stop'
  data.name = 'Water abstraction alert'
  data.referenceCode = `WAA-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'waterAbstractionAlerts'

  return data
}

/**
 * Represents a notice of type 'alert warning'
 *
 * @returns {object}
 */
function alertWarning() {
  const data = _defaults()

  data.alertType = 'warning'
  data.name = 'Water abstraction alert'
  data.referenceCode = `WAA-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'waterAbstractionAlerts'

  return data
}

/**
 * Represents a notice of type 'legacy notifications'
 *
 * @returns {object}
 */
function legacyNotification() {
  const data = _defaults()

  data.name = 'Hands off flow: levels warning'
  data.referenceCode = `HOF-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'hof-warning'

  return data
}

/**
 * Returns all the notices as an array
 *
 * @returns {object[]} all the notices as an array
 */
function notices() {
  return [
    alertReduce(),
    alertResume(),
    alertStop(),
    alertWarning(),
    legacyNotification(),
    returnsInvitation(),
    returnsPaperForm(),
    returnsReminder()
  ]
}

/**
 * Represents a notice of type 'returns invitation
 *
 * @returns {object}
 */
function returnsInvitation() {
  const data = _defaults()

  data.referenceCode = `RINV-${generateRandomInteger(100000, 999999)}`

  return data
}

/**
 * Represents a notice of type 'returns paper form'
 *
 * @returns {object}
 */
function returnsPaperForm() {
  const data = _defaults()

  data.name = 'Paper returns'
  data.referenceCode = `PRTF-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'paperReturnForms'

  return data
}

/**
 * Represents a notice of type 'returns reminder'
 *
 * @returns {object}
 */
function returnsReminder() {
  const data = _defaults()

  data.name = 'Returns: reminder'
  data.referenceCode = `RREM-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'returnReminder'

  return data
}

function _defaults() {
  return {
    alertType: null,
    id: generateUUID(),
    createdAt: new Date('2025-03-25'),
    errorCount: 0,
    issuer: 'billing.data@wrls.gov.uk',
    name: 'Returns: invitation',
    recipientCount: generateRandomInteger(1, 5000),
    subtype: 'returnInvitation'
  }
}

module.exports = {
  alertReduce,
  alertResume,
  alertStop,
  alertWarning,
  legacyNotification,
  notices,
  returnsInvitation,
  returnsPaperForm,
  returnsReminder
}
