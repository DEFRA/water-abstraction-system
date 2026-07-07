/**
 * Orchestrates creating a new notice and notifications for returns invitation emails that failed
 *
 * @module CreateAlternateReturnsNoticeService
 */

import CreateNotificationsService from './create-notifications.service.js'
import EventModel from '../../../models/event.model.js'
import FetchAlternateReturnsRecipientsService from './returns-notice/fetch-alternate-returns-recipients.service.js'
import { generateNoticeReferenceCode, timestampForPostgres } from '../../../lib/general.lib.js'
import { NoticeJourney, NoticeType, NoticeTypes } from '../../../lib/static-lookups.lib.js'

/**
 * Orchestrates creating a new notice and notifications for returns invitation emails that failed
 *
 * @param {object} notice - The email notice to check for failed notifications
 * @param {string[]} licenceRefs - The combined licence references from the failed notifications
 * @param {Date} dueDate - The due date for the returns
 * @param {string[]} returnLogIds - The return log IDs for the failed notifications
 *
 * @returns {Promise<object>} The created alternate notice and notifications
 */
async function go(notice, licenceRefs, dueDate, returnLogIds) {
  const recipients = await FetchAlternateReturnsRecipientsService.go(returnLogIds, dueDate)
  const alternateNotice = await _notice(notice, recipients, licenceRefs)
  const notifications = await _notifications(alternateNotice, recipients)

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
    referenceCode: generateNoticeReferenceCode(NoticeTypes[NoticeType.INVITATIONS].prefix),
    status: 'completed',
    statusCounts: { cancelled: 0, error: 0, pending: recipients.length, sent: 0 },
    subtype: notice.subtype,
    triggerNoticeId: notice.id,
    type: 'notification'
  }

  return EventModel.query().insert({ ...noticeDetails, createdAt: timestamp, updatedAt: timestamp })
}

async function _notifications(notice, recipients) {
  const {
    id: noticeId,
    metadata: { returnCycle: returnPeriod }
  } = notice

  const session = {
    determinedReturnsPeriod: returnPeriod,
    journey: NoticeJourney.STANDARD,
    noticeType: NoticeType.ALTERNATE_INVITATION
  }

  return CreateNotificationsService.go(session, recipients, noticeId)
}

export { go }
export default {
  go
}
