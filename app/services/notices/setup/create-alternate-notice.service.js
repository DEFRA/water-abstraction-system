'use strict'

/**
 * Orchestrates creating a new notice and notifications for invitation emails that failed
 *
 * @module CreateAlternateNoticeService
 */

const CreateNotificationsService = require('./create-notifications.service.js')
const EventModel = require('../../../models/event.model.js')
const FetchAlternateRenewalRecipientsService = require('./renewal-notice/fetch-alternate-renewal-recipients.service.js')
const FetchAlternateReturnsRecipientsService = require('./returns-notice/fetch-alternate-returns-recipients.service.js')
const { generateNoticeReferenceCode, timestampForPostgres } = require('../../../lib/general.lib.js')
const { NoticeJourney, NoticeType, NoticeTypes } = require('../../../lib/static-lookups.lib.js')

/**
 * Orchestrates creating a new notice and notifications for invitation emails that failed
 *
 * Handles both returns and renewal invitations, dispatching on the notice subtype.
 *
 * @param {module:EventModel} notice - The email notice to check for failed notifications
 * @param {string[]} licenceRefs - The combined licence references from the failed notifications
 * @param {object} params - Type-specific parameters
 * @param {Date} [params.dueDate] - The due date for returns invitations
 * @param {Date} [params.expiryDate] - The licence expiry date for renewal invitations
 * @param {Date} [params.renewalDate] - The renewal date for renewal invitations
 * @param {string[]} [params.returnLogIds] - The return log IDs for returns invitations
 *
 * @returns {Promise<object>} The created alternate notice and notifications
 */
async function go(notice, licenceRefs, { dueDate, expiryDate, renewalDate, returnLogIds } = {}) {
  if (notice.subtype === NoticeTypes[NoticeType.RENEWAL_INVITATIONS].subType) {
    const recipients = await FetchAlternateRenewalRecipientsService.go(licenceRefs)
    const alternateNotice = await _notice(
      notice,
      recipients,
      licenceRefs,
      NoticeTypes[NoticeType.RENEWAL_INVITATIONS].prefix
    )
    const notifications = await _renewalNotifications(alternateNotice, recipients, expiryDate, renewalDate)

    return { notice: alternateNotice, notifications }
  }

  const recipients = await FetchAlternateReturnsRecipientsService.go(returnLogIds, dueDate)
  const alternateNotice = await _notice(notice, recipients, licenceRefs, NoticeTypes[NoticeType.INVITATIONS].prefix)
  const notifications = await _returnsNotifications(alternateNotice, recipients)

  return { notice: alternateNotice, notifications }
}

async function _notice(notice, recipients, licenceRefs, referenceCodePrefix) {
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
    referenceCode: generateNoticeReferenceCode(referenceCodePrefix),
    status: 'completed',
    statusCounts: { cancelled: 0, error: 0, pending: recipients.length, sent: 0 },
    subtype: notice.subtype,
    triggerNoticeId: notice.id,
    type: 'notification'
  }

  return EventModel.query().insert({ ...noticeDetails, createdAt: timestamp, updatedAt: timestamp })
}

async function _renewalNotifications(notice, recipients, expiryDate, renewalDate) {
  const { id: noticeId } = notice

  const noticeData = {
    expiryDate,
    journey: 'standard',
    noticeType: NoticeType.RENEWAL_INVITATIONS,
    renewalDate
  }

  return CreateNotificationsService.go(noticeData, recipients, noticeId)
}

async function _returnsNotifications(notice, recipients) {
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

module.exports = {
  go
}
