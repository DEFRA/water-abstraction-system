'use strict'

/**
 * Determines if a licence has a two-part tariff (Section 127 )licence agreement in place for the start date selected
 * @module DetermineTwoPartTariffAgreementService
 */

const LicenceAgreementModel = require('../../../../models/licence-agreement.model.js')

/**
 * Determines if a licence has a two-part tariff (Section 127 )licence agreement in place for the start date selected
 *
 * Given a licence ref and a licence version, determine if there is a Section 127 (two-part tariff) agreement in place
 * for the licence on the start date they have selected for the new return version.
 *
 * This is then used in combination with the two-part tariff flag on each licence version purpose to determine the
 * collection frequency for the return requirement that will be generated.
 *
 * If the query returns a result, then the licence is determined to have had a two-part tariff licence agreement in
 * place for the start of the new return version.
 *
 * @param {string} licenceRef - The reference for the licence
 * @param {Date} startDate - The start date the user has selected for the new return version
 *
 * @returns {Promise<boolean>} - Whether there is a two-part tariff agreement in place on the start date for the licence
 */
async function go(licenceRef, startDate) {
  const result = await LicenceAgreementModel.query()
    .select('licenceAgreements.id')
    .innerJoin('financialAgreements', 'financialAgreements.id', 'licenceAgreements.financialAgreementId')
    .where('licenceAgreements.licenceRef', licenceRef)
    .where('financialAgreements.code', 'S127')
    .where('licenceAgreements.startDate', '<=', startDate)
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
