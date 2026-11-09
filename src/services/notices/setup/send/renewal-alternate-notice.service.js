/**
 * Fetches failed renewal notifications and creates an alternate notice for them
 * @module RenewalAlternateNoticeService
 */

import CreateAlternateRenewalNoticeService from '../create-alternate-renewal-notice.service.js'
import FetchFailedRenewalNotificationsDal from '../../../../dal/notices/setup/renewal-notice/fetch-failed-renewal-notifications.dal.js'

/**
 * Fetches failed renewal notifications and creates an alternate notice for them
 *
 * @param {object} mainNotice - The main notice to check for failed renewal emails
 *
 * @returns {Promise<object|null>} The notice, notifications, and failed notification IDs, or null if none failed
 */
export default async function renewalAlternateNoticeService(mainNotice) {
  const { licenceRefs, notificationIds } = await FetchFailedRenewalNotificationsDal(mainNotice.id)

  if (notificationIds.length === 0) {
    return null
  }

  const { expiryDate: expiryDateIso, renewalDate: renewalDateIso } = mainNotice.metadata
  const expiryDate = new Date(expiryDateIso)
  const renewalDate = new Date(renewalDateIso)

  const { notice, notifications } = await CreateAlternateRenewalNoticeService(
    mainNotice,
    licenceRefs,
    expiryDate,
    renewalDate
  )

  return { notice, notificationIds, notifications }
}
