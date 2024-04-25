'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/add-note` page
 * @module SubmitAddNoteService
 */

const AddNotePresenter = require('../../presenters/return-requirements/add-note.presenter.js')
const AddNoteValidator = require('../../validators/return-requirements/add-note.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/add-note` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {Object} payload - The submitted form data
 * @param {Object} user - The logged in user details
 *
 * @returns {Promise<Object>} The page data for the check-your-answers page
 */
async function go (sessionId, payload, user) {
  const session = await SessionModel.query().findById(sessionId)
  const validationResult = _validate(payload)

  if (!validationResult) {
    const notification = _notification(session, payload.note)
    await _save(session, payload, user)

    return {
      notification
    }
  }

  const formattedData = AddNotePresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Add a note',
    ...formattedData
  }
}

async function _save (session, payload, user) {
  const currentData = session.data

  currentData.note = {
    content: payload.note,
    userEmail: user.username
  }

  return session.$query().patch({ data: currentData })
}

function _validate (payload) {
  const validation = AddNoteValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

function _notification (session, newNote) {
  const { data: { note } } = session

  if (note && note.content === newNote) {
    return ''
  }

  if (!note && newNote) {
    return {
      title: 'Added',
      text: 'Changes made'
    }
  }

  if (note && note.content !== newNote) {
    return {
      title: 'Updated',
      text: 'Changes made'
    }
  }

  return ''
}

module.exports = {
  go
}
