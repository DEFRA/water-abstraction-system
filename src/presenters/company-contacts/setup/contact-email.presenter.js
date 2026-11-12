/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-email' page
 * @module ContactEmailPresenter
 */

import { formatEmail } from 'water-abstraction-engine/presenters/base.presenter.js'
import { checkUrl } from 'water-abstraction-engine/lib/check-page.lib.js'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function contactEmailPresenter(session) {
  const { id: sessionId, company } = session

  return {
    backLink: {
      href: checkUrl(session, `/system/company-contacts/setup/${sessionId}/contact-name`),
      text: 'Back'
    },
    email: formatEmail(session.email),
    pageTitle: 'Enter an email address for the contact',
    pageTitleCaption: company.name
  }
}
