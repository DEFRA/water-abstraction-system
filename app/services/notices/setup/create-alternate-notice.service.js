'use strict'

/**
 * Orchestrates creating a new notice and notifications for returns invitation emails that failed
 *
 * @module CreateAlternateNoticeService
 */

const CreateNotificationsService = require('./create-notifications.service.js')
const EventModel = require('../../../models/event.model.js')
const FetchAlternateReturnsRecipientsService = require('./returns-notice/fetch-alternate-returns-recipients.service.js')
const { generateNoticeReferenceCode, timestampForPostgres } = require('../../../lib/general.lib.js')
const { NoticeJourney, NoticeType } = require('../../../lib/static-lookups.lib.js')

/**
 * Orchestrates creating a new notice and notifications for returns invitation emails that failed
 *
 * @param {module:EventModel} notice - The email notice to check for failed notifications
 * @param {Date} dueDate - The due date to apply to the alternate notifications, taken from the failed notifications
 * @param {string[]} licenceRefs - The combined licence references from the failed notifications
 * @param {string[]} returnLogIds - The combined return log IDs from the failed notifications
 *
 * @returns {Promise<object>} The created alternate notice and notifications
 */
async function go(notice, dueDate, licenceRefs, returnLogIds) {
  const recipients = await FetchAlternateReturnsRecipientsService.go(returnLogIds)
  const alternateNotice = await _notice(notice, recipients, licenceRefs)
  const notifications = await _notifications(alternateNotice, recipients, dueDate)

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

async function _notifications(notice, recipients, dueDate) {
  const {
    id: noticeId,
    metadata: { returnCycle: returnPeriod }
  } = notice

  // We 'mock' a session populated with the properties we know CreateNotificationsService needs to create the
  // notification records
  const session = {
    determinedReturnsPeriod: returnPeriod,
    journey: NoticeJourney.STANDARD,
    latestDueDate: dueDate,
    noticeType: NoticeType.ALTERNATE_INVITATION
  }

  return CreateNotificationsService.go(session, recipients, noticeId)
}

module.exports = {
  go
}
