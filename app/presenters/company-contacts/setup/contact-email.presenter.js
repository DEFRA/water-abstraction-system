/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-email' page
 * @module ContactEmailPresenter
 */

import { checkUrl } from '../../../lib/check-page.lib.js'
import { formatEmail } from '../../base.presenter.js'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function contactEmail(session) {
  const { id: sessionId, company } = session

  return {
    backLink: {
      href: checkUrl(session, `/system/company-contacts/setup/${sessionId}/contact-name`),
      text: 'Back'
    },
    pageTitle: 'Enter an email address for the contact',
    pageTitleCaption: company.name,
    email: formatEmail(session.email)
  }
}
