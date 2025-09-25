'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/period-used` page
 * @module SubmitPeriodUsedService
 */

const AllocateSingleVolumeToLinesService = require('./allocate-single-volume-to-lines.service.js')
const AbstractionPeriodLib = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
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

  const formattedData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

/**
 * Calculates the abstraction period dates based on the session details and the submitted data.
 *
 * If the user has chosen to use the default abstraction period, the abstraction period dates are calculated by calling
 * the `AbstractionPeriodLib#determineAbstractionPeriods` function with the session details. If the user has entered a
 * custom abstraction period, the abstraction period dates are set to the dates entered by the user.
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

    const abstractionPeriods = AbstractionPeriodLib.determineAbstractionPeriods(
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
    session.fromFullDate = payload.fromFullDate.toISOString()
    session.toFullDate = payload.toFullDate.toISOString()
  }
}

async function _save(session, payload) {
  session.periodDateUsedOptions = payload.periodDateUsedOptions
  session.periodUsedFromDay = payload['period-used-from-day']
  session.periodUsedFromMonth = payload['period-used-from-month']
  session.periodUsedFromYear = payload['period-used-from-year']
  session.periodUsedToDay = payload['period-used-to-day']
  session.periodUsedToMonth = payload['period-used-to-month']
  session.periodUsedToYear = payload['period-used-to-year']

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
  session.periodUsedFromDay = payload['period-used-from-day'] ?? null
  session.periodUsedFromMonth = payload['period-used-from-month'] ?? null
  session.periodUsedFromYear = payload['period-used-from-year'] ?? null
  session.periodUsedToDay = payload['period-used-to-day'] ?? null
  session.periodUsedToMonth = payload['period-used-to-month'] ?? null
  session.periodUsedToYear = payload['period-used-to-year'] ?? null

  return PeriodUsedPresenter.go(session)
}

function _validate(payload, session) {
  const { startDate, endDate } = session

  const validation = PeriodUsedValidator.go(payload, startDate, endDate)

  if (!validation.error) {
    return null
  }

  const result = {
    errorList: []
  }

  validation.error.details.forEach((detail) => {
    let href

    if (detail.context.key === 'fromFullDate') {
      href = '#from-full-date'
    } else if (detail.context.key === 'toFullDate') {
      href = '#to-full-date'
    } else {
      href = '#period-date-used-options'
    }

    result.errorList.push({
      href,
      text: detail.message
    })

    result[detail.context.key] = { message: detail.message }
  })

  return result
}

module.exports = {
  go
}
