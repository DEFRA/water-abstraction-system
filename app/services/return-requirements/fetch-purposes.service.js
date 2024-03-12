'use strict'

/**
 * @module FetchPurposesService
 */

// const LicenceVersionModel = require('../../models/licence-version.model.js')
const PurposeModel = require('../../models/purpose.model.js')

async function go (licenceId) {
  const data = await _fetchPurpose(licenceId)

  return data
}

async function _fetchPurpose (licenceId) {
  // const result = await LicenceVersionModel.query()
  //   .select('id')
  //   .where('licenceId', licenceId)
  //   .andWhere('status', 'current')
  //   .limit(1)
  //   .withGraphFetched('licenceVersionPurposes')
  //   .modifyGraph('licenceVersionPurposes', (builder) => {
  //     builder.select([
  //       'licenceVersionPurposes.purposeId'
  //     ])
  //   })
  //   .withGraphFetched('purposes')
  //   .modifyGraph('purposes', (builder) => {
  //     builder.select([
  //       'purposes.description'
  //     ])
  //   })
  //   .first()

  // const result = await PurposeModel.query()
  //   .select('description')
  //   .distinct()
  //   .withGraphFetched('licenceVersionPurposes')
  //   .modifyGraph('licenceVersionPurposes', builder => {
  //     builder.select(['licenceVersionPurposes.licenceVersionId'])
  //   })
  //   .withGraphFetched('licenceVersionPurposes.licenceVersion')
  //   .modifyGraph('licenceVersions', builder => {
  //     builder.select(['licenceVersions.licenceId'])
  //       .where('licenceId', licenceId)
  //       .andWhere('status', 'current')
  //   })

  // const result = await PurposeModel.query()
  //   .select('description')
  //   .distinct()
  //   .innerJoinRelated('licenceVersionPurposes')
  //   .where('licenceVersionPurposes.purposeId', 'purposes.id')
  //   .innerJoinRelated('licenceVersionPurposes.licenceVersion')
  //   .where('licenceVersions.id', 'licenceVersionPurposes.licenceVersion.id')
  //   .where('licenceVersionPurposes.licenceVersion.licenceId', licenceId)
  //   .where('licenceVersionPurpose.licenceVersion.licence.status', 'current')

  const result = await PurposeModel.query()
    .distinct('description')
    .joinRelated('licenceVersionPurposes')
    .joinRelated('licenceVersionPurposes.licenceVersion')
    .where('licenceVersionPurposes.licenceVersion.licence_id', 'c32ab7c6-e342-47b2-9c2e-d178ca89c5e5')
    .where('licenceVersionPurposes.licenceVersion.status', 'current')

  console.log('🚀🚀🚀 ~ result:', result)

  const purposes = await _extractPurposes(result)

  return purposes
}

async function _extractPurposes (result) {
  const descriptions = []

  const { purposes } = result

  purposes.forEach((purpose) => {
    descriptions.push(purpose.description)
  })

  return descriptions
}

module.exports = {
  go
}

// SELECT
// DISTINCT p.description
// FROM public.purposes p
// INNER JOIN public.licence_version_purposes lvp ON lvp.purpose_id = p.id
// INNER JOIN public.licence_versions lv ON lv.id = lvp.licence_version_id
// WHERE lv.licence_id = 'c32ab7c6-e342-47b2-9c2e-d178ca89c5e5' AND lv.status = 'current';