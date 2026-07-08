/**
 * Orchestrates fetching and presenting the data needed for the view invalid addresses page
 * @module ViewInvalidAddressesService
 */

import FetchInvalidAddressesService from './fetch-invalid-addresses.service.js'
import ViewInvalidAddressesPresenter from '../../presenters/reports/view-invalid-addresses.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the view invalid addresses page
 *
 * @returns {Promise<object>} The view data for the invalid addresses page
 */
export default async function go() {
  const invalidAddresses = await FetchInvalidAddressesService()

  const pageData = ViewInvalidAddressesPresenter(invalidAddresses)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}
