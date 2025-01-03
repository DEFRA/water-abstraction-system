'use strict'

const LicenceVersionPurposeConditionTypeModel = require('../../models/licence-version-purpose-condition-type.model.js')
const LicenceVersionPurposeConditionModel = require('../../models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeModel = require('../../models/licence-version-purpose.model.js')

async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceVersionPurposeConditionTypeModel.query()
    .select(['id', 'displayTitle', 'description', 'subcodeDescription', 'param1Label', 'param2Label'])
    .whereExists(
      LicenceVersionPurposeConditionModel.query()
        .select(1)
        .innerJoinRelated('licenceVersionPurpose')
        .innerJoinRelated('licenceVersionPurpose.licenceVersion')
        .innerJoinRelated('licenceVersionPurpose.licenceVersion.licence')
        .where('licenceVersionPurpose:licenceVersion:licence.id', licenceId)
        .andWhere('licenceVersionPurpose:licence_version.status', 'current')
        .whereColumn(
          'licenceVersionPurposeConditions.licenceVersionPurposeConditionTypeId',
          'licenceVersionPurposeConditionTypes.id'
        )
    )
    .orderBy('displayTitle', 'ASC')
    .withGraphFetched('licenceVersionPurposeConditions')
    .modifyGraph('licenceVersionPurposeConditions', (licenceVersionPurposeConditionsBuilder) => {
      licenceVersionPurposeConditionsBuilder
        .select([
          'licenceVersionPurposeConditions.id',
          'licenceVersionPurposeConditions.param1',
          'licenceVersionPurposeConditions.param2',
          'licenceVersionPurposeConditions.param1',
          'licenceVersionPurposeConditions.param2',
          'licenceVersionPurposeConditions.notes'
        ])
        .innerJoin(
          'licenceVersionPurposes',
          'licenceVersionPurposeConditions.licenceVersionPurposeId',
          'licenceVersionPurposes.id'
        )
        .innerJoin('purposes', 'licenceVersionPurposes.purposeId', 'purposes.id')
        .orderBy('purposes.description')
        .whereExists(
          LicenceVersionPurposeModel.query()
            .select(1)
            .innerJoinRelated('licenceVersion')
            .innerJoinRelated('licenceVersion.licence')
            .where('licenceVersion:licence.id', licenceId)
            .andWhere('licence_version.status', 'current')
            .whereColumn('licenceVersionPurposeConditions.licenceVersionPurposeId', 'licenceVersionPurposes.id')
        )
        .withGraphFetched('licenceVersionPurpose')
        .modifyGraph('licenceVersionPurpose', (licenceVersionPurposeBuilder) => {
          licenceVersionPurposeBuilder
            .select(['id'])
            .withGraphFetched('purpose')
            .modifyGraph('purpose', (purposeBuilder) => {
              purposeBuilder.select(['id', 'description'])
            })
            .withGraphFetched('licenceVersionPurposePoints')
            .modifyGraph('licenceVersionPurposePoints', (licenceVersionPurposePointsBuilder) => {
              licenceVersionPurposePointsBuilder
                .select(['id'])
                .withGraphFetched('point')
                .modifyGraph('point', (pointBuilder) => {
                  pointBuilder.select(['id', 'description', 'ngr1', 'ngr2', 'ngr3', 'ngr4'])
                })
            })
        })
    })
}

module.exports = {
  go
}
