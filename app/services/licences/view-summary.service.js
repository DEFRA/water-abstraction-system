/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewSummaryService
 */

import FetchLicenceService from './fetch-licence.service.js'
import FetchSummaryService from './fetch-summary.service.js'
import SummaryHeadingPresenter from '../../presenters/licences/summary-heading.presenter.js'
import SummaryPresenter from '../../presenters/licences/summary.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence summary template.
 */
export default async function (licenceId, auth) {
  const licence = await FetchLicenceService(licenceId)
  const summary = await FetchSummaryService(licenceId)

  const summaryHeadingData = SummaryHeadingPresenter(licence, summary)
  const pageData = SummaryPresenter(licence, summary)

  return {
    ...summaryHeadingData,
    ...pageData,
    activeSecondaryNav: 'summary',
    roles: userRoles(auth)
  }
}
