/**
 * Fetches details for each notice whose notifications have had their status checked by the notification-status job
 * @module FetchCriticalNoticesDal
 */

import EventModel from '../../../models/event.model.js'
import { NoticeTypes } from '../../../lib/static-lookups.lib.js'

/**
 * Fetches details for each notice whose notifications have had their status checked by the notification-status job
 *
 * @param {string[]} noticeIds - The UUIDs of the notices processed by the status check job
 *
 * @returns {Promise<module:EventModel[]>} any matching notices which are critical, and contain errored notifications
 * to primary users that have not been sent an alternate notification
 */
export default async function fetchCriticalNoticesDal(noticeIds) {
  return EventModel.query()
    .select('id', 'issuer', 'metadata', 'subtype')
    .whereIn('subtype', [NoticeTypes.renewalInvitations.subType, NoticeTypes.invitations.subType])
    .whereIn('id', noticeIds)
    .whereExists(
      EventModel.relatedQuery('notifications')
        .where('status', 'error')
        .whereIn('messageRef', [
          'renewal invitation',
          'renewal invitation ad-hoc',
          'returns invitation',
          'returns invitation ad-hoc'
        ])
        .where('contactType', 'primary user')
        .where('messageType', 'email')
        .whereNull('alternateNoticeId')
    )
}
