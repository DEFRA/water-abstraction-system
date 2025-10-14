'use strict'

const { generateRandomInteger, generateUUID } = require('../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateReferenceCode } = require('../support/helpers/notification.helper.js')

/**
 * Represents a notice of type 'alert reduce'
 *
 * @returns {object}
 */
function alertReduce() {
  const data = _defaults()

  data.metadata = {
    name: 'Water abstraction alert',
    error: 0,
    options: {
      sendingAlertType: 'reduce',
      monitoringStationId: 'f3464f0c-1974-452f-88b4-1ba59c797310'
    },
    recipients: 1
  }
  data.referenceCode = generateReferenceCode('WAA')
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

  data.metadata = {
    name: 'Water abstraction alert',
    error: 0,
    options: {
      sendingAlertType: 'resume',
      monitoringStationId: 'f3464f0c-1974-452f-88b4-1ba59c797310'
    },
    recipients: 1
  }
  data.referenceCode = generateReferenceCode('WAA')
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

  data.metadata = {
    name: 'Water abstraction alert',
    error: 0,
    options: {
      sendingAlertType: 'stop',
      monitoringStationId: 'f3464f0c-1974-452f-88b4-1ba59c797310'
    },
    recipients: 1
  }
  data.referenceCode = generateReferenceCode('WAA')
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

  data.metadata = {
    name: 'Water abstraction alert',
    error: 0,
    options: {
      sendingAlertType: 'warning',
      monitoringStationId: 'f3464f0c-1974-452f-88b4-1ba59c797310'
    },
    recipients: 1
  }
  data.referenceCode = generateReferenceCode('WAA')
  data.subtype = 'waterAbstractionAlerts'

  return data
}

/**
 * Represents a notice of type 'legacy notifications'
 *
 * Specifically a legacy hands off flow notice
 *
 * @returns {object}
 */
function legacyHandsOffFlow() {
  const data = _defaults()

  data.metadata = {
    name: 'Hands off flow: levels warning',
    sent: 1,
    error: 0,
    pending: 0,
    recipients: 1,
    taskConfigId: 1
  }
  data.referenceCode = generateReferenceCode('HOF')
  data.subtype = 'hof-warning'

  return data
}

/**
 * Represents a notice of type 'legacy notifications'
 *
 * Specifically a renewal notice
 *
 * @returns {object}
 */
function legacyRenewal() {
  const data = _defaults()

  data.metadata = {
    name: 'Expiring licence(s): invitation to renew',
    sent: 1,
    error: 0,
    pending: 0,
    recipients: 1,
    taskConfigId: 2
  }
  data.referenceCode = generateReferenceCode('RENEW')
  data.subtype = 'renewal'

  return data
}

/**
 * Maps an array of notice objects previously generated to `FetchNoticesService` result format
 *
 * @param {object[]} notices - The notice objects to map to `FetchNoticesService` result format
 *
 * @returns {object[]} Array of mapped notice objects.
 */
function mapToFetchNoticesResult(notices) {
  return notices.map((notice) => {
    const { createdAt, id, issuer, referenceCode, subtype, metadata } = notice

    return {
      id,
      createdAt,
      issuer,
      referenceCode,
      subtype,
      name: metadata.name,
      alertType: metadata.options?.sendingAlertType,
      recipientCount: metadata.recipients,
      overallStatus: 'sent'
    }
  })
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
    legacyHandsOffFlow(),
    legacyRenewal(),
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

  data.metadata = {
    name: 'Returns: invitation',
    error: 0,
    options: { excludeLicences: [] },
    recipients: generateRandomInteger(1, 5000),
    returnCycle: { dueDate: '2025-04-28', endDate: '2025-03-31', isSummer: false, startDate: '2024-04-01' }
  }
  data.referenceCode = generateReferenceCode('RINV')
  data.subtype = 'returnInvitation'

  return data
}

/**
 * Represents a notice of type 'returns paper form'
 *
 * @returns {object}
 */
function returnsPaperForm() {
  const data = _defaults()

  data.metadata = {
    name: 'Paper returns',
    error: 0,
    options: { excludeLicences: [] },
    recipients: 1,
    returnCycle: { dueDate: '2025-11-03', endDate: null, startDate: null }
  }
  data.referenceCode = generateReferenceCode('PRTF')
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

  data.metadata = {
    name: 'Returns: reminder',
    sent: 0,
    error: 0,
    options: {
      excludeLicences: []
    },
    recipients: generateRandomInteger(1, 5000),
    returnCycle: {
      dueDate: '2025-04-28',
      endDate: '2025-03-31',
      isSummer: false,
      startDate: '2024-04-01'
    }
  }
  data.referenceCode = generateReferenceCode('RREM')
  data.subtype = 'returnReminder'

  return data
}

function _defaults() {
  return {
    id: generateUUID(),
    createdAt: new Date('2025-03-25'),
    issuer: 'admin-internal@wrls.gov.uk',
    licences: [generateLicenceRef()],
    overallStatus: 'pending',
    status: 'completed',
    statusCounts: { cancelled: 0, error: 0, pending: 1, returned: 0, sent: 0 },
    type: 'notification'
  }
}

module.exports = {
  alertReduce,
  alertResume,
  alertStop,
  alertWarning,
  legacyHandsOffFlow,
  legacyRenewal,
  mapToFetchNoticesResult,
  notices,
  returnsInvitation,
  returnsPaperForm,
  returnsReminder
}
