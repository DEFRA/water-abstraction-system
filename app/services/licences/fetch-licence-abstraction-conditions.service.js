'use strict'

// Fetches the licences abstraction conditions

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches licence abstraction conditions
 * @param {*} licenceId
 * @returns
 */
async function go(licenceId) {
  return await _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select('licenceRef', 'id')
    .modify('currentVersion')
    .withGraphFetched('licenceVersions.licenceVersionPurposes')
    .modifyGraph('licenceVersions.licenceVersionPurposes', (builder) => {
      builder.select(['licenceVersionPurposes.notes'])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints')
    .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints', (builder) => {
      builder.select(['licenceVersionPurposePoints.abstractionMethod'])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.purpose')
    .modifyGraph('licenceVersions.licenceVersionPurposes.purpose', (builder) => {
      builder.select(['purposes.description'])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.points')
    .modifyGraph('licenceVersions.licenceVersionPurposes.points', (builder) => {
      builder
        .select(['points.description', 'points.id', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
        .orderBy('points.externalId', 'asc')
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions')
    .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions', (builder) => {
      builder.select('param1', 'param2', 'notes')
    })
    .withGraphFetched(
      'licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions.licenceVersionPurposeConditionType'
    )
    .modifyGraph(
      'licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions.licenceVersionPurposeConditionType',
      (builder) => {
        builder.select('displayTitle')
      }
    )
}

module.exports = {
  go
}
