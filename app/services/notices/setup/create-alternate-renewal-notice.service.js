/**
 * Orchestrates creating a new notice and notifications for renewal invitation emails that failed
 *
 * @module CreateAlternateRenewalNoticeService
 */

import CreateNotificationsService from './create-notifications.service.js'
import EventModel from '../../../models/event.model.js'
import FetchAlternateRenewalRecipientsService from './renewal-notice/fetch-alternate-renewal-recipients.service.js'
import { generateNoticeReferenceCode, timestampForPostgres } from '../../../lib/general.lib.js'
import { NoticeType, NoticeTypes } from '../../../lib/static-lookups.lib.js'

/**
 * Orchestrates creating a new notice and notifications for renewal invitation emails that failed
 *
 * @param {object} notice - The email notice to check for failed notifications
 * @param {string[]} licenceRefs - The combined licence references from the failed notifications
 * @param {Date} expiryDate - The expiry date for the licence
 * @param {Date} renewalDate - The renewal date for the licence
 *
 * @returns {Promise<object>} The created alternate notice and notifications
 */
export default async function createAlternateRenewalNotice(notice, licenceRefs, expiryDate, renewalDate) {
  const recipients = await FetchAlternateRenewalRecipientsService(licenceRefs)
  const alternateNotice = await _notice(notice, recipients, licenceRefs)
  const notifications = await _notifications(alternateNotice, recipients, expiryDate, renewalDate)

  return { notice: alternateNotice, notifications }
}

async function _notice(notice, recipients, licenceRefs) {
  const timestamp = timestampForPostgres()
  const noticeDetails = {
    issuer: notice.issuer,
    licences: licenceRefs,
    metadata: {
      ...notice.metadata,
      error: 0,
      options: { excludedLicences: [] },
      recipients: recipients.length
    },
    overallStatus: 'pending',
    referenceCode: generateNoticeReferenceCode(NoticeTypes[NoticeType.RENEWAL_INVITATIONS].prefix),
    status: 'completed',
    statusCounts: { cancelled: 0, error: 0, pending: recipients.length, sent: 0 },
    subtype: notice.subtype,
    triggerNoticeId: notice.id,
    type: 'notification'
  }

  return EventModel.query().insert({ ...noticeDetails, createdAt: timestamp, updatedAt: timestamp })
}

async function _notifications(notice, recipients, expiryDate, renewalDate) {
  const { id: noticeId } = notice

  const noticeData = {
    expiryDate,
    journey: 'standard',
    noticeType: NoticeType.RENEWAL_INVITATIONS,
    renewalDate
  }

  return CreateNotificationsService(noticeData, recipients, noticeId)
}
