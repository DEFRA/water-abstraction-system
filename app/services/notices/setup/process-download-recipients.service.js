/**
 * Orchestrates fetching and formatting the data needed for the notices setup download link
 * @module ProcessDownloadRecipientsService
 */

import DownloadAbstractionAlertPresenter from '../../../presenters/notices/setup/download-abstraction-alert.presenter.js'
import DownloadRenewalInvitationPresenter from '../../../presenters/notices/setup/download-renewal-invitation.presenter.js'
import DownloadReturnsNoticePresenter from '../../../presenters/notices/setup/download-returns-notice.presenter.js'
import FetchRecipientsService from './fetch-recipients.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { NoticeJourney, NoticeType } from '../../../lib/static-lookups.lib.js'

/**
 * Orchestrates fetching and formatting the data needed for the notices setup download link
 *
 * This service creates a csv file of recipient for the user to download. It does not seem necessary to use a `Stream`
 * to create the csv as the data is relatively small.
 *
 * @param {string} sessionId - The UUID for setup returns notice session record
 *
 * @returns {Promise<object>} The data for the download link (csv string, filename and type)
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const { notificationType, referenceCode } = session

  const recipients = await FetchRecipientsService.go(session, true)

  const formattedData = await _formattedData(recipients, session)

  return {
    data: formattedData,
    type: 'text/csv',
    filename: `${notificationType} - ${referenceCode}.csv`
  }
}

async function _formattedData(recipients, session) {
  if (session.journey === NoticeJourney.ALERTS) {
    return DownloadAbstractionAlertPresenter.go(recipients, session)
  }

  if (session.noticeType === NoticeType.RENEWAL_INVITATIONS) {
    return DownloadRenewalInvitationPresenter.go(recipients, session)
  }

  return DownloadReturnsNoticePresenter.go(recipients, session)
}

export {
  go
}
export default {
  go
}
