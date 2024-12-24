'use strict'

// Fetches the licences abstraction conditions

const { db } = require('../../../db/db.js')
const LicenceModel = require('../../models/licence.model.js')
// const LicenceVersionPurposeConditionModel = require('../../models/licence-version-purpose-condition.model.js')
// const LicenceVersionPurposeConditionTypeModel = require('../../models/licence-version-purpose-condition-type.model.js')

/**
 * Fetches licence abstraction conditions
 * @param {*} licenceId
 * @returns
 */
async function go(licenceId) {
  const conditions = await _fetchConditions(licenceId)
  // console.log('🚀🚀🚀 ~ conditions:', conditions)
  const licence = await _fetchLicence(licenceId)

  return {
    conditions,
    licence
  }
}

async function _fetchLicence(licenceId) {
  return LicenceModel.query().findById(licenceId).select('id', 'licenceRef')
}

async function _fetchConditions(licenceId) {
  return await db
    .select(
      'lvpct.displayTitle',
      'lvpct.description AS conditionTypeDescription',
      'lvpct.subcodeDescription',
      'lvpct.param1Label',
      'lvpct.param2Label',
      'lvpc.param1',
      'lvpc.param2',
      'lvpc.param1',
      'lvpc.param2',
      'lvpc.notes',
      'po.description AS pointDescription',
      'po.ngr1',
      'po.ngr2',
      'po.ngr3',
      'po.ngr4',
      'pu.description AS purposeDescription'
    )
    .from('licence_version_purpose_condition_types AS lvpct')
    .innerJoin(
      'licence_version_purpose_conditions AS lvpc',
      'lvpct.id',
      'lvpc.licence_version_purpose_condition_type_id'
    )
    .innerJoin('licence_version_purposes AS lvp', 'lvpc.licence_version_purpose_id', 'lvp.id')
    .innerJoin('licence_version_purpose_points AS lvpp', 'lvpp.licence_version_purpose_id', 'lvp.id')
    .innerJoin('points AS po', 'po.id', 'lvpp.point_id')
    .innerJoin('purposes as pu', 'pu.id', 'lvp.purpose_id')
    .innerJoin('licence_versions AS lv', 'lvp.licence_version_id', 'lv.id')
    .innerJoin('licences AS l', 'lv.licence_id', 'l.id')
    .where('l.id', licenceId)
    .andWhere('lv.status', 'current')
}

// async function _fetchConditions(licenceId) {
//   return await db
//     .select(
//       'lvpct.displayTitle',
//       db.raw(`ARRAY_AGG(DISTINCT ROW( \
//         lvpct.description,  \
//         lvpct.subcode_description,  \
//         lvpc.param_1,  \
//         lvpc.param_2,  \
//         lvpc.notes,  \
//         po.description,  \
//         po.ngr_1,  \
//         po.ngr_2,  \
//         po.ngr_3,  \
//         po.ngr_4,  \
//         pu.description \
//       )) AS linked_conditions`)
//     )
//     .from('licence_version_purpose_condition_types AS lvpct')
//     .innerJoin(
//       'licence_version_purpose_conditions AS lvpc',
//       'lvpct.id',
//       'lvpc.licence_version_purpose_condition_type_id'
//     )
//     .innerJoin('licence_version_purposes AS lvp', 'lvpc.licence_version_purpose_id', 'lvp.id')
//     .innerJoin('licence_version_purpose_points AS lvpp', 'lvpp.licence_version_purpose_id', 'lvp.id')
//     .innerJoin('points AS po', 'po.id', 'lvpp.point_id')
//     .innerJoin('purposes AS pu', 'pu.id', 'lvp.purpose_id')
//     .innerJoin('licence_versions AS lv', 'lvp.licence_version_id', 'lv.id')
//     .innerJoin('licences AS l', 'lv.licence_id', 'l.id')
//     .where('l.id', licenceId)
//     .andWhere('lv.status', 'current')
//     .groupBy('lvpct.displayTitle')
// }

// async function _fetch(licenceId) {
//   return LicenceVersionPurposeConditionTypeModel.query()
//     .select('displayTitle', 'description', 'subcodeDescription')
//     .innerJoinRelated('licenceVersionPurposeConditions')
//     .innerJoinRelated('licenceVersionPurposeConditions.licenceVersionPurpose')
//     .innerJoinRelated('licenceVersionPurposeConditions.licenceVersionPurpose.licenceVersion')
//     .innerJoinRelated('licenceVersionPurposeConditions.licenceVersionPurpose.licenceVersion.licence')
//     .where('licence.id', '=', licenceId)
// }

// async function _fetch(licenceId) {
//   const abstractionConditions = await db
//     .distinct()
//     .select(
//       'lvpct.displayTitle',
//       'lvpct.description',
//       'lvpct.subcodeDescription',
//       'lvpc.param1',
//       'lvpc.param2',
//       'lvpc.notes'
//     )
//     .from('licence_version_purpose_condition_types AS lvpct')
//     .innerJoin(
//       'licence_version_purpose_conditions AS lvpc',
//       'lvpct.id',
//       'lvpc.licence_version_purpose_condition_type_id'
//     )
//     .whereIn('lvpct.id', function () {
//       this.select('lvpc.licence_version_purpose_condition_type_id')
//         .from('licence_version_purpose_conditions as lvpc')
//         .innerJoin('licence_version_purposes as lvp', 'lvp.id', 'lvpc.licence_version_purpose_id')
//         .innerJoin('licence_versions as lv', 'lv.id', 'lvp.licence_version_id')
//         .innerJoin('licences as l', 'l.id', 'lv.licence_id')
//         .where('l.id', licenceId)
//         .andWhere('lv.status', 'current')
//     })

//   return abstractionConditions
// }

// async function _fetch(licenceId) {
//   return LicenceVersionPurposeConditionModel.query()
//     .select('param1', 'param2', 'notes')
//     .withGraphFetched('licenceVersionPurposeConditionType')
//     .modifyGraph('licenceVersionPurposeConditionType', (builder) => {
//       builder.select('displayTitle', 'description', 'subcodeDescription')
//     })
// }

// async function _fetch(licenceId) {
//   return LicenceModel.query()
//     .findById(licenceId)
//     .select('licenceRef', 'id')
//     .modify('currentVersion')
//     .withGraphFetched('licenceVersions.licenceVersionPurposes')
//     .modifyGraph('licenceVersions.licenceVersionPurposes', (builder) => {
//       builder.select(['licenceVersionPurposes.notes'])
//     })
//     .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints')
//     .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints', (builder) => {
//       builder.select(['licenceVersionPurposePoints.abstractionMethod'])
//     })
//     .withGraphFetched('licenceVersions.licenceVersionPurposes.purpose')
//     .modifyGraph('licenceVersions.licenceVersionPurposes.purpose', (builder) => {
//       builder.select(['purposes.description'])
//     })
//     .withGraphFetched('licenceVersions.licenceVersionPurposes.points')
//     .modifyGraph('licenceVersions.licenceVersionPurposes.points', (builder) => {
//       builder
//         .select(['points.description', 'points.id', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
//         .orderBy('points.externalId', 'asc')
//     })
//     .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions')
//     .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions', (builder) => {
//       builder.select('param1', 'param2', 'notes').distinct()
//     })
//     .withGraphFetched(
//       'licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions.licenceVersionPurposeConditionType'
//     )
//     .modifyGraph(
//       'licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions.licenceVersionPurposeConditionType',
//       (builder) => {
//         builder.select('displayTitle')
//       }
//     )
// }

module.exports = {
  go
}
