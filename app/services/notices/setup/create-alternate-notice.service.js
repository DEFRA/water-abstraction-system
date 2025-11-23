'use strict'

/**
 * Orchestrates creating a new notice and notifications for returns invitation emails that failed
 *
 * @module CreateAlternateNoticeService
 */

const CreateNotificationsService = require('./create-notifications.service.js')
const EventModel = require('../../../models/event.model.js')
const FetchAlternateRecipientsService = require('./fetch-alternate-recipients.service.js')
const FetchFailedReturnsInvitationsService = require('./fetch-failed-returns-invitations.service.js')
const { generateNoticeReferenceCode, timestampForPostgres } = require('../../../lib/general.lib.js')
const { NoticeJourney, NoticeType } = require('../../../lib/static-lookups.lib.js')

/**
 * Orchestrates creating a new notice and notifications for returns invitation emails that failed
 *
 * @param {module:EventModel} notice - The email notice to check for failed notifications
 *
 * @returns {Promise<object>} The created alternate notice and notifications
 */
async function go(notice) {
  const { failedLicenceRefs, failedReturnIds } = await FetchFailedReturnsInvitationsService.go(notice.id)

  if (failedReturnIds.length === 0) {
    return { notice: null, notifications: [] }
  }

  const recipients = await FetchAlternateRecipientsService.go(failedReturnIds)
  const alternateNotice = await _notice(notice, recipients, failedLicenceRefs)
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
      options: {
        excludedLicences: []
      },
      recipients: recipients.length
    },
    overallStatus: 'pending',
    referenceCode: generateNoticeReferenceCode('RINV-'),
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

  const noticeDetails = {
    determinedReturnsPeriod: returnPeriod,
    journey: NoticeJourney.STANDARD,
    noticeType: NoticeType.FAILED_INVITATION
  }

  return CreateNotificationsService.go(noticeDetails, recipients, noticeId)
}

module.exports = {
  go
}
