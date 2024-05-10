'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/purpose` page
 * @module PurposeValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'Animal Watering & General Use In Non Farming Situations',
  'Boiler Feed',
  'Conveying Materials',
  'Drinking, Cooking, Sanitary, Washing, (Small Garden) - Commercial/Industrial/Public Services',
  'Drinking, Cooking, Sanitary, Washing, (Small Garden) - Household',
  'Dust Suppression',
  'Effluent/Slurry Dilution',
  'Evaporative Cooling',
  'Fish Farm/Cress Pond Throughflow',
  'Fish Pass/Canoe Pass',
  'Gas Suppression/Scrubbing',
  'General Cooling (Existing Licences Only) (High Loss)',
  'General Cooling (Existing Licences Only) (Low Loss)',
  'General Farming & Domestic',
  'General Use Relating To Secondary Category (High Loss)',
  'General Use Relating To Secondary Category (Medium Loss)',
  'General Use Relating To Secondary Category (Low Loss)',
  'General Use Relating To Secondary Category (Very Low Loss)',
  'General Washing/Process Washing',
  'Heat Pump',
  'Horticultural Watering',
  'Hydraulic Rams',
  'Hydraulic Testing',
  'Hydroelectric Power Generation',
  'Lake & Pond Throughflow',
  'Large Garden Watering',
  'Laundry Use',
  'Make-Up Or Top Up Water',
  'Milling & Water Power Other Than Electricity Generation',
  'Mineral Washing',
  'Non-Evaporative Cooling',
  'Pollution Remediation',
  'Potable Water Supply - Direct',
  'Potable Water Supply - Storage',
  'Process Water',
  'Raw Water Supply',
  'River Recirculation',
  'Spray Irrigation - Anti Frost',
  'Spray Irrigation - Anti Frost Storage',
  'Spray Irrigation - Direct',
  'Spray Irrigation - Spray Irrigation Definition Order',
  'Spray Irrigation - Storage',
  'Supply To A Canal For Throughflow',
  'Supply To A Leat For Throughflow',
  'Transfer Between Sources (Pre Water Act 2003)',
  'Vegetable Washing',
  'Water Bottling',
  'Water Wheels Not Used For Power',
  'Impounding (for any purpose excluding impounding for HEP)',
  'Trickle Irrigation - Direct',
  'Trickle Irrigation - Under Cover/Containers',
  'Trickle Irrigation - Storage',
  'Flood Irrigation, Including Water Meadows, Warping And Pest Control',
  'Wet Fencing And Nature Conservation',
  'Transfer Between Sources (Post Water Act 2003)',
  'Dewatering',
  'Hydraulic Fracturing (Fracking)',
  'Wet Fencing and Agriculture'
]

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/purpose` page
 *
 * When setting up a requirement users must specify a purpose for the return requirement.
 * Users must select one or more purposes linked to the licence. If these requirements are not met
 * the validation will return an error.
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} The result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go (payload) {
  const purposes = payload.purposes

  const errorMessage = 'Select any purpose for the requirements for returns'

  const schema = Joi.object({
    purposes: Joi.array()
      .items(Joi.string().valid(...VALID_VALUES))
      .required()
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'array.includesOne': errorMessage,
        'array.includes': errorMessage,
        'array.sparse': errorMessage
      })
  })

  return schema.validate({ purposes }, { abortEarly: false })
}

module.exports = {
  go
}
