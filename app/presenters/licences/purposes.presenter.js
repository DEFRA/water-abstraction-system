'use strict'

/**
 * Formats the licence and related licenceVersionPurposes data for the view licence purposes page
 * @module PurposesPresenter
 */

const { formatLicencePurposes } = require('../licence.presenter.js')
const { pluralise } = require('./base-licences.presenter.js')

/**
 * Formats the licence and related licenceVersionPurposes data for the view licence purposes page
 *
 * @param {object[]} purposes - The licenceVersionPurposes data returned by `FetchLicencePurposesService`
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} licence and licenceVersionPurposes data needed by the view template
 */
function go(purposes, licence) {
  const { id, licenceRef } = licence

  const licencePurposes = formatLicencePurposes(purposes)

  return {
    backLink: {
      href: `/system/licences/${id}/summary`,
      text: 'Go back to summary'
    },
    licencePurposes,
    pageTitle: 'Purposes, periods and amounts',
    pageTitleCaption: `Licence ${licenceRef}`,
    showingPurposes: `Showing ${licencePurposes.length} ${pluralise('purpose', licencePurposes.length)}`
  }
}

module.exports = {
  go
}
