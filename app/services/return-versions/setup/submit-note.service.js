'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/note` page
 * @module SubmitNoteService
 */

const NotePresenter = require('../../../presenters/return-versions/setup/note.presenter.js')
const NoteValidator = require('../../../validators/return-versions/setup/note.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/note` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {object} payload - The submitted form data
 * @param {object} user - The logged in user details
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors it returns an empty object else the page data for the note page including the
 * validation error details
 */
async function go (sessionId, payload, user, yar) {
  const session = await SessionModel.query().findById(sessionId)
  const validationResult = _validate(payload)

  if (!validationResult) {
    const notification = _notification(session, payload.note)

    await _save(session, payload, user)

    if (notification) {
      yar.flash('notification', notification)
    }

    return {}
  }

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Add a note',
    ...submittedSessionData
  }
}

function _notification (session, newNote) {
  const { data: { note } } = session
  const text = 'Changes made'

  if (!note && newNote) {
    return {
      text,
      title: 'Added'
    }
  }

  if (note?.content !== newNote) {
    return {
      text,
      title: 'Updated'
    }
  }

  return null
}

async function _save (session, payload, user) {
  session.note = {
    content: payload.note,
    userEmail: user.username
  }

  return session.$update()
}

function _submittedSessionData (session, payload) {
  session.note = payload.note ? payload.note : null

  return NotePresenter.go(session)
}

function _validate (payload) {
  const validation = NoteValidator.go(payload)

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
