/**
 * Record the returns invite was sent successfully by setting the 'due' and 'sent' dates on the linked return logs
 * @module RecordInviteSentDal
 */

import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Record the returns invite was sent successfully by setting the 'due' and 'sent' dates on the linked return logs
 *
 * After checking the status of a returns invite with
 * {@link https://www.notifications.service.gov.uk/|GOV.UK Notify}, if the _request_ succeeded, and **Notify** confirms
 * the notification as 'sent', then we can set the 'due' and 'sent' date of the linked return logs, i.e. record the
 * returns invitation has been sent.
 *
 * Licensees have 29 days from the date of notification to submit their returns.
 *
 * @param {string[]} returnLogIds - the UUIDs of the return logs to update
 * @param {Date} dueDate - the date to apply to `dueDate`
 * @param {Date} sentDate - the date to apply to `sentDate`
 * @param {object} trx - Database transaction object to ensure all DB changes are applied, or none at all
 */
export default async function recordInviteSentDal(returnLogIds, dueDate, sentDate, trx) {
  const dueDateMinusOneDay = _dueDateMinusOneDay(dueDate)

  await ReturnLogModel.query(trx)
    .patch({ dueDate, sentDate, updatedAt: timestampForPostgres() })
    .where((builder) => {
      builder.whereNull('dueDate').orWhere('dueDate', '>=', dueDateMinusOneDay)
    })
    .whereIn('id', returnLogIds)
}

/**
 * When dealing with an ad-hoc notice, we may have a mix of email and letter 'single use' contacts. If this is the case,
 * then the later due date from the letter should be applied.
 *
 * When the notice is first sent, any email notifications are likely to be immediately processed by **Notify** and
 * confirmed as sent. This means we'll already have set a 'due date' for the linked return logs.
 *
 * This would have been called at that time, so the return logs 'due date' would have been null. If only emails were in
 * the notice, we're done!
 *
 * But lets say there was also a letter. The next day when we run the 'notifications-status' nightly job **Notify**
 * confirms the letter has been 'sent'. This means someone connected to the licence has been told they have an extra day
 * to submit the return log(s). We need to reflect that in the return logs linked to the returns invitation.
 *
 * The due date passed in is from the letter notification, and we want to override the existing 'due date'.
 *
 * Just to be sure, we only want to update return logs linked to the notification that have the 'email' due date, which
 * is always one day less than the letter due date.
 *
 * So, this function works out what the email due date would be (due date minus one day) for the update's WHERE clause.
 *
 * @private
 */
function _dueDateMinusOneDay(dueDate) {
  const dueDateMinusOneDay = new Date(dueDate)

  dueDateMinusOneDay.setDate(dueDateMinusOneDay.getDate() - 1)

  return dueDateMinusOneDay
}
