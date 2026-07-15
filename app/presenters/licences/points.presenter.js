/**
 * Formats the licence and related points data for the view licence points page
 * @module PointsPresenter
 */

import { formatLicencePoints } from '../licence.presenter.js'
import { pluralise } from './base-licences.presenter.js'

/**
 * Formats the licence and related points data for the view licence points page
 *
 * @param {object[]} points - The points data returned by `FetchLicencePointsService`
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} licence and points data needed by the view template
 */
export default function pointsPresenter(points, licence) {
  const { id: licenceId, licenceRef } = licence

  const licencePoints = formatLicencePoints(points)

  return {
    backLink: {
      href: `/system/licences/${licenceId}/summary`,
      text: 'Go back to licence summary'
    },
    licencePoints,
    pageTitle: 'Points',
    pageTitleCaption: `Licence ${licenceRef}`,
    showingPoints: `Showing ${licencePoints.length} abstraction ${pluralise('point', licencePoints.length)}`
  }
}
