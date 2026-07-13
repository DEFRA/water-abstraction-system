/**
 * Formats data for the '/company-contacts/{id}/contact-details' page
 * @module ContactDetailsPresenter
 */

import { abstractionAlertsLabel } from '../crm.presenter.js'
import { formatEmail, formatLongDate } from '../base.presenter.js'

/**
 * Formats data for the '/company-contacts/{id}/contact-details' page
 *
 * @param {module:CompanyModel} company - The customer from the companies table
 * @param {module:CompanyContactModel} companyContact - The customer contact from the company contacts table
 * @param {object[]} licences - The licences linked to the abstraction alert licences
 *
 * @returns {object} The data formatted for the view template
 */
export default function (company, companyContact, licences) {
  return {
    additionalContact: companyContact.licenceRole.name === 'additionalContact',
    backLink: {
      href: `/system/companies/${company.id}/contacts`,
      text: 'Go back to licence holder contacts'
    },
    contact: _contact(companyContact, licences),
    editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
    pageTitle: `Contact details for ${companyContact.contact.$name()}`,
    pageTitleCaption: company.name,
    removeContactLink: `/system/company-contacts/${companyContact.id}/remove`,
    warning: _warning(licences)
  }
}

function _created(companyContact) {
  const formattedDate = formatLongDate(companyContact.createdAt)

  if (!companyContact.createdByUser) {
    return formattedDate
  }

  return `${formattedDate} by ${companyContact.createdByUser.username}`
}

function _contact(companyContact, licences) {
  const abstractionAlertType = companyContact.$abstractionAlertType()

  return {
    abstractionAlertsLabel: abstractionAlertsLabel(abstractionAlertType),
    created: _created(companyContact),
    email: formatEmail(companyContact.contact.email),
    lastUpdated: _lastUpdated(companyContact),
    licences: _licences(abstractionAlertType, licences),
    name: companyContact.contact.$name()
  }
}

function _lastUpdated(companyContact) {
  const formattedDate = formatLongDate(companyContact.updatedAt)

  if (!companyContact.updatedByUser) {
    return formattedDate
  }

  return `${formattedDate} by ${companyContact.updatedByUser.username}`
}

function _licences(abstractionAlertType, licences) {
  if (abstractionAlertType !== 'some') {
    return []
  }

  return licences.map((licence) => {
    return licence.licenceRef
  })
}

function _warning(licences) {
  const endedLicences = licences.filter((licence) => {
    return licence.$ended()
  })

  if (endedLicences.length === 0) {
    return null
  }

  return {
    text: 'One or more licences for abstraction alerts have ended. No alerts will be sent for these.',
    iconFallbackText: 'Warning'
  }
}
