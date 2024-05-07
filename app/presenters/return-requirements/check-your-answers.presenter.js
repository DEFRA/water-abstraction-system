'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/check-your-answers` page
 * @module CheckYourAnswersPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

const RETURN_REQUIREMENT_REASONS = {
  'abstraction-below-100-cubic-metres-per-day': 'Abstraction amount below 100 cubic metres per day',
  'change-to-special-agreement': 'Change to special agreement',
  'extension-of-licence-validity': 'Limited extension of licence validity (LEV)',
  'major-change': 'Major change',
  'minor-change': 'Minor change',
  'name-or-address-change': 'Licence holder name or address change',
  'new-licence': 'New licence',
  'new-licence-in-part-succession-or-licence-apportionment': 'New licence in part succession or licence apportionment',
  'new-special-agreement': 'New special agreement',
  'returns-exception': 'Returns exception',
  'succession-or-transfer-of-licence': 'Succession or transfer of licence',
  'succession-to-remainder-licence-or-licence-apportionment': 'Succession to remainder licence or licence apportionment',
  'transfer-and-now-chargeable': 'Licence transferred and now chargeable',
  'transfer-licence': 'Transfer licence'
}

function go (session) {
  const { id: sessionId, journey, licence, note, reason } = session

  return {
    journey,
    licenceRef: licence.licenceRef,
    note: note ? note.content : null,
    pageTitle: `Check the return requirements for ${licence.licenceHolder}`,
    reason: RETURN_REQUIREMENT_REASONS[reason],
    reasonLink: _reasonLink(sessionId, journey),
    sessionId,
    startDate: _startDate(session),
    userEmail: note ? note.userEmail : 'No notes added'
  }
}

function _reasonLink (sessionId, journey) {
  if (journey === 'returns-required') {
    return `/system/return-requirements/${sessionId}/reason`
  }

  return `/system/return-requirements/${sessionId}/no-returns-required`
}

function _startDate (session) {
  const { licence, startDateOptions, startDateDay, startDateMonth, startDateYear } = session

  let date

  if (startDateOptions === 'licenceStartDate') {
    date = new Date(licence.currentVersionStartDate)
  } else {
    date = new Date(`${startDateYear}-${startDateMonth}-${startDateDay}`)
  }

  return formatLongDate(date)
}

module.exports = {
  go
}
