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
async function go(licenceId, auth) {
  const licence = await FetchLicenceService.go(licenceId)

  const agreements = await FetchAgreementsService.go(licence.licenceRef)
  const chargeVersions = await FetchChargeVersionsService.go(licenceId)
  const workflows = await FetchWorkflowsService.go(licenceId)
  const returnVersions = await FetchReturnVersionsService.go(licenceId)

  const pageData = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, licence)

  return {
    ...pageData,
    activeSecondaryNav: 'set-up',
    roles: userRoles(auth)
  }
}

export {
  go
}
export default {
  go
}
