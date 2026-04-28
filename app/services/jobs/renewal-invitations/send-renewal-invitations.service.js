'use strict'

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 * @module SendRenewalInvitations
 */

const CreateNoticeService = require('../../notices/setup/create-notice.service.js')
const CreateNotificationsService = require('../../notices/setup/create-notifications.service.js')
const FetchRenewalRecipients = require('./fetch-renewal-recipients.service.js')
const NotifyConfig = require('../../../../config/notify.config.js')
const SendNoticeService = require('../../notices/setup/send/send-notice.service.js')
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

  const noticeData = _noticeData(expiryDate)

  const notice = await _notice(noticeData, recipients)

  const notifications = await _notifications(noticeData, recipients, notice.id)

  SendNoticeService.go(notice, notifications)

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

function _renewalDate(expiryDate) {
  const daysPriorToExpiry = 90

  const renewalDate = new Date(expiryDate)

  renewalDate.setDate(renewalDate.getDate() - daysPriorToExpiry)

  return renewalDate
}

function _noticeData(expiryDate) {
  const { name, prefix, subType } = NoticeTypes[NoticeType.RENEWAL_INVITATIONS]

  return {
    expiryDate,
    journey: 'standard',
    name,
    noticeType: NoticeType.RENEWAL_INVITATIONS,
    referenceCode: generateNoticeReferenceCode(prefix),
    renewalDate: _renewalDate(expiryDate),
    subType
  }
}

async function _notice(noticeData, recipients) {
  return CreateNoticeService.go(noticeData, recipients, NotifyConfig.replyTo)
}

async function _notifications(noticeData, recipients, noticeId) {
  return CreateNotificationsService.go(noticeData, recipients, noticeId)
}

module.exports = {
  go
}
