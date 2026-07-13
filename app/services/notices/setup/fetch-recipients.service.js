/**
 * Orchestrates fetching and determining recipients when checking, downloading or sending notices
 * @module FetchRecipientsService
 */

import FetchAbstractionAlertRecipientsDal from '../../../dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js'
import FetchPaperReturnsRecipientsService from './returns-notice/fetch-paper-returns-recipients.service.js'
import FetchRenewalInvitationRecipientsService from './renewal-notice/fetch-renewal-invitation-recipients.service.js'
import FetchReturnsInvitationRecipientsService from './returns-notice/fetch-returns-invitation-recipients.service.js'
import FetchReturnsReminderRecipientsService from './returns-notice/fetch-returns-reminder-recipients.service.js'
import MergeRecipientsService from './merge-recipients.service.js'
import { NoticeType } from '../../../lib/static-lookups.lib.js'

/**
 * Orchestrates fetching and determining recipients when checking, downloading or sending notices
 *
 * Fetches the recipients based on the journey type and determines recipients (remove duplicates).
 *
 * @param {module:SessionModel} session - The session instance
 * @param {boolean} download - Flag indicating if this is for download purposes (affects aggregation and result
 * formatting)
 *
 * @returns {Promise<object[]>} The recipient data for the notice or download
 */
export default async function fetchRecipientsService(session, download) {
  const recipientsData = await _recipientsData(session, download)

  return MergeRecipientsService(session, recipientsData)
}

async function _recipientsData(session, download) {
  if (session.noticeType === NoticeType.ABSTRACTION_ALERTS) {
    return FetchAbstractionAlertRecipientsDal(session)
  }

  if (session.noticeType === NoticeType.PAPER_RETURN) {
    return FetchPaperReturnsRecipientsService(session, download)
  }

  if (session.noticeType === NoticeType.INVITATIONS) {
    return FetchReturnsInvitationRecipientsService(session, download)
  }

  if (session.noticeType === NoticeType.RENEWAL_INVITATIONS) {
    return FetchRenewalInvitationRecipientsService(session)
  }

  return FetchReturnsReminderRecipientsService(session, download)
}
