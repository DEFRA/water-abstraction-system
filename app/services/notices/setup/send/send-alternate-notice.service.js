/**
 * Orchestrates sending a 'failed' notice to Notify, recording the results, and checking the status when finished
 * @module SendAlternateNoticeService
 */

import NotificationModel from '../../../../models/notification.model.js'
import RenewalInvitationAlternateNoticeService from './renewal-invitation-alternate-notice.service.js'
import ReturnsInvitationAlternateNoticeService from './returns-invitation-alternate-notice.service.js'
import SendLetterNotificationService from './send-letter-notification.service.js'

import { timestampForPostgres } from '../../../../lib/general.lib.js'
import { NoticeType, NoticeTypes } from '../../../../lib/static-lookups.lib.js'

/**
 * Orchestrates sending a 'failed' notice to Notify, recording the results, and checking the status when finished
 *
 * @param {object} mainNotice - The main notice to be checked for failed emails
 *
 * @returns {Promise<object>} The alternate notice that was sent, if one was created and sent else null
 */
export default async function sendAlternateNoticeService(mainNotice) {
  const result = await _alternateNoticeService(mainNotice)

  if (!result) {
    return null
  }

  const { notice, notificationIds, notifications } = result

  await _sendNotifications(notifications, notice.referenceCode)
  await _updateFailedEmailInvitations(notice.id, notificationIds)

  return notice
}

function _alternateNoticeService(mainNotice) {
  if (mainNotice.subtype === NoticeTypes[NoticeType.RENEWAL_INVITATIONS].subType) {
    return RenewalInvitationAlternateNoticeService(mainNotice)
  }

  return ReturnsInvitationAlternateNoticeService(mainNotice)
}

async function _recordResult(sendResult) {
  const { id, plaintext, notifyError, notifyId, notifyStatus, status } = sendResult

  await NotificationModel.query().patch({ plaintext, notifyError, notifyId, notifyStatus, status }).findById(id)
}

async function _sendNotifications(notifications, referenceCode) {
  for (const notification of notifications) {
    const result = await SendLetterNotificationService(notification, referenceCode)

    await _recordResult(result)
  }
}

async function _updateFailedEmailInvitations(alternateNoticeId, notificationIds) {
  await NotificationModel.query()
    .patch({ alternateNoticeId, updatedAt: timestampForPostgres() })
    .whereIn('id', notificationIds)
    .whereNull('alternateNoticeId')
}
