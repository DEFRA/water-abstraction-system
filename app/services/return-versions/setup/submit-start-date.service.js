'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/start-date` page
 * @module StartDateService
 */

const { isQuarterlyReturnSubmissions } = require('../../../lib/dates.lib.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const DetermineRelevantLicenceVersionService = require('./determine-relevant-licence-version.service.js')
const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')
const StartDatePresenter = require('../../../presenters/return-versions/setup/start-date.presenter.js')
const StartDateValidator = require('../../../validators/return-versions/setup/start-date.validator.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/start-date` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress. The session has details
 * about the licence that are needed to validate that the chosen date is valid.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * It is also responsible for determining which licence version is relevant to the start date submitted by the user,
 * and assigning it to the session. This will then be used throughout the rest of the journey to extract abstraction
 * data from.
 *
 * If the user returns to this page from "check your answers", and by selecting a different start date causes the
 * relevant licence version to be different, it also has to reset the session data so the user starts again with
 * appropriate abstraction data for the start date they have selected.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors 2 flags that determine whether the user is returned to the check page or the
 * next page in the journey else the page data for the start date page including the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const { endDate, startDate } = session.licence
  const validationResult = _validate(payload, startDate, endDate)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Return version updated')
    }

    return {
      checkPageVisited: session.checkPageVisited,
      journey: session.journey
    }
  }

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...submittedSessionData
  }
}

/**
 * Default Quarterly Returns
 *
 * When a return version is for a water company and the start date is for quarterly returns.
 *
 * We need to default the quarterly returns to true.
 *
 * However, we only want to do this on the initial setting of the start date after that it is in the users control.
 *
 * @param {SessionModel} session
 *
 * @private
 */
function _defaultQuarterlyReturns(session) {
  if (
    !session.checkPageVisited &&
    isQuarterlyReturnSubmissions(session.returnVersionStartDate) &&
    session.licence.waterUndertaker
  ) {
    session.quarterlyReturns = true
  }
}

async function _relevantLicenceVersion(session, previousStartDate) {
  // NOTE: For date comparisons you cannot use !== with just the date values. Using < or > will coerce the values into
  // numbers for comparison. But equality operators are checking that the two operands are referring to the same Object.
  // So, where we have matching dates and expect !== to return 'false' we get 'true' instead.
  // Thanks to https://stackoverflow.com/a/493018/6117745 for explaining the problem and providing the solution
  if (previousStartDate && previousStartDate.getTime() === session.returnVersionStartDate.getTime()) {
    // In this scenario we are handling where a user has come back to the start date page, but not change anything.
    // In this case there is no point fetching the licence version (it'll be the same result).
    return
  }

  // Fetch and assign the relevant licence version to the session.
  const relevantLicenceVersion = await DetermineRelevantLicenceVersionService.go(session)

  if (!session.licenceVersion) {
    // In this scenario licenceVersion was not set, which means it must be our first visit to the page. In which case
    // we set the property in the session (it will be persisted in `_save()`) and stop work here.
    session.licenceVersion = relevantLicenceVersion

    return
  }

  if (session.licenceVersion && session.licenceVersion.id === relevantLicenceVersion.id) {
    // In this scenario we are handling where a use has come back to the start date page, changed the start date but
    // the relevant licence version is still the same. In this case we don't change anything and stop work here.

    return
  }

  // If we are here, its because a user has come back to the start date page, changed the start date, and this has
  // resulted in a different relevant licence version being determined. This means we have to force the user to start
  // again, and clear out whatever they previously did
  delete session.method

  session.checkPageVisited = false
  session.requirements = [{}]
  session.licenceVersion = relevantLicenceVersion
}

async function _save(session, payload) {
  // If the user has returned to this page, we need what start date they entered previously so we can determine if
  // they actually changed it, or came from the check page accidentality and immediately hit 'Continue'
  const previousStartDate = session.returnVersionStartDate ? new Date(session.returnVersionStartDate) : null
  const selectedOption = payload.startDateOptions

  session.startDateOptions = selectedOption

  if (selectedOption === 'anotherStartDate') {
    session.startDateDay = payload.startDateDay
    session.startDateMonth = payload.startDateMonth
    session.startDateYear = payload.startDateYear
    session.returnVersionStartDate = new Date(
      `${payload.startDateYear}-${payload.startDateMonth}-${payload.startDateDay}`
    )
  } else {
    session.returnVersionStartDate = new Date(session.licence.currentVersionStartDate)
  }

  await _relevantLicenceVersion(session, previousStartDate)
  _defaultQuarterlyReturns(session)

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.startDateDay = payload.startDateDay ? payload.startDateDay : null
  session.startDateMonth = payload.startDateMonth ? payload.startDateMonth : null
  session.startDateYear = payload.startDateYear ? payload.startDateYear : null
  session.startDateOptions = payload.startDateOptions ? payload.startDateOptions : null

  return StartDatePresenter.go(session, payload)
}

function _validate(payload, licenceStartDate, licenceEndDate) {
  const validation = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
