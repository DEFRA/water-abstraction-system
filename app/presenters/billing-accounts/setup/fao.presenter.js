/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/fao` page
 * @module FAOPresenter
 */

import { checkUrl } from '../../../lib/check-page.lib.js'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function go(session) {
  return {
    backLink: {
      href: checkUrl(session, `/system/billing-accounts/setup/${session.id}/existing-address`),
      text: 'Back'
    },
    fao: session.fao ?? null,
    pageTitle: 'Do you need to add an FAO?',
    pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
  }
}
