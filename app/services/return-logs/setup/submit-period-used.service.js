'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/period-used` page
 * @module SubmitPeriodUsedService
 */

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

async function _save(session, payload) {
  session.periodDateUsedOptions = payload.periodDateUsedOptions
  session.fromFullDate = payload.fromFullDate
  session.toFullDate = payload.toFullDate
  session.periodUsedFromDay = payload['period-used-from-day']
  session.periodUsedFromMonth = payload['period-used-from-month']
  session.periodUsedFromYear = payload['period-used-from-year']
  session.periodUsedToDay = payload['period-used-to-day']
  session.periodUsedToMonth = payload['period-used-to-month']
  session.periodUsedToYear = payload['period-used-to-year']

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
