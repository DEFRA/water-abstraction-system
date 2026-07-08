/**
 * Orchestrates validating the data for the '/company-contacts/{id}/remove' page
 *
 * @module SubmitRemoveCompanyContactService
 */

import DeleteCompanyContactService from './delete-company-contact.service.js'
import FetchCompanyContactDal from '../../dal/company-contacts/fetch-company-contact.dal.js'
import FetchNotificationService from './fetch-notification.service.js'
import { flashNotification } from '../../lib/general.lib.js'

/**
 * Orchestrates validating the data for the '/company-contacts/{id}/remove' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data to redirect the user after the company contact has been removed
 */
export default async function go(id, yar) {
  const companyContact = await FetchCompanyContactDal(id)

  const notification = await FetchNotificationService(companyContact.contact.email)

  const notified = !!notification

  await DeleteCompanyContactService(id, notified)

  flashNotification(yar, 'Contact removed', `${companyContact.contact.$name()} was removed from this company.`)

  return {
    companyId: companyContact.companyId
  }
}
