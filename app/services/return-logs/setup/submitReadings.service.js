'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module SubmitReadingsService
 */

const ReadingsPresenter = require('../../../presenters/return-logs/setup/readings.presenter.js')
const { returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')
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
  const validationResult = _validate(payload)

  if (!validationResult) {
    const notification = _notification(session.returnsFrequency)

    await _save(session, payload, yearMonth)

    if (notification) {
      yar.flash('notification', notification)
    }

    return {}
  }

  const pageData = ReadingsPresenter.go(session, yearMonth)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

function _determineRequestedYearAndMonth(yearMonth) {
  // Splitting a string like `2014-0` by the dash gives us an array of strings ['2014', '0']. We chain `.map(Number)` to
  // then create a new array, applying the Number() function to each one. The result is an array of numbers [2014, 0].
  return yearMonth.split('-').map(Number)
}

function _notification(returnsFrequency) {
  return {
    text: `A ${returnRequirementFrequencies[returnsFrequency]} reading has been updated`,
    title: 'Updated'
  }
}

async function _save(session, payload, yearMonth) {
  const [requestedYear, requestedMonth] = _determineRequestedYearAndMonth(yearMonth)

  session.lines.forEach((line) => {
    const endDate = new Date(line.endDate)

    if (endDate.getFullYear() === requestedYear && endDate.getMonth() === requestedMonth) {
      line.reading = payload[line.endDate] ?? null
    }
  })

  return session.$update()
}

function _validate(payload) {
  // const validation = ReadingsValidator.go(payload)
  const validation = { error: null } // temporary thang

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
