/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/contact-details' page
 *
 * @module ViewContactDetailsService
 */

import ContactDetailsPresenter from '../../presenters/company-contacts/contact-details.presenter.js'
import FetchAbstractionAlertLicencesDal from '../../dal/company-contacts/fetch-abstraction-alert-licences.dal.js'
import FetchCompanyContactDetailsService from './fetch-company-contact-details.service.js'
import FetchCompanyService from '../../dal/companies/fetch-company.dal.js'
import { readFlashNotification } from '../../lib/general.lib.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}/contact-details' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, auth, yar) {
  const companyContact = await FetchCompanyContactDetailsService.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const licences = await FetchAbstractionAlertLicencesDal(companyContact.abstractionAlertLicences)

  const pageData = ContactDetailsPresenter.go(company, companyContact, licences)

  const notification = readFlashNotification(yar)

  return {
    activeSecondaryNav: 'contact-details',
    notification,
    roles: userRoles(auth),
    ...pageData
  }
}

export {
  go
}
export default {
  go
}
