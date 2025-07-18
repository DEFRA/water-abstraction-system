'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/preview-return-forms' page
 *
 * @module PreviewReturnFormsService
 */

const PrepareReturnFormsService = require('./prepare-return-forms.service.js')

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/preview-return-forms' page
 *
 * This service returns the file to be display in the browser. This will likely be the built-in pdf viewer.
 *
 * @param {string} sessionId
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the generated form file as an ArrayBuffer.
 */
async function go(sessionId) {
  return PrepareReturnFormsService.go(sessionId)
}

module.exports = {
  go
}
