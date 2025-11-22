'use strict'

/**
 * Orchestrates creating a new notice and notifications for returns invitation emails that failed
 *
 * @module CreateAlternateNoticeService
 */

const CreateNotificationsService = require('./create-notifications.service.js')
const DetermineNoticeTypeService = require('./determine-notice-type.service.js')
const EventModel = require('../../../models/event.model.js')
const FetchAlternateRecipientsService = require('./fetch-alternate-recipients.service.js')
const FetchFailedReturnsInvitationsService = require('./fetch-failed-returns-invitations.service.js')

const { timestampForPostgres } = require('../../../lib/general.lib.js')
const { NoticeType, NoticeJourney } = require('../../../lib/static-lookups.lib.js')

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

  const noticeType = DetermineNoticeTypeService.go(NoticeType.INVITATIONS)
  const recipients = await FetchAlternateRecipientsService.go(failedReturnIds)
  const alternateNotice = await _notice(notice, noticeType, recipients, failedLicenceRefs)
  const notifications = await _notifications(alternateNotice, recipients)

  return { notice: alternateNotice, notifications }
}

async function _notice(notice, noticeType, recipients, licenceRefs) {
  const timestamp = timestampForPostgres()
  const _noticeDetails = {
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
    referenceCode: noticeType.referenceCode,
    status: 'completed',
    statusCounts: { cancelled: 0, error: 0, pending: recipients.length, sent: 0 },
    subtype: noticeType.subType,
    triggerNoticeId: notice.id,
    type: 'notification'
  }

  return EventModel.query().insert({ ..._noticeDetails, createdAt: timestamp, updatedAt: timestamp })
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
