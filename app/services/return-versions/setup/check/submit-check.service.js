'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module SubmitCheckService
 */

const GenerateReturnVersionService = require('./generate-return-version.service.js')
const CreateReturnVersionService = require('./create-return-version.service.js')
const ProcessLicenceReturnLogsService = require('../../../return-logs/process-licence-return-logs.service.js')
const SessionModel = require('../../../../models/session.model.js')
const VoidReturnLogsService = require('../../../return-logs/void-return-logs.service.js')
const { db } = require('../../../../../db/db.js')

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

  const newReturnVersion = await CreateReturnVersionService.go(returnVersionData)

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
    await _updateSucceededReturnLogs(session.data.licence.licenceRef)
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
 * a start date less than the latest transferred return version's need to have this set to false.
 *
 * > In theory someone could add a historic return version with the reason 'succession-or-transfer-of-licence', _before_
 * > an existing one. Those new return logs generated still need to be set to `isCurrent=false`, because the rule is
 * > _all_ return logs that start before the _latest_ transferred return version need to be flagged as false.
 * > This is why the update query looks for the latest, rather than uses the start date of the return version being
 * > added.
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
async function _updateSucceededReturnLogs(licenceRef) {
  const bindings = [licenceRef]

  const query = `
    UPDATE public.return_logs rl
    SET
      updated_at = NOW(),
      metadata = jsonb_set(metadata, '{isCurrent}', 'false')
    FROM (
      SELECT DISTINCT ON (rv.licence_id)
        l.licence_ref,
        rv.start_date AS latest_start_date
      FROM
        public.return_versions rv
      INNER JOIN public.licences l
        ON l.id = rv.licence_id
      WHERE
        rv.reason = 'succession-or-transfer-of-licence'
        AND l.licence_ref = ?
      ORDER BY rv.licence_id, rv.start_date DESC
    ) latest
    WHERE
      rl.licence_ref = latest.licence_ref
      AND rl.start_date < latest.latest_start_date;
  `

  await db.raw(query, bindings)
}

module.exports = {
  go
}
