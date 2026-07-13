/**
 * Formats data for the '/company-contacts/{id}/remove' page
 * @module RemoveCompanyContactPresenter
 */

import { formatEmail } from '../base.presenter.js'
import { abstractionAlertsLabel } from '../crm.presenter.js'

/**
 * Formats data for the '/company-contacts/{id}/remove' page
 *
 * @param {module:CompanyModel} company - The customer from the companies table
 * @param {module:CompanyContactModel} companyContact - The customer contact from the company contacts table
 * @param {object[]} licences - The licences linked to the abstraction alert licences
 *
 * @returns {object} The data formatted for the view template
 */
export default function (company, companyContact, licences) {
  const abstractionAlertType = companyContact.$abstractionAlertType()

  return {
    backLink: {
      href: `/system/company-contacts/${companyContact.id}/contact-details`,
      text: 'Go back to contact details'
    },
    contact: {
      abstractionAlertsLabel: abstractionAlertsLabel(abstractionAlertType),
      email: formatEmail(companyContact.contact.email),
      licences: _licences(abstractionAlertType, licences),
      name: companyContact.contact.$name()
    },
    pageTitle: `You're about to remove this contact`,
    pageTitleCaption: company.name,
    ..._warning(companyContact)
  }
}

function _licences(abstractionAlertType, licences) {
  if (abstractionAlertType !== 'some') {
    return []
  }

  return licences.map((licence) => {
    return licence.licenceRef
  })
}

function _warning(companyContact) {
  const { abstractionAlerts, abstractionAlertsCount } = companyContact

  if (abstractionAlerts && abstractionAlertsCount === 1) {
    return {
      warning: {
        text: 'Removing this contact means the licence holder will receive future water abstraction alerts by post.',
        iconFallbackText: 'Warning'
      }
    }
  }

  return {}
}
