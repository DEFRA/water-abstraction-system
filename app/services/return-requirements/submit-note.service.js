'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/note` page
 * @module SubmitNoteService
 */

const FetchSessionService = require('./fetch-session.service.js')
const NotePresenter = require('../../presenters/return-requirements/note.presenter.js')
const NoteValidator = require('../../validators/return-requirements/note.validator.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/note` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {Object} payload - The submitted form data
 * @param {Object} user - The logged in user details
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} The page data for the check-your-answers page
 */
async function go (sessionId, payload, user, yar) {
  const session = await FetchSessionService.go(sessionId)
  const validationResult = _validate(payload)

  if (!validationResult) {
    const notification = _notification(session, payload.note)
    await _save(session, payload, user)

    if (notification) {
      yar.flash('notification', notification)
    }

    return {
      journey: session.journey
    }
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
  const { note } = session
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

  return session.update()
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
