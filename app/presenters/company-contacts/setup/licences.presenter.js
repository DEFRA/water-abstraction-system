/**
 * Formats data for the '/company-contacts/setup/{sessionId}/licences' page
 * @module LicencesPresenter
 */

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function go(session) {
  const { company, id: sessionId, licences, abstractionAlertLicences } = session

  return {
    backLink: {
      href: `/system/company-contacts/setup/${sessionId}/abstraction-alerts`,
      text: 'Back'
    },
    licences: _licences(licences, abstractionAlertLicences),
    pageTitle: 'Select the licences they should get water abstraction alerts emails for',
    pageTitleCaption: company.name
  }
}

function _licences(licences, abstractionAlertLicences) {
  return licences.map((licence) => {
    return {
      value: licence.id,
      text: licence.licenceRef,
      checked: abstractionAlertLicences?.includes(licence.id) || false
    }
  })
}
