'use strict'

/**
 * @module DetermineReturnFormsService
 */

const PrepareReturnFormsPresenter = require('../../../presenters/notices/setup/prepare-return-forms.presenter.js')
const PrepareReturnFormsService = require('./prepare-return-forms.service.js')

/**
 * Here
 *
 * @param {string} session - The current session
 * @param {string} recipients - The recipients unique identifier
 *
 * @param eventId
 * @returns {Promise<{}>} - Resolves with
 */
async function go(session, recipients, eventId) {
  const { licenceRef, dueReturns, selectedReturns, referenceCode } = session

  const dueReturnLogs = _dueReturnLog(dueReturns, selectedReturns)

  const notices = []

  for (const dueReturn of dueReturnLogs) {
    for (const recipient of recipients) {
      const returnForm = await PrepareReturnFormsService.go(licenceRef, dueReturn, recipient)

      const pageData = PrepareReturnFormsPresenter.go(licenceRef, dueReturn, recipient)

      notices.push(_notificationPresenter(returnForm, pageData, referenceCode, licenceRef, eventId, dueReturn))
    }
  }

  return notices
}

function _dueReturnLog(dueReturns, selectedReturns) {
  return dueReturns.filter((dueReturn) => {
    return selectedReturns.includes(dueReturn.returnId)
  })
}

function _notificationPresenter(returnForm, pageData, referenceCode, licenceRef, eventId, dueReturn) {
  return {
    // Core
    content: returnForm,
    personalisation: pageData,
    reference: referenceCode,
    licences: JSON.stringify([licenceRef]),
    // Form legacy
    messageRef: 'pdf.return_form',
    messageType: 'letter',
    // metaDate: {
    //   return_id: dueReturn.id
    // },
    // Is return id missing ?
    eventId
  }
}

module.exports = {
  go
}
