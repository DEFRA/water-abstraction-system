/**
 * Fetches recipient data for an adhoc renewal notice
 * @module FetchRenewalNoticeRecipientsService
 */

import { db } from 'water-abstraction-engine/db/db.js'

import GenerateRenewalNoticeLicenceQueryDal from '../../../../dal/notices/setup/generate-renewal-notice-licence-query.dal.js'
import GenerateRenewalRecipientsQueryDal from '../../../../dal/jobs/renewal-notice/generate-renewal-recipients-query.dal.js'

/**
 * Fetches recipient data for an adhoc renewal notice notice
 *
 * For the adhoc renewal journey a single licence reference is stored in the session. This service fetches the
 * primary user (if the licence is registered) or falls back to the licence holder — the same logic used by the
 * scheduled renewal notice job.
 *
 * @param {module:SessionModel} session - The notice setup session instance
 *
 * @returns {Promise<object[]>} The recipient data for the renewal notice
 */
export default async function fetchRenewalNoticeRecipientsService(session) {
  const { licenceRef } = session

  const { bindings, query: licenceQuery } = GenerateRenewalNoticeLicenceQueryDal(licenceRef)

  const query = GenerateRenewalRecipientsQueryDal(licenceQuery)

  const { rows } = await db.raw(query, bindings)

  return rows
}
