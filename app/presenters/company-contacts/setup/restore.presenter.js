/**
 * Formats data for the '/company-contacts/setup/{sessionId}/restore' page
 * @module RestorePresenter
 */

import { titleCase } from '../../base.presenter.js'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/restore' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function restore(session) {
  const { company, email, name, abstractionAlerts } = session

  return {
    backLink: {
      href: `/system/company-contacts/setup/${session.id}/check`,
      text: 'Back'
    },
    abstractionAlerts: titleCase(abstractionAlerts),
    email,
    name,
    pageTitle: 'You are about to restore this contact',
    pageTitleCaption: company.name
  }
}
