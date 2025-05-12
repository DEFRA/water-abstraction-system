'use strict'

/**
 * Determines which licences need new return versions created for quarterly returns and processes them
 * @module ProcessReturnVersionMigrationService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const FetchWaterUndertakersService = require('./fetch-water-undertakers.service.js')
const GenerateReturnVersionService = require('./generate-return-version.service.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../../models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../../models/return-requirement-purpose.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')
const UserModel = require('../../../models/user.model.js')

const LicencesConfig = require('../../../../config/licences.config.js')

/**
 * Determines which licences need new return versions created for quarterly returns and processes them
 *
 * This service will generate new return versions for each current licence that is a water undertaker (a water company).
 * The new return version will start on 1/04/2025.
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const licences = await FetchWaterUndertakersService.go()
    // console.log('🚀🚀🚀 ~ licences:')
    // console.dir(licences, { depth: null, colors: true })
    const user = await _user()

    for (const licence of licences) {
      const existingReturnVersion = licence.returnVersions[0]

      const naldRegionId = licence.region.naldRegionId

      const quarterlyReturnVersion = await GenerateReturnVersionService.go(existingReturnVersion, user, naldRegionId)

      await _save(existingReturnVersion, quarterlyReturnVersion)
    }

    calculateAndLogTimeTaken(startTime, 'Return version migration job complete', { count: licences.length })
  } catch (error) {
    global.GlobalNotifier.omfg('Return version migration job failed', null, error)
  }
}

async function _save(existingReturnVersion, quarterlyReturnVersion) {
  try {
    const { returnRequirements, returnRequirementPoints, returnRequirementPurposes, ...returnVersion } =
      quarterlyReturnVersion

    await ReturnVersionModel.transaction(async (trx) => {
      await ReturnVersionModel.query(trx).insert(returnVersion)
      await ReturnRequirementModel.query(trx).insert(returnRequirements)
      await ReturnRequirementPointModel.query(trx).insert(returnRequirementPoints)
      await ReturnRequirementPurposeModel.query(trx).insert(returnRequirementPurposes)
      await ReturnVersionModel.query(trx)
        .patch({ endDate: new Date('2025-03-31') })
        .findById(existingReturnVersion.id)
    })
  } catch (error) {
    global.GlobalNotifier.omg('Return version migration licence failed', {
      errorMsg: error.message,
      stacktrace: error.stack,
      returnVersion: existingReturnVersion
    })
  }
}

async function _user() {
  const usernames = ['admin-internal@wrls.gov.uk']

  if (LicencesConfig.returnVersionBatchUser) {
    usernames.push(LicencesConfig.returnVersionBatchUser)
  }

  return UserModel.query().select(['id']).whereIn('username', usernames).orderBy('username', 'DESC').first()
}

module.exports = {
  go
}
