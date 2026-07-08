/**
 * Fetches recipient data for an adhoc renewal invitation notice
 * @module FetchRenewalInvitationRecipientsService
 */

import GenerateRenewalInvitationLicenceQueryDal from '../../../../dal/notices/setup/generate-renewal-invitation-licence-query.dal.js'
import GenerateRenewalRecipientsQueryService from '../../../jobs/renewal-invitations/generate-renewal-recipients-query.service.js'
import { db } from '../../../../../db/db.js'

/**
 * Fetches recipient data for an adhoc renewal invitation notice
 *
 * For the adhoc renewal journey a single licence reference is stored in the session. This service fetches the
 * primary user (if the licence is registered) or falls back to the licence holder — the same logic used by the
 * scheduled renewal invitations job.
 *
 * @param {module:SessionModel} session - The notice setup session instance
 *
 * @returns {Promise<object[]>} The recipient data for the renewal invitation notice
 */
export default async function go(session) {
  const { licenceRef } = session

  const { bindings, query: licenceQuery } = GenerateRenewalInvitationLicenceQueryDal(licenceRef)

  const query = GenerateRenewalRecipientsQueryService(licenceQuery)

  const { rows } = await db.raw(query, bindings)

  return rows
}
