/**
 * Orchestrates fetching, sending, and updating renewal invitations notifications
 * @module SendRenewalInvitations
 */

import CreateNoticeService from '../../notices/setup/create-notice.service.js'
import CreateNotificationsService from '../../notices/setup/create-notifications.service.js'
import FetchRenewalRecipients from './fetch-renewal-recipients.service.js'
import SendNoticeService from '../../notices/setup/send/send-notice.service.js'
import { renewalExpiryDate, renewalNoticeDate } from '../../../lib/dates.lib.js'
import { generateNoticeReferenceCode } from '../../../lib/general.lib.js'
import { NoticeTypes, NoticeType } from '../../../lib/static-lookups.lib.js'

import NotifyConfig from '../../../../config/notify.config.js'

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

export {
  go
}
export default {
  go
}
