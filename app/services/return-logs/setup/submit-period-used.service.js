'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/period-used` page
 * @module SubmitPeriodUsedService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const AllocateSingleVolumeToLinesService = require('./allocate-single-volume-to-lines.service.js')
const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
const PeriodUsedPresenter = require('../../../presenters/return-logs/setup/period-used.presenter.js')
const PeriodUsedValidator = require('../../../validators/return-logs/setup/period-used.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/period-used` page
 *
 * It first retrieves the session instance for the return log setup session in progress. The session has details about
 * the return log that are needed to validate that the chosen date is valid.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} If no errors the page data for the period-used page else the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload, session)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

/**
 * Calculates the abstraction period dates based on the session details and
 * the submitted data.
 *
 * If the user has chosen to use the default abstraction period, the abstraction
 * period dates are calculated by calling the `DetermineAbstractionPeriodService`
 * with the session details. If the user has entered a custom abstraction period,
 * the abstraction period dates are set to the dates entered by the user.
 *
 * The abstraction period dates are then saved to the session.
 *
 * @param {object} session - The current session
 * @param {object} payload - The submitted form data
 *
 * @private
 */
function _determineAbstractionPeriodDates(session, payload) {
  if (payload.periodDateUsedOptions === 'default') {
    const returnPeriod = { startDate: new Date(session.startDate), endDate: new Date(session.endDate) }

    const abstractionPeriods = DetermineAbstractionPeriodService.go(
      returnPeriod,
      session.periodStartDay,
      session.periodStartMonth,
      session.periodEndDay,
      session.periodEndMonth
    )

    session.toFullDate =
      abstractionPeriods.length === 1
        ? abstractionPeriods[0].endDate.toISOString()
        : abstractionPeriods[1].endDate.toISOString()

    session.fromFullDate = abstractionPeriods[0].startDate.toISOString()
  } else {
    session.fromFullDate = new Date(payload.fromFullDate).toISOString()
    session.toFullDate = new Date(payload.toFullDate).toISOString()
  }
}

async function _save(session, payload) {
  session.periodDateUsedOptions = payload.periodDateUsedOptions
  session.periodUsedFromDay = payload.periodUsedFromDay
  session.periodUsedFromMonth = payload.periodUsedFromMonth
  session.periodUsedFromYear = payload.periodUsedFromYear
  session.periodUsedToDay = payload.periodUsedToDay
  session.periodUsedToMonth = payload.periodUsedToMonth
  session.periodUsedToYear = payload.periodUsedToYear

  _determineAbstractionPeriodDates(session, payload)

  AllocateSingleVolumeToLinesService.go(
    session.lines,
    session.fromFullDate,
    session.toFullDate,
    session.singleVolumeQuantity
  )

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.periodDateUsedOptions = payload.periodDateUsedOptions ?? null
  session.periodUsedFromDay = payload.periodUsedFromDay ?? null
  session.periodUsedFromMonth = payload.periodUsedFromMonth ?? null
  session.periodUsedFromYear = payload.periodUsedFromYear ?? null
  session.periodUsedToDay = payload.periodUsedToDay ?? null
  session.periodUsedToMonth = payload.periodUsedToMonth ?? null
  session.periodUsedToYear = payload.periodUsedToYear ?? null

  return PeriodUsedPresenter.go(session)
}

function _validate(payload, session) {
  const validationResult = PeriodUsedValidator.go(payload, session.startDate, session.endDate)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
