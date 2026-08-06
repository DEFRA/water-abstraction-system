/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 * @module SendRenewalInvitations
 */

import NotifyConfig from 'water-abstraction-engine/config/notify.config.js'
import { generateNoticeReferenceCode } from 'water-abstraction-engine/lib/general.lib.js'
import { NoticeType, NoticeTypes } from 'water-abstraction-engine/lib/static-lookups.lib.js'
import { renewalExpiryDate, renewalNoticeDate } from 'water-abstraction-engine/lib/dates.lib.js'

import CreateNoticeService from '../../notices/setup/create-notice.service.js'
import CreateNotificationsService from '../../notices/setup/create-notifications.service.js'
import FetchRenewalRecipients from './fetch-renewal-recipients.service.js'
import SendNoticeService from '../../notices/setup/send/send-notice.service.js'

/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 *
 * @param {number} days - The number of ahead of today
 *
 * @returns {Promise<object[]>} An array of renewal invitation recipients
 */
export default async function sendRenewalInvitationsService(days) {
  const expiryDate = renewalExpiryDate(days)
  const renewalDate = renewalNoticeDate(expiryDate)

  const recipients = await FetchRenewalRecipients(expiryDate)

  if (recipients.length > 0) {
    const noticeData = _noticeData(expiryDate, renewalDate)

    const notice = await _notice(noticeData, recipients)

    const notifications = await _notifications(noticeData, recipients, notice.id)

    SendNoticeService(notice, notifications)
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
  return CreateNoticeService(noticeData, recipients, NotifyConfig.replyTo)
}

async function _notifications(noticeData, recipients, noticeId) {
  return CreateNotificationsService(noticeData, recipients, noticeId)
}
