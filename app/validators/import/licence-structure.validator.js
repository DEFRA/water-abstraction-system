'use strict'

/**
 * @module ImportLicenceStructureValidator
 */

const Joi = require('joi')

/**
 * Checks that the transformed licence has a structure valid for persisting to WRLS
 *
 * The data assigned to the licence object will have already been validated by `ImportLicenceValidator`. This validator
 * is ensuring the licence has a valid structure. For example, that it has at least 1 licence version, which in turn has
 * at least 1 licence version purpose.
 *
 * Only if the data against a licence and its child records is valid, and the overall structure of the licence is valid
 * should we be attempting to import it.
 *
 * A valid licence structure is the following. Some properties must contain at least one child object to be valid. Those
 * that are optional we leave empty.
 *
 * ```javascript
 * {
 *   licenceVersions: [{
 *     licenceVersionPurposes: [{
 *       licenceVersionPurposeConditions: []
 *     }]
 *   }]
 * }
 * ```
 *
 * @param {object} licence - The transformed licence with child records, for example, licence versions
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licence) {
  const schema = Joi.object({
    licenceVersions: Joi.array().min(1).items(
      Joi.object({
        licenceVersionPurposes: Joi.array().min(1)
      })
        .unknown(true))
  })
    .unknown(true)

  const result = schema.validate(licence)

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
