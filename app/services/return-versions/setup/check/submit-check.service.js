'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module SubmitCheckService
 */

const CheckPresenter = require('../../../../presenters/return-versions/setup/check/check.presenter.js')
const CheckValidation = require('../../../../validators/return-versions/setup/check/check.validator.js')
const FetchPointsService = require('../fetch-points.service.js')
const GenerateReturnVersionService = require('./generate-return-version.service.js')
const PersistReturnVersionService = require('./persist-return-version.service.js')
const ProcessLicenceReturnLogsService = require('../../../return-logs/process-licence-return-logs.service.js')
const ReturnRequirementsPresenter = require('../../../../presenters/return-versions/setup/check/returns-requirements.presenter.js')
const SessionModel = require('../../../../models/session.model.js')
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
 * @returns {Promise<object>} An object containing the licenceId if there are no errors else the page data for the
 * check page including the validation error details
 */
async function go(sessionId, userId) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(session)

  if (!validationResult) {
    const returnVersionData = await GenerateReturnVersionService.go(session.data, userId)

    await PersistReturnVersionService.go(returnVersionData)

    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const changeDate = new Date(returnVersionData.returnVersion.startDate)
    changeDate.setTime(changeDate.getTime() - oneDayInMilliseconds)

    if (session.data.journey === 'no-returns-required') {
      await VoidReturnLogsService.go(
        session.data.licence.licenceRef,
        returnVersionData.returnVersion.startDate,
        returnVersionData.returnVersion.endDate
      )
    }

    await ProcessLicenceReturnLogsService.go(returnVersionData.returnVersion.licenceId, changeDate)

    await SessionModel.query().deleteById(sessionId)

    return { licenceId: session.licence.id }
  }

  const returnRequirements = await _returnRequirements(session)
  const submittedSessionData = CheckPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...returnRequirements,
    ...submittedSessionData
  }
}

async function _returnRequirements(session) {
  const { licence, requirements, journey } = session

  const points = await FetchPointsService.go(licence.id)

  return ReturnRequirementsPresenter.go(requirements, points, journey)
}

function _validate(session) {
  const { requirements, quarterlyReturns } = session

  if (!quarterlyReturns) {
    return null
  }

  const validation = CheckValidation.go(requirements)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
