'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module SubmitCheckService
 */

const GenerateReturnVersionService = require('./generate-return-version.service.js')
const PersistReturnVersionService = require('./persist-return-version.service.js')
const ProcessLicenceReturnLogsService = require('../../../return-logs/process-licence-return-logs.service.js')
const SessionModel = require('../../../../models/session.model.js')
const VoidReturnLogsService = require('../../../return-logs/void-return-logs.service.js')
const { db } = require('../../../../../db/db.js')
const { timestampForPostgres } = require('../../../../lib/general.lib.js')

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
  const session = await SessionModel.query().findById(sessionId)

  await _processReturnVersion(session, userId)

  await SessionModel.query().deleteById(sessionId)

  return session.licence.id
}

async function _processReturnVersion(session, userId) {
  const returnVersionData = await GenerateReturnVersionService.go(session.data, userId)

  const newReturnVersion = await PersistReturnVersionService.go(returnVersionData)

  const changeDate = new Date(newReturnVersion.startDate)
  changeDate.setTime(changeDate.getTime() - ONE_DAY_IN_MILLISECONDS)

  if (session.data.journey === 'no-returns-required') {
    await VoidReturnLogsService.go(
      session.data.licence.licenceRef,
      newReturnVersion.startDate,
      newReturnVersion.endDate
    )
  }

  await ProcessLicenceReturnLogsService.go(newReturnVersion.licenceId, changeDate, newReturnVersion.endDate)

  if (newReturnVersion.reason === 'succession-or-transfer-of-licence') {
    await _updateSucceededReturnLogs(session.data.licence.licenceRef, newReturnVersion.startDate)
  }
}

/**
 * Update existing return logs to isCurrent=false when a new succeeded or transferred return version is added
 *
 * If the new return version was created because of a succession or transfer of the licence there is a flag
 * (`metadata.isCurrent`) on the existing return logs we need to set to false.
 *
 * The external site filters out any return logs where `isCurrent=false`. The intent is that when a licence is
 * transferred, the new licensee should not be able to see previous return logs. The crude solution the previous team
 * came up with is to use a flag. Whilst `isCurrent=true` return logs can be seen in the external UI.
 *
 * When a new return version with the reason 'succession-or-transfer-of-licence' is added all existing return logs with
 * a start date less than the return version's need to have this set to false.
 *
 * Its crude, because it also means the the previous licensee can no longer see them. Only internal users can view and
 * manage them.
 *
 * > This service was added as a 'fix', when we finally realised what `isCurrent` is used for and how it should be set.
 * > We aim to come back and resolve how access to licence and returns information is handled for external users in the
 * > future.
 *
 * @private
 */
async function _updateSucceededReturnLogs(licenceRef, startDate) {
  const bindings = [timestampForPostgres(), licenceRef, startDate]

  const query = `
    UPDATE public.return_logs rl
    SET
      updated_at = ?,
      metadata = jsonb_set(metadata, '{isCurrent}', 'false')
    WHERE
      rl.licence_ref = ?
      AND rl.start_date < ?;
  `

  await db.raw(query, bindings)
}

module.exports = {
  go
}
