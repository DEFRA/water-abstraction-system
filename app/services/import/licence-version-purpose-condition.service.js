'use strict'

/**
 * @module LicenceVersionPurposeConditionService
 */

const LicenceVersionPurposeConditionModel = require('../../models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeConditionValidator = require('../../validators/import/licence-version-purpose-condition.validator.js')

/**
 * Add a new licence version purpose condition
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposeConditionModel>} The instance of the newly created record
 */
async function go (data) {
  try {
    LicenceVersionPurposeConditionValidator.go(data)

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
  } catch (error) {
    return error.message
  }
}

module.exports = {
  go
}
