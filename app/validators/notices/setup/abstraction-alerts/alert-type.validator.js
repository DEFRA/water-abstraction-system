'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @module AlertTypeValidator
 */

const Joi = require('joi')

const errorMessage = 'Select the type of alert you need to send'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object[]} licenceMonitoringStations - used to check if the user has selected an unavailable type
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licenceMonitoringStations) {
  const restrictionTypes = _availableRestrictionType(licenceMonitoringStations)

  const schema = Joi.object({
    'alert-type': Joi.valid(...restrictionTypes)
      .required()
      .messages({
        'any.required': errorMessage,
        'any.only': `There are no thresholds with the {#value} restriction type, ${errorMessage}`
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

/**
 * Returns a list of available alert types based on the restriction types
 * found in the provided licence monitoring stations.
 *
 * Includes the default alert types: 'warning' and 'resume',
 * followed by any additional restriction types extracted from the input.
 *
 * @private
 */
function _availableRestrictionType(licenceMonitoringStations) {
  const restrictionTypes = licenceMonitoringStations.map((licenceMonitoringStation) => {
    return licenceMonitoringStation.restrictionType
  })

  return ['warning', 'resume', ...restrictionTypes]
}

module.exports = {
  go
}
