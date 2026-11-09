/**
 * Generates and sends the requested renewal notice
 * @module SendRenewalNotice
 */

import NotifyConfig from 'water-abstraction-engine/config/notify.config.js'
import { generateNoticeReferenceCode } from 'water-abstraction-engine/lib/general.lib.js'
import { NoticeType, NoticeTypes } from 'water-abstraction-engine/lib/static-lookups.lib.js'
import { renewalExpiryDate, renewalNoticeDate } from 'water-abstraction-engine/lib/dates.lib.js'

import CreateNoticeService from '../../notices/setup/create-notice.service.js'
import CreateNotificationsService from '../../notices/setup/create-notifications.service.js'
import FetchRenewalRecipients from '../../../dal/jobs/renewal-notice/fetch-renewal-recipients.dal.js'
import SendNoticeService from '../../notices/setup/send/send-notice.service.js'

const RENEWAL_NOTICES = {
  finals: { days: 90, noticeType: NoticeType.RENEWAL_FINALS },
  invitations: { days: 300, noticeType: NoticeType.RENEWAL_INVITATIONS },
  reminders: { days: 120, noticeType: NoticeType.RENEWAL_REMINDERS }
}

/**
 * Generates and sends the requested renewal notice
 *
 * @param {object} requestedNoticeType - The type of renewal notice (invitations, reminders, finals) requested
 *
 * @returns {Promise<object[]>} An array of renewal notice recipients
 */
export default async function sendRenewalNoticeService(requestedNoticeType) {
  const renewalNoticeType = RENEWAL_NOTICES[requestedNoticeType]

  const expiryDate = renewalExpiryDate(renewalNoticeType.days)
  const renewalDate = renewalNoticeDate(expiryDate)

  const recipients = await FetchRenewalRecipients(expiryDate)

  if (recipients.length > 0) {
    const noticeData = _noticeData(expiryDate, renewalDate, renewalNoticeType)

    const notice = await _notice(noticeData, recipients)

    const notifications = await _notifications(noticeData, recipients, notice.id)

    SendNoticeService(notice, notifications)
  }

  return recipients
}

function _noticeData(expiryDate, renewalDate, renewalNoticeType) {
  const { name, prefix, subType } = NoticeTypes[renewalNoticeType.noticeType]

  return {
    expiryDate,
    journey: 'standard',
    name,
    noticeType: renewalNoticeType.noticeType,
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
