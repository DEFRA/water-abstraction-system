import LicenceModel from '../../../app/models/licence.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'
import { generateLicenceRef } from '../helpers/licence.helper.js'

/**
 * Generates an instance of `LicenceModel` with an ID and a licence reference
 *
 * You can override or add additional properties by passing them in as an object
 *
 * @param {object} [data={}] - an object of properties to override or add to the licence
 *
 * @returns {module:LicenceModel} A licence with a licence ref
 */
function licence(data = {}) {
  return LicenceModel.fromJson({
    id: generateUUID(),
    licenceRef: generateLicenceRef(),
    ...data
  })
}

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
  return licence({
    expiredDate: endDate,
    lapsedDate: null,
    revokedDate: null
  })
}

export default { licence, licenceEnds }
