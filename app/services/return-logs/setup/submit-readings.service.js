'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module SubmitReadingsService
 */

const ReadingsPresenter = require('../../../presenters/return-logs/setup/readings.presenter.js')
const ReadingsValidator = require('../../../validators/return-logs/setup/readings.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {Promise<object>} If no errors it returns an empty object else the page data for the readings page including
 * the validation error details
 */
async function go(sessionId, payload, yar, yearMonth) {
  const session = await SessionModel.query().findById(sessionId)

  const [requestedYear, requestedMonth] = _determineRequestedYearAndMonth(yearMonth)

  const validationResult = _validate(payload, session, requestedYear, requestedMonth)

  if (!validationResult) {
    await _save(payload, session, requestedYear, requestedMonth)

    const notification = {
      text: 'Readings have been updated',
      title: 'Updated'
    }

    yar.flash('notification', notification)

    return {}
  }

  const pageData = ReadingsPresenter.go(session, yearMonth)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

function _determineRequestedYearAndMonth(yearMonth) {
  // Splitting a string like `2014-0` by the dash gives us an array of strings ['2014', '0']. We chain `.map(Number)` to
  // then create a new array, applying the Number() function to each one. The result is an array of numbers [2014, 0].
  return yearMonth.split('-').map(Number)
}

/**
 * Saves the readings for the specified yearMonth. As the payload will not contain lines where there is no reading
 * entered. We update all the session lines for the specified yearMonth and assign a null reading where it does not
 * exist in the payload. We do this because if a line previously had a reading which was then subsequently removed
 * there would be no entry for that line in the payload. We therefore need to set the reading to null in that situation.
 *
 * @private
 */
async function _save(payload, session, requestedYear, requestedMonth) {
  session.lines.forEach((line) => {
    const endDate = new Date(line.endDate)

    if (endDate.getFullYear() === requestedYear && endDate.getMonth() === requestedMonth) {
      line.reading = payload[line.endDate] ? Number(payload[line.endDate]) : null
    }
  })

  return session.$update()
}

function _validate(payload, session, requestedYear, requestedMonth) {
  // If the payload is empty, we don't need to validate anything
  if (Object.keys(payload).length === 0) {
    return null
  }

  const validation = ReadingsValidator.go(payload, session, requestedYear, requestedMonth)

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
