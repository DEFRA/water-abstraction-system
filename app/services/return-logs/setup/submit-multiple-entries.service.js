'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/multiple-entries` page
 * @module SubmitMultipleEntriesService
 */

const GeneralLib = require('../../../lib/general.lib.js')
const MultipleEntriesPresenter = require('../../../presenters/return-logs/setup/multiple-entries.presenter.js')
const MultipleEntriesValidator = require('../../../validators/return-logs/setup/multiple-entries.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/multiple-entries` page
 *
 * It first retrieves the session instance for the return log journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors it returns an empty object else the page data for the multiple entries page
 * including the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const measurementType = session.reported === 'abstraction-volumes' ? 'volumes' : 'meter readings'
  const frequency = _frequency(session.returnsFrequency)

  const validationResult = _validate(frequency, measurementType, payload, session)

  if (!validationResult) {
    await _save(session, payload)

    yar.flash('notification', {
      text: `${session.lines.length} ${frequency} ${measurementType} have been updated`,
      title: 'Updated'
    })

    return {}
  }

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...submittedSessionData
  }
}

function _frequency(returnsFrequency) {
  if (returnsFrequency === 'day') {
    return 'daily'
  } else if (returnsFrequency === 'week') {
    return 'weekly'
  } else if (returnsFrequency === 'month') {
    return 'monthly'
  }
}

async function _save(session, payload) {
  session.multipleEntries = payload.multipleEntries
  session.formattedEntries = payload.formattedEntries

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.multipleEntries = payload.multipleEntries ?? null

  return MultipleEntriesPresenter.go(session)
}

function _validate(frequency, measurementType, payload, session) {
  const { lines, startReading } = session
  const validation = MultipleEntriesValidator.go(frequency, lines.length, measurementType, payload, startReading)

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
