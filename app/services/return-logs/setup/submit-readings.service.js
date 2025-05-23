'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module SubmitReadingsService
 */

const GeneralLib = require('../../../lib/general.lib.js')
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

  const validationResult = _validate(payload, requestedYear, requestedMonth, session)

  if (!validationResult) {
    await _save(payload, session, requestedYear, requestedMonth)

    GeneralLib.flashNotification(yar, 'Updated', 'Readings have been updated')

    return {}
  }

  _addValidationResultToSession(payload, session, requestedYear, requestedMonth, validationResult)

  const formattedData = ReadingsPresenter.go(session, yearMonth)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

function _addValidationResultToSession(payload, session, requestedYear, requestedMonth, validationResult) {
  session.lines.forEach((line) => {
    const endDate = new Date(line.endDate)

    if (endDate.getFullYear() === requestedYear && endDate.getMonth() === requestedMonth) {
      // Unlike when the session is saved, we do not convert the reading to a number here. This is because we want to
      // return what was submitted in the payload to the view following failed validation, which could be a string
      line.reading = payload[line.endDate] ?? null
      line.error = _lineError(line, validationResult)
    }
  })
}

function _determineRequestedYearAndMonth(yearMonth) {
  // Splitting a string like `2014-0` by the dash gives us an array of strings ['2014', '0']. We chain `.map(Number)` to
  // then create a new array, applying the Number() function to each one. The result is an array of numbers [2014, 0].
  return yearMonth.split('-').map(Number)
}

function _lineError(line, validationResult) {
  const error = validationResult.find((validationError) => {
    return validationError.href === `#${line.endDate}`
  })

  if (error) {
    return error.text
  }

  return null
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
      // The readings are always in text format in the payload so we convert to a number before updating the session
      line.reading = payload[line.endDate] ? Number(payload[line.endDate]) : null
    }
  })

  return session.$update()
}

function _validate(payload, requestedYear, requestedMonth, session) {
  // If the payload is empty, we don't need to validate anything
  if (Object.keys(payload).length === 0) {
    return null
  }

  const validation = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

  if (!validation.error) {
    return null
  }

  return validation.error.details.map((error) => {
    return {
      text: error.message,
      href: `#${error.path[0]}`
    }
  })
}

module.exports = {
  go
}
