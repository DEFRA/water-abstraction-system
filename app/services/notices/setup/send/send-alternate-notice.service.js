'use strict'

/**
 * Orchestrates sending a 'failed' notice to Notify, recording the results, and checking the status when finished
 * @module SendAlternateNoticeService
 */

const CreateAlternateNoticeService = require('../create-alternate-notice.service.js')
const FetchFailedReturnsInvitationsService = require('../returns-notice/fetch-failed-returns-invitations.service.js')
const NotificationModel = require('../../../../models/notification.model.js')
const SendLetterNotificationService = require('./send-letter-notification.service.js')
const UpdateNoticeService = require('../../update-notice.service.js')

const { pause, timestampForPostgres } = require('../../../../lib/general.lib.js')

const notifyConfig = require('../../../../../config/notify.config.js')

/**
 * Orchestrates sending a 'failed' notice to Notify, recording the results, and checking the status when finished
 *
 * @param {object} mainNotice - The main notice to be checked for failed returns invitation emails
 */
async function go(mainNotice) {
  const { licenceRefs, notificationIds, returnLogIds } = await FetchFailedReturnsInvitationsService.go(mainNotice.id)

  // We also don't bother to proceed if no primary user emails failed
  if (notificationIds.length === 0) {
    return
  }

  const { notice, notifications } = await CreateAlternateNoticeService.go(mainNotice, licenceRefs, returnLogIds)

  await _sendNotifications(notifications, notice.referenceCode)
  await _updateFailedEmailInvitations(notice.id, notificationIds)

  // Give Notify a chance to process the notifications sent. For letters we don't expect them to have been sent, but
  // hopefully they have got through validation so we'll know if there were any errors.
  await pause(notifyConfig.waitForStatus)

  await UpdateNoticeService.go([notice.id])
}

async function _recordResult(sendResult) {
  const { id, plaintext, notifyError, notifyId, notifyStatus, status } = sendResult

  await NotificationModel.query().patch({ plaintext, notifyError, notifyId, notifyStatus, status }).findById(id)
}

async function _sendNotifications(notifications, referenceCode) {
  for (const notification of notifications) {
    const result = await SendLetterNotificationService.go(notification, referenceCode)

    await _recordResult(result)
  }
}

async function _updateFailedEmailInvitations(alternateNoticeId, notificationIds) {
  await NotificationModel.query()
    .patch({ alternateNoticeId, updatedAt: timestampForPostgres() })
    .whereIn('id', notificationIds)
    .whereNull('alternateNoticeId')
}

module.exports = {
  go
}
