/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/multiple-entries` page
 * @module SubmitMultipleEntriesService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import MultipleEntriesPresenter from '../../../presenters/return-logs/setup/multiple-entries.presenter.js'
import MultipleEntriesValidator from '../../../validators/return-logs/setup/multiple-entries.validator.js'
import SplitMultipleEntriesService from '../../../services/return-logs/setup/split-multiple-entries.service.js'
import { convertFromCubicMetres, convertToCubicMetres } from '../../../lib/general.lib.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { returnRequirementFrequencies } from '../../../lib/static-lookups.lib.js'

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
export default async function submitMultipleEntriesService(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const measurementType = session.reported === 'abstractionVolumes' ? 'volumes' : 'meter readings'
  const frequency = returnRequirementFrequencies[session.returnsFrequency]

  const _payload = { multipleEntries: SplitMultipleEntriesService(payload.multipleEntries) }

  const error = _validate(frequency, measurementType, _payload, session)

  if (!error) {
    await _save(session, _payload)

    yar.flash('notification', {
      text: `${session.lines.length} ${frequency} ${measurementType} have been updated`,
      title: 'Updated'
    })

    return {}
  }

  const pageData = _submittedSessionData(session, payload)

  return {
    error,
    ...pageData
  }
}

async function _save(session, payload) {
  session.lines.forEach((line, index) => {
    if (session.reported === 'abstractionVolumes') {
      line.quantityCubicMetres = convertToCubicMetres(payload.multipleEntries[index], session.unitSymbol)
      line.quantity = convertFromCubicMetres(line.quantityCubicMetres, session.unitSymbol)
    } else {
      line.reading = payload.multipleEntries[index]
    }
  })

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.multipleEntries = payload.multipleEntries ?? null

  return MultipleEntriesPresenter(session)
}

function _validate(frequency, measurementType, payload, session) {
  const { lines, startReading } = session
  const validationResult = MultipleEntriesValidator(frequency, lines.length, measurementType, payload, startReading)

  return formatValidationResult(validationResult)
}
