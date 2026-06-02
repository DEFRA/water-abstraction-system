'use strict'

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 * @module SendRenewalInvitations
 */

const CreateNoticeService = require('../../notices/setup/create-notice.service.js')
const CreateNotificationsService = require('../../notices/setup/create-notifications.service.js')
const FetchRenewalRecipients = require('./fetch-renewal-recipients.service.js')
const SendNoticeService = require('../../notices/setup/send/send-notice.service.js')
const { renewalExpiryDate, renewalNoticeDate } = require('../../../lib/dates.lib.js')
const { generateNoticeReferenceCode } = require('../../../lib/general.lib.js')
const { NoticeTypes, NoticeType } = require('../../../lib/static-lookups.lib.js')

const NotifyConfig = require('../../../../config/notify.config.js')

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 *
 * @param {number} days - The number of ahead of today
 *
 * @returns {Promise<object[]>} An array of renewal invitation recipients
 */
async function go(days) {
  const expiryDate = renewalExpiryDate(days)
  const renewalDate = renewalNoticeDate(expiryDate)

  const recipients = await FetchRenewalRecipients.go(expiryDate)

  if (recipients.length > 0) {
    const noticeData = _noticeData(expiryDate, renewalDate)

    const notice = await _notice(noticeData, recipients)

    const notifications = await _notifications(noticeData, recipients, notice.id)

    SendNoticeService.go(notice, notifications)
  }

  return recipients
}

function _noticeData(expiryDate, renewalDate) {
  const { name, prefix, subType } = NoticeTypes[NoticeType.RENEWAL_INVITATIONS]

  return {
    expiryDate,
    journey: 'standard',
    name,
    noticeType: NoticeType.RENEWAL_INVITATIONS,
    referenceCode: generateNoticeReferenceCode(prefix),
    renewalDate,
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
