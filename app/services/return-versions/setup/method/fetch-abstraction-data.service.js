'use strict'

/**
 * Fetches a licence's abstraction data and relevant licence version for the start date the user has selected
 * @module FetchAbstractionDataService
 */

const LicenceModel = require('../../../../models/licence.model.js')
const LicenceAgreementModel = require('../../../../models/licence-agreement.model.js')

/**
 * Fetches a licence's abstraction data and relevant licence version for the start date the user has selected
 *
 * During the return requirements setup journey we offer users the option of setting up the new requirements using the
 * relevant abstraction data against the licence.
 *
 * Specifically, we look for the 'relevant' licence version for the start date the user has entered, which in turn is
 * linked to one or more licence version purposes. For each one of these we create a return requirement setup object.
 *
 * We find the 'relevant' licence version for the start date the user has entered, by filtering for those where the end
 * date is null or greater then sorting them ascending order (oldest at the top).
 *
 * If a licence only has one 'current' licence version (it will have a null end date) then it will be the one selected.
 *
 * If it has a superseded licence version, but the start date is greater than its end date, we still just get the
 * 'current' version returned. Else the first licence version with an end date equal to or greater than our start date
 * is the version that will be used.
 *
 * This fetches the data needed. `GenerateFromAbstractionService` takes the result and transforms it into return
 * requirements
 *
 * @param {string} licenceId - The UUID of the licence to fetch abstraction data from
 * @param {Date} startDate - The start date the user has selected for the new return version, needed to find the
 * relevant licence version
 *
 * @returns {Promise<module:LicenceModel>} the matching licence model instance with abstraction data related properties
 * populated
 */
async function go(licenceId, startDate) {
  const licence = await _fetch(licenceId, startDate)

  licence.twoPartTariffAgreement = await _twoPartTariff(licence.licenceRef, startDate)

  return licence
}

async function _fetch(licenceId, startDate) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['licences.id', 'licences.licenceRef', 'licences.waterUndertaker'])
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (licenceVersionsBuilder) => {
      licenceVersionsBuilder
        .select(['id', 'endDate', 'startDate'])
        .where((builder) => {
          builder.whereNull('licenceVersions.endDate').orWhere('licenceVersions.endDate', '>=', startDate)
        })
        .orderBy('endDate', 'ASC')
        .limit(1)
        .withGraphFetched('licenceVersionPurposes')
        .modifyGraph('licenceVersionPurposes', (licenceVersionPurposesBuilder) => {
          licenceVersionPurposesBuilder
            .select([
              'licenceVersionPurposes.id',
              'licenceVersionPurposes.abstractionPeriodEndDay',
              'licenceVersionPurposes.abstractionPeriodEndMonth',
              'licenceVersionPurposes.abstractionPeriodStartDay',
              'licenceVersionPurposes.abstractionPeriodStartMonth',
              'licenceVersionPurposes.dailyQuantity',
              'licenceVersionPurposes.externalId'
            ])
            // Use the Objection.js modifier we've added to LicenceVersionPurposeModel to retrieve the purpose, plus
            // primary and secondary against a licence version purpose
            .modify('allPurposes')
            .withGraphFetched('points')
            .modifyGraph('points', (pointsBuilder) => {
              pointsBuilder.select(['points.id', 'points.description'])
            })
        })
    })
}

/**
 * Given a licence ref and a licence version, determine if there is a Section 127 (two-part tariff) agreement
 * in place for the licence on the start date they have selected for the new return version.
 *
 * This is then used in combination with the two-part tariff flag on each licence version purpose to determine the
 * collection frequency for the return requirement that will be generated.
 *
 * The way we select the relevant financial agreement record uses the same end date logic as detailed for documentation
 * for `go()`.
 *
 * @private
 */
async function _twoPartTariff(licenceRef, startDate) {
  const result = await LicenceAgreementModel.query()
    .select('licenceAgreements.id')
    .innerJoin('financialAgreements', 'financialAgreements.id', 'licenceAgreements.financialAgreementId')
    .where('licenceRef', licenceRef)
    .where('financialAgreements.code', 'S127')
    .where((builder) => {
      builder.whereNull('licenceAgreements.endDate').orWhere('licenceAgreements.endDate', '>=', startDate)
    })
    .orderBy('licenceAgreements.endDate', 'ASC')
    .limit(1)
    .first()

  return !!result
}

module.exports = {
  go
}
