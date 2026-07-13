/**
 * Orchestrates fetching and presenting the data needed for the view licence set up tab
 * @module ViewSetUpService
 */

import FetchAgreementsService from './fetch-agreements.service.js'
import FetchChargeVersionsService from './fetch-charge-versions.service.js'
import FetchLicenceService from './fetch-licence.service.js'
import FetchReturnVersionsService from './fetch-return-versions.service.js'
import FetchWorkflowsService from './fetch-workflows.service.js'
import SetUpPresenter from '../../presenters/licences/set-up.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence set up page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence set up template.
 */
export default async function viewSetUp(licenceId, auth) {
  const licence = await FetchLicenceService(licenceId)

  const agreements = await FetchAgreementsService(licence.licenceRef)
  const chargeVersions = await FetchChargeVersionsService(licenceId)
  const workflows = await FetchWorkflowsService(licenceId)
  const returnVersions = await FetchReturnVersionsService(licenceId)

  const pageData = SetUpPresenter(chargeVersions, workflows, agreements, returnVersions, auth, licence)

  return {
    ...pageData,
    activeSecondaryNav: 'set-up',
    roles: userRoles(auth)
  }
}
