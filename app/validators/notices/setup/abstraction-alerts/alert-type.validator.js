'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @module AlertTypeValidator
 */

const Joi = require('joi')
const DetermineRelevantLicenceMonitoringStationsByAlertTypeService = require('../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations-by-alert-type.service.js')

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
  const schema = Joi.object({
    alertType: Joi.required()
      .custom((value, helpers) => {
        return _availableRestrictionTypeCustomError(value, helpers, licenceMonitoringStations)
      }, 'Custom Alert Type Validation')
      .messages({
        'any.required': errorMessage,
        customAlertType: `There are no thresholds with the {{#value}} restriction type, ${errorMessage}`
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

/**
 * We need to check if the chosen alert type has any matching licence monitoring station with the matching restriction
 * type.
 *
 * This is not straight forwards, and we have created a shared place to handle the logic in
 * DetermineRelevantLicenceMonitoringStationsByAlertTypeService
 *
 * @private
 */
function _availableRestrictionTypeCustomError(value, helpers, licenceMonitoringStations) {
  const availableTypes = _availableRestrictionType(licenceMonitoringStations, value)

  const errorMsg = `There are no thresholds with the ${value} restriction type, ${errorMessage}`

  if (availableTypes.length === 0 || !availableTypes.includes(value)) {
    return helpers.error('customAlertType', {
      message: errorMsg
    })
  }

  return value
}

/**
 * Returns a list of available alert types based on the restriction types
 * found in the provided licence monitoring stations.
 *
 * When there are no licence monitoring stations with where the alert type matches the restriction type then there are
 * no valid options to available. This is unlikely, as to get to this state there must be some sort of restriction type.
 *
 * When there is a restriction type of 'stop_or_reduce' then that is considered a 'reduce' alert type for validation.
 *
 * We do not have a 1:1 map with the alert types. In fact only 'stop' and 'reduce' match. This means the 'warning' and
 * 'resume' alert type have no corresponding restriction type. When this is the case all licence monitoring stations are
 * valid and show for theses alert types.k
 *
 * @private
 */
function _availableRestrictionType(licenceMonitoringStations, alertType) {
  const relevantLicenceMonitoringStation = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
    licenceMonitoringStations,
    alertType
  )

  const restrictionTypes = relevantLicenceMonitoringStation.map((licenceMonitoringStation) => {
    return licenceMonitoringStation.restrictionType
  })

  if (restrictionTypes.length === 0) {
    return []
  }

  const types = new Set(['warning', 'resume', ...restrictionTypes])

  if (restrictionTypes.includes('stop_or_reduce')) {
    types.add('reduce')
  }

  return Array.from(types)
}

module.exports = {
  go
}
