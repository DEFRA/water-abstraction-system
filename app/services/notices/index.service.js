'use strict'

/**
 * Orchestrates presenting the data for `/notices` page
 * @module NoticeIndexService
 */

/**
 * Orchestrates presenting the data for `/notices` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the notices page
 */
async function go(yar, page) {}

module.exports = {
  go
}
