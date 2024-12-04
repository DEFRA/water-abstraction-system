'use strict'

// const util = require('util')
const PointModel = require('../../models/point.model.js')

/**
 * Formats the licence data
 * @param {string} data
 * @returns
 */
function go(data) {
  const conditions = _formatAbstractionConditions(data.conditions)
  // console.log('🚀🚀🚀 ~ Formatted conditions: ', util.inspect(conditions, false, null, true /* enable colors */))

  return {
    conditions,
    pageTitle: 'Licence abstraction conditions',
    licenceId: data.licence.id,
    licenceRef: data.licence.licenceRef
  }
}

function _formatAbstractionConditions(conditions) {
  // console.log('🚀🚀🚀 ~ Unformatted conditions: ', util.inspect(conditions, false, null, true /* enable colors */))
  return conditions.map((condition) => {
    return {
      displayTitle: condition.displayTitle,
      point: formatPoint(condition),
      purpose: condition.purposeDescription,
      notes: condition.notes,
      conditionTypeDescription: condition.conditionTypeDescription,
      subcodeDescription: condition.subcodeDescription
    }
  })
}

function formatPoint(condition) {
  const point = PointModel.fromJson(condition)

  return point.$describe()
}

module.exports = {
  go
}
