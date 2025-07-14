'use strict'

const NotifyPreviewRequest = require('../../../requests/notify/notify-preview.request.js')
const NotifyLetterRequest = require('../../../requests/notify/notify-letter.request.js')

const { notifyTemplates } = require('../../../lib/notify-templates.lib.js')

/**
 * Confirms if an address is Notify valid by attempting to preview an ad-hoc returns invitation with it
 *
 * @param {object} payload - payload from the request containing the address lines to validate
 *
 * @returns {Promise<object>}
 */
async function go(payload) {
  const options = {
    personalisation: {
      name: payload.address_line_1,
      returnDueDate: new Date(),
      ...payload
    }
  }

  const preview = await _preview(options)
  const send = await _send(options)

  return { preview, send }
}

async function _preview(options) {
  const { errors } = await NotifyPreviewRequest.send(
    notifyTemplates.adhoc.invitations.licenceHolderLetter,
    options.personalisation
  )

  if (errors) {
    return 'error'
  } else {
    return 'success'
  }
}

async function _send(options) {
  const result = await NotifyLetterRequest.send(notifyTemplates.adhoc.invitations.licenceHolderLetter, options)

  return result.errors ? { message: result.message, errors: result.errors } : result.statusText
}

module.exports = {
  go
}
