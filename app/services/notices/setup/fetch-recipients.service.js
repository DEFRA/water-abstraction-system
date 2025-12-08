'use strict'

/**
 * Orchestrates fetching and determining recipients when checking, downloading or sending notices
 * @module FetchRecipientsService
 */

const FetchAbstractionAlertRecipientsService = require('./abstraction-alerts/fetch-abstraction-alert-recipients.service.js')
const FetchAdHocReturnsRecipientsService = require('./returns-notice/fetch-ad-hoc-returns-recipients.service.js')
const FetchPaperReturnsRecipientsService = require('./returns-notice/fetch-paper-returns-recipients.service.js')
const FetchStandardReturnsRecipientsService = require('./returns-notice/fetch-standard-returns-recipients.service.js')
const MergeRecipientsService = require('./merge-recipients.service.js')
const { NoticeJourney, NoticeType } = require('../../../lib/static-lookups.lib.js')

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
async function go(session, download) {
  const recipientsData = await _recipientsData(session, download)

  return MergeRecipientsService.go(session, recipientsData)
}

async function _recipientsData(session, download) {
  if (session.noticeType === NoticeType.ABSTRACTION_ALERTS) {
    return FetchAbstractionAlertRecipientsService.go(session)
  }

  if (session.noticeType === NoticeType.PAPER_RETURN) {
    return FetchPaperReturnsRecipientsService.go(session, download)
  }

  if (session.journey === NoticeJourney.ADHOC) {
    return FetchAdHocReturnsRecipientsService.go(session, download)
  }

  return FetchStandardReturnsRecipientsService.go(session, download)
}

module.exports = {
  go
}
