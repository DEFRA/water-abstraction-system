'use strict'

/**
 * Determine the notice type
 * @module DetermineNoticeTypeService
 */

const { generateRandomInteger } = require('../../../lib/general.lib.js')

/**
 * Defines the configuration for supported notice types.
 *
 * This structure enables consistent handling and display of different notification types
 * across the system. Each type includes legacy fields (`name` and `subType`) required for backwards compatibility.
 *
 * Legacy context:
 * - `name` is used in the legacy UI to render the notification type on `/notifications/report`
 * - `subType` is used when querying notifications in the legacy system
 *
 * @private
 */
const NOTICE_TYPES = {
  invitations: {
    journey: 'invitations',
    name: 'Returns: invitation',
    prefix: 'RINV-',
    redirectPath: 'returns-period',
    subType: 'returnInvitation',
    type: 'Returns invitation'
  },
  reminders: {
    journey: 'reminders',
    name: 'Returns: reminder',
    prefix: 'RREM-',
    redirectPath: 'returns-period',
    subType: 'returnReminder',
    type: 'Returns reminder'
  },
  'ad-hoc': {
    journey: 'ad-hoc',
    name: 'Returns: ad-hoc',
    prefix: 'ADHC-',
    redirectPath: 'licence',
    subType: 'adHocReminder',
    type: 'Ad hoc'
  },
  'abstraction-alert': {
    journey: 'abstraction-alert',
    name: 'Water abstraction alert',
    prefix: 'WAA-',
    redirectPath: 'abstraction-alerts/alert-type',
    subType: 'waterAbstractionAlerts',
    type: 'Abstraction alert'
  }
}

/**
 * Determine the notice type
 *
 * A notice can be for multiple things. This function is the single place to determine the logic / data need for each
 * notice type.
 *
 * The notice type data is saved directly to the database and is used raw in the UI. For example the 'name' is used on
 * the reports page.
 *
 * @param {string} noticeType
 *
 * @returns {object} - data specific to the notice type
 */
function go(noticeType) {
  const { journey, name, prefix, redirectPath, subType, type } = NOTICE_TYPES[noticeType]

  return {
    journey,
    name,
    notificationType: type,
    redirectPath,
    referenceCode: _generateReferenceCode(prefix),
    subType
  }
}

/**
 * A function to generate a pseudo-unique reference code for recipients notices
 *
 * @param {string} prefix
 *
 * @returns {string} A reference code with a prefix and random string (RINV-A14GB8)
 */
function _generateReferenceCode(prefix) {
  const possible = 'ABCDEFGHJKLMNPQRTUVWXYZ0123456789'
  const length = 6

  let text = ''

  for (let i = 0; i < length; i++) {
    text += possible.charAt(generateRandomInteger(0, possible.length))
  }
  return prefix + text
}

module.exports = {
  go
}
