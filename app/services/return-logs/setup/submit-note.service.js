/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/note` page
 * @module SubmitNoteService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import NotePresenter from '../../../presenters/return-logs/setup/note.presenter.js'
import NoteValidator from '../../../validators/return-logs/setup/note.validator.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/note` page
 *
 * It first retrieves the session instance for the return log journey in progress.
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
async function go(sessionId, payload, user, yar) {
  const session = await FetchSessionDal.go(sessionId)
  const error = _validate(payload)

  if (!error) {
    const notification = _notification(session, payload.note)

    await _save(session, payload, user)

    if (notification) {
      yar.flash('notification', notification)
    }

    return {}
  }

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    error,
    ...submittedSessionData
  }
}

function _notification(session, newNote) {
  const { note } = session

  if (!note && newNote) {
    return {
      text: 'Note added',
      title: 'Added'
    }
  }

  if (note?.content !== newNote) {
    return {
      text: 'Note updated',
      title: 'Updated'
    }
  }

  return null
}

async function _save(session, payload, user) {
  session.note = {
    content: payload.note,
    userEmail: user.username
  }

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.note = { content: payload.note ? payload.note : null }

  return NotePresenter.go(session)
}

function _validate(payload) {
  const validationResult = NoteValidator.go(payload)

  return formatValidationResult(validationResult)
}

export { go }
export default {
  go
}
