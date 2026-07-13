/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/year` page
 * @module YearService
 */

import FetchLicenceSupplementaryYearsService from './fetch-licence-supplementary-years.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import YearPresenter from '../../../presenters/bill-runs/setup/year.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/year` page
 *
 * Supports generating the data needed for the year page in the setup bill run journey. It fetches the current
 * session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the year page
 */
export default async function year(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const regionId = session.region
  const twoPartTariffSupplementary = session.type === 'two_part_supplementary'
  const licenceSupplementaryYears = await FetchLicenceSupplementaryYearsService(regionId, twoPartTariffSupplementary)

  const formattedData = YearPresenter(licenceSupplementaryYears, session)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}
