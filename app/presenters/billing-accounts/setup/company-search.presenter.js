/**
 * Formats data for the '/billing-accounts/setup/{sessionId}/company-search' page
 * @module CompanySearchPresenter
 */

import { checkUrl } from '../../../lib/check-page.lib.js'

/**
 * Formats data for the '/billing-accounts/setup/{sessionId}/company-search' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function (session) {
  const { billingAccount } = session

  return {
    backLink: {
      href: checkUrl(session, `/system/billing-accounts/setup/${session.id}/account-type`),
      text: 'Back'
    },
    companySearch: session.companySearch ?? null,
    pageTitle: 'Enter the company details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}
