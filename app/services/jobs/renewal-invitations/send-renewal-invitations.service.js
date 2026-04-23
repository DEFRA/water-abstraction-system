'use strict'

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 * @module SendRenewalInvitations
 */

const CreateNoticeService = require('../../notices/setup/create-notice.service.js')
const FetchRenewalRecipients = require('./fetch-renewal-recipients.service.js')
const { NoticeTypes, NoticeType } = require('../../../lib/static-lookups.lib.js')
const { generateNoticeReferenceCode } = require('../../../lib/general.lib.js')

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 *
 * @param {number} days - The number of ahead of today
 *
 * @returns {Promise<object[]>} An array of renewal invitation recipients
 */
async function go(days) {
  const expiryDate = _expiryDate(days)

  const recipients = await FetchRenewalRecipients.go(expiryDate)

  await _notice(recipients)

  return recipients
}

/**
 * Calculates the target expiry date
 *
 * @private
 */
function _expiryDate(futureExpiredDate) {
  const targetDate = new Date()

  targetDate.setDate(targetDate.getDate() + Number(futureExpiredDate))

  targetDate.setHours(0, 0, 0, 0)

  return targetDate
}

async function _notice(recipients) {
  const { name, prefix, subType } = NoticeTypes[NoticeType.INVITATIONS]

  const data = {
    referenceCode: generateNoticeReferenceCode(prefix),
    subType,
    name
  }

  return CreateNoticeService.go(data, recipients, 'water_abstractiondigital@environment-agency.gov.uk')
}

module.exports = {
  go
}
