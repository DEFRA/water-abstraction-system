'use strict'

const LicenceModel = require('../../../app/models/licence.model.js')
const { generateLicenceRef } = require('../helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * When we check if a licence ends or has ended, we query the database and return the expected, revoked, and lapsed date.
 *
 * We would then use the 'ends' or 'ended' instance methods.
 *
 * In most cases the query will return the licence ref as well, so it is included here.
 *
 * @param {Date} endDate - a date to end the licence on (set the 'expiredDate')
 *
 * @returns {module:LicenceModel} A licence to be used in tests that uses the 'ends' or 'ended' instance method
 */
function licenceEnds(endDate = null) {
  return LicenceModel.fromJson({
    expiredDate: endDate,
    id: generateUUID(),
    lapsedDate: null,
    licenceRef: generateLicenceRef(),
    revokedDate: null
  })
}

module.exports = { licenceEnds }
