/**
 * Formats data for the '/company-contacts/setup/{sessionId}/cancel' page
 * @module CancelPresenter
 */

import { abstractionAlertsLabel, selectedLiveLicences } from '../../crm.presenter.js'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { abstractionAlertLicences, abstractionAlerts, company, email, licences, name } = session

  return {
    abstractionAlertsLabel: abstractionAlertsLabel(abstractionAlerts),
    backLink: {
      href: `/system/company-contacts/setup/${session.id}/check`,
      text: 'Back'
    },
    email,
    licences: selectedLiveLicences(licences, abstractionAlertLicences, abstractionAlerts),
    name,
    pageTitle: _pageTitle(session),
    pageTitleCaption: company.name
  }
}

function _pageTitle(session) {
  if (session.companyContact) {
    return 'You are about to cancel editing this contact'
  }

  return 'You are about to cancel this contact'
}

export {
  go
}
export default {
  go
}
