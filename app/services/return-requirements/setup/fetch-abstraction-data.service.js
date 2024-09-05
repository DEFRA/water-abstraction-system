'use strict'

/**
 * Fetches a licence's abstraction data based on the current version in order to generate new return requirements
 * @module FetchAbstractionDataService
 */

const { ref } = require('objection')

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Fetches a licence's abstraction data based on the current version in order to generate new return requirements
 *
 * During the return requirements setup journey we offer users the option of setting up the new requirements using the
 * current abstraction data against the licence.
 *
 * Specifically, we look to the licence's current licence version, which in turn is linked to one or more licence
 * version purposes. For each one of these we create a return requirement setup object.
 *
 * This fetches the data needed. `GenerateFromAbstractionService` takes the result and transform it into return
 * requirements
 *
 * @param {string} licenceId - The UUID of the licence to fetch abstraction data from
 *
 * @returns {Promise<module:LicenceModel>} the matching licence model instance with abstraction data related properties
 * populated
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

/**
 * Fetch the specified licence, its current version, and other linked records we need to generate return requirements
 * from
 *
 * @private
 */
async function _fetch (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'licences.id',
      'licences.waterUndertaker',
      // This is generates a sub-select query which uses `EXISTS` to convert whether a user has a current two-part
      // tariff agreement into a boolean value
      LicenceModel.raw(`
        EXISTS (SELECT 1
          FROM licence_agreements la
          INNER JOIN financial_agreements fa ON fa.id = la.financial_agreement_id
          WHERE la.licence_ref = licences.licence_ref
          AND fa.code = 'S127'
          AND (la.end_date IS NULL OR la.end_date >= ?)) AS two_part_tariff_agreement
          `, [new Date()])
    ])
    // Grab only the current version for the licence. The licence version purposes are linked off it
    .modify('currentVersion')
    // For reasons unknown (!!) the previous team never normalised the points against a licence, just the purposes. So,
    // we have to dip into the JSONB blob of _all_ the NALD data for a licence to retrieve the points for a purpose
    .withGraphFetched('permitLicence')
    .modifyGraph('permitLicence', (builder) => {
      builder.select([
        ref('licenceDataValue:data.current_version.purposes').as('purposes')
      ])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes')
    .modifyGraph('licenceVersions.licenceVersionPurposes', (builder) => {
      builder.select([
        'id',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'dailyQuantity',
        'externalId'
      ])
        // Use the Objection.js modifier we've added to LicenceVersionPurposeModel to retrieve the purpose, plus primary
        // and secondary against a licence version purpose
        .modify('allPurposes')
    })
}

module.exports = {
  go
}
