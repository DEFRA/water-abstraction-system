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
  console.log('🚀🚀🚀 ~ conditions:', conditions)
  const groupedConditions = _groupAbstractionConditions(conditions)
  console.log('🚀🚀🚀 ~ groupedConditions:', groupedConditions)
  // console.log('🚀🚀🚀 ~ Formatted conditions: ', util.inspect(conditions, false, null, true /* enable colors */))

  return {
    conditions,
    pageTitle: 'Licence abstraction conditions',
    licenceId: data.licence.id,
    licenceRef: data.licence.licenceRef
  }
}

function _formatAbstractionConditions(conditions) {
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

function _groupAbstractionConditions(conditions) {
  return conditions.reduce((grouped, condition) => {
    const { displayTitle } = condition
    if (!grouped[displayTitle]) {
      grouped[displayTitle] = []
    }

    grouped[displayTitle].push(condition)
    return grouped
  }, {})
}

function formatPoint(condition) {
  const point = PointModel.fromJson(condition)

  return point.$describe()
}

module.exports = {
  go
}

/*
	Within the area formed by the straight lines running between National Grid References TQ 781 788, TQ 798 768,
  TQ 778 752 and TQ 757 767 (INLAND WATER DITCHES AND DRAINS KNOWN AS THE LIPWELL STREAM)
  Within the area formed by the straight lines running between National Grid References TQ 781 788, TQ 798 768,
  TQ 778 752 and TQ 757 767 (INLAND WATER DITCHES AND DRAINS KNWON AS THE LIPWELL STREAM)
*/
