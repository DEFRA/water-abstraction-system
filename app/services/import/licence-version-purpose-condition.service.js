'use strict'

/**
 * @module LicenceVersionPurposeConditionService
 */

const LicenceVersionPurposeConditionModel = require('../../models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeConditionValidator = require('../../validators/import/licence-version-purpose-condition.validator.js')

/**
 * Add a new licence version purpose condition
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposeConditionModel>} The instance of the newly created record
 */
async function go (data) {
  const validation = LicenceVersionPurposeConditionValidator.go(data)

  if (!validation.error) {
    return await LicenceVersionPurposeConditionModel.query()
      .insert(data)
      .onConflict(['externalId'])
      .merge([
        'licenceVersionPurposeConditionTypeId',
        'param1',
        'param2',
        'notes',
        'updatedAt'
      ])
      .returning([
        'id'
      ])
  }

  return validation.error.details[0].message
}

module.exports = {
  go
}
