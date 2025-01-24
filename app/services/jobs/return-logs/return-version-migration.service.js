'use strict'

/**
 * Determines what licences need to have new return versions created
 * @module ReturnVersionMigrationService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const FetchWaterUndertakersService = require('./fetch-water-undertakers.service.js')
const GenerateFromExisintRequirementsService = require('../../return-versions/setup/existing/generate-from-existing-requirements.service.js')
const GenerateReturnVersionService = require('../../return-versions/setup/check/generate-return-version.service.js')
const LicencesConfig = require('../../../../config/licences.config.js')
const PersistReturnVersionService = require('../../return-versions/setup/check/persist-return-version.service.js')
const UserModel = require('../../../models/user.model.js')

/**
 * Determines which licences need new return versions created for quarterly returns
 *
 * This service will generate new return versions for each licence that is a water undertaker (a water company).
 * The new return version will start on 1/04/2025.
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const usernames = ['admin-internal@wrls.gov.uk']

    if (LicencesConfig.returnVersionBatchUser) {
      usernames.unshift(LicencesConfig.returnVersionBatchUser)
    }

    const user = await UserModel.query().select(['id']).whereIn('username', usernames).first()

    const licences = await FetchWaterUndertakersService.go()

    for (const licence in licences) {
      const returnRequirements = await GenerateFromExisintRequirementsService.go(licence.returnVersions[0].id)

      const data = {
        licence: {
          id: licence.id
        },
        multipleUpload: returnRequirements.multipleUpload,
        note: {
          content: 'Changed due to water company licences moving to quarterly returns'
        },
        reason: 'change-to-return-requirements',
        returnVersionStartDate: new Date('2025-04-01'),
        requirements: returnRequirements.requirements,
        quarterlyReturns: true
      }
      console.log(licences.length)
      console.log(data)
      const returnVersionData = await GenerateReturnVersionService.go(data, user.id)
      await PersistReturnVersionService.go(returnVersionData)
    }


    calculateAndLogTimeTaken(startTime, 'Return version migration job complete')
  } catch (error) {
    global.GlobalNotifier.omfg('Return version migration job failed', error)
  }
}

module.exports = {
  go
}
