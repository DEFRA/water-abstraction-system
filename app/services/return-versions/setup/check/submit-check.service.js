'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module SubmitCheckService
 */

const CreateReturnVersionService = require('./create-return-version.service.js')
const DeleteSessionDal = require('../../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const GenerateReturnVersionService = require('./generate-return-version.service.js')
const ProcessExistingReturnVersionsService = require('./process-existing-return-versions.service.js')
const ProcessLicenceReturnLogsService = require('../../../return-logs/process-licence-return-logs.service.js')
const ReturnVersionModel = require('../../../../models/return-version.model.js')
const UpdateSucceededReturnLogsDal = require('../../../../dal/return-versions/update-succeeded-return-logs.dal.js')
const VoidReturnLogsService = require('../../../return-logs/void-return-logs.service.js')

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 *
 * After fetching the session instance for the returns requirements journey in progress it validates that what the user
 * has setup can be persisted for the licence.
 *
 * If valid it converts the session data to return requirements records then deletes the session record.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 * @param {number} userId - The id of the logged in user
 *
 * @returns {Promise<string>} The licence Id
 */
async function go(sessionId, userId) {
  const session = await FetchSessionDal.go(sessionId)
  console.log('🚀🚀🚀 ~ session:')
  console.dir(session, { depth: null, colors: true })

  await DeleteSessionDal.go(sessionId)

  try {
    const { journey, licence } = session
    const returnVersionData = await GenerateReturnVersionService.go(session, userId)

    // We wrap all the steps in a transaction to avoid only applying some of the changes
    await ReturnVersionModel.transaction(async (trx) => {
      // 1) Figure out where this new return version sits within the existing history. If it falls in the middle,
      //    existing return versions will need to be updated. The result is we'll determine what end date to apply.
      await _processEndDate(returnVersionData.returnVersion, licence.id, trx)

      // 2) Next, persist _all_ the return version data. We do this now so the later steps can access the new return
      //    version and requirements data
      const returnVersion = await CreateReturnVersionService.go(returnVersionData, trx)

      // 3) If the return version is to declare that no returns are required, we need to void any existing return logs
      //    within the matching period.
      if (journey === 'no-returns-required') {
        await VoidReturnLogsService.go(licence.licenceRef, returnVersion.startDate, returnVersion.endDate, trx)
      }

      // 4) Process any existing return logs affected by the change. The change date will be the return version's start
      //    date minus one day. ProcessLicenceReturnLogsService will use this to determine which return logs might be
      //    impacted by the change, and look to only reissue or void those that are affected.
      const changeDate = _changeDate(returnVersion.startDate)

      await ProcessLicenceReturnLogsService.go(licence.id, changeDate, returnVersion.endDate, trx)

      // 5) Finally, we have a legacy feature to support. If the reason is because the licence was transferred, we have
      //    to set a flag on those return logs that start prior to the _latest_ 'succession-or-transfer-of-licence'
      //    return versions start date (refer to the DAL for why its the latest). The flag tells the legacy UI to hide
      //    the return logs. They become hidden to all users because they never built a way to display return logs a
      //    previous licence holder.
      if (returnVersion.reason === 'succession-or-transfer-of-licence') {
        await UpdateSucceededReturnLogsDal.go(licence.licenceRef, trx)
      }
    })

    return licence.id
  } catch (error) {
    global.GlobalNotifier.omfg('Failed to create return version', session, error)

    throw error
  }
}

/**
 * The change date is used when processing the existing return logs for the licence. We know when our new return version
 * starts, so our change date becomes this minus one day.
 *
 * ProcessLicenceReturnLogsService will then use this to determine which return logs might be impacted by the change.
 *
 * It doesn't determine the change date, because it is used in a number of scenarios, for example, during the overnight
 * import when a licence is 'ended'. So, it is the responsibility of the services that call it to determine the change
 * date.
 *
 * Using this as a filter helps it avoid reviewing return logs that are not impacted by the change.
 *
 * @private
 */
function _changeDate(startDate) {
  const changeDate = new Date(startDate)

  changeDate.setTime(changeDate.getTime() - ONE_DAY_IN_MILLISECONDS)

  return changeDate
}

/**
 * If this is the first return version for a licence, then the end date should remain null and there is nothing else
 * to do.
 *
 * If this is not the first return version for the licence, we have to work out where this new return version is being
 * added to the history, and the impact that will have on existing return versions.
 *
 * `ProcessExistingReturnVersionsService` has details on the different scenarios we have to cater for, and the impact
 * that will have on existing return versions.
 *
 * But what we need to know, is what end date to apply to the new return version we are creating. If it has the latest
 * start date, it will remain null. But if its been added before an existing return version's start date, it will be
 * the day before that start date.
 *
 * We need to determine this before we persist the return version.
 *
 * @private
 */
async function _processEndDate(returnVersion, licenceId, trx) {
  const { startDate, version } = returnVersion

  if (version > 1) {
    returnVersion.endDate = await ProcessExistingReturnVersionsService.go(licenceId, startDate, trx)
  }
}

module.exports = {
  go
}
