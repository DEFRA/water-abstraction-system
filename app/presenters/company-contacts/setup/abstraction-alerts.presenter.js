/**
 * Formats data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 * @module AbstractionAlertsPresenter
 */

import { checkUrl } from '../../../lib/check-page.lib.js'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function abstractionAlertsPresenter(session) {
  const { id: sessionId, company, licences } = session

  return {
    abstractionAlerts: session.abstractionAlerts ?? null,
    backLink: {
      href: checkUrl(session, `/system/company-contacts/setup/${sessionId}/contact-email`),
      text: 'Back'
    },
    pageTitle: 'Should the contact get abstraction alerts?',
    pageTitleCaption: company.name,
    showSomeLicences: licences.length > 0
  }
}
