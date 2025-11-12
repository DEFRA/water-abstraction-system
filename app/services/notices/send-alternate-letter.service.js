'use strict'

/**
 * Orchestrates sending out return invitation letters for returns invitation emails that failed
 *
 * @module SendAlternateLetterService
 */

const { setTimeout } = require('node:timers/promises')

const BatchNotificationsService = require('./setup/batch-notifications.service.js')
const CreateNoticePresenter = require('../../presenters/notices/setup/create-notice.presenter.js')
const CreateNoticeService = require('./setup/create-notice.service.js')
const CreateNotificationsService = require('./setup/create-notifications.service.js')
const DetermineNoticeTypeService = require('./setup/determine-notice-type.service.js')
const EventModel = require('../../models/event.model.js')
const FetchFailedReturnsInvitationsService = require('./fetch-failed-returns-invitations.service.js')
const FetchNotificationsService = require('./setup/fetch-notifications.service.js')
const FetchReturnsAddressesService = require('./fetch-returns-addresses.service.js')
const NotificationsPresenter = require('../../presenters/notices/setup/notifications.presenter.js')

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../lib/general.lib.js')
const { NoticeType, NoticeJourney } = require('../../lib/static-lookups.lib.js')

const notifyConfig = require('../../../config/notify.config.js')

/**
 * Orchestrates sending out return invitation letters for returns invitation emails that failed
 *
 * @param {module:EventModel} event - The UUID of the event that had errors
 */
async function go(event) {
  try {
    const startTime = currentTimeInNanoseconds()

    const { batchSize, delay } = notifyConfig

    // get the notifications that failed
    const { failedLicenceRefs, failedReturnIds } = await FetchFailedReturnsInvitationsService.go(event.id)

    const noticeType = DetermineNoticeTypeService.go(NoticeType.INVITATIONS)

    // get their address details
    const recipients = await FetchReturnsAddressesService.go(failedReturnIds)

    // create the event/notice
    const notice = await _notice(event, noticeType, recipients, failedLicenceRefs)

    // create the notifications
    const notifications = await _notifications(notice, recipients)
console.log(notifications)
    // await BatchNotificationsService.go(notifications, notice, noticeType.referenceCode)

    // for (let i = 0; i < notifications.length; i += batchSize) {
    //   const batchNotifications = notifications.slice(i, i + batchSize)

    //   const updatedNotifications = await _batch(batchNotifications)

    //   await _delay(delay)
    // }

    // await _updateEventErrorCount(notifications)

    // TODO update the preivous notifications with the new event id

    calculateAndLogTimeTaken(startTime, 'Notification status job complete', { count: notifications.length })
  } catch (error) {
    global.GlobalNotifier.omfg('Notification status job failed', null, error)
  }
}

async function _notice(event, noticeType, recipients, licenceRefs) {
  const _event = {
    issuer: event.issuer,
    licences: licenceRefs,
    metadata: {
      ...event.metadata,
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
    subtype: noticeType.subType
  }

  return CreateNoticeService.go(_event)
}

async function _notifications(notice, recipients) {
  const {
    id: eventId,
    metadata: { returnCycle: returnPeriod }
  } = notice

  const eventDetails = {
    determinedReturnsPeriod: returnPeriod,
    journey: NoticeJourney.STANDARD,
    noticeType: NoticeType.INVITATIONS
  }
  const notifications = NotificationsPresenter.go(recipients, eventDetails, eventId)

  await CreateNotificationsService.go(notifications)

  return FetchNotificationsService.go(eventId)
}

module.exports = {
  go
}
