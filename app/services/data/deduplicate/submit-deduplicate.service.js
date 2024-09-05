'use strict'

/**
 * Handles the user submission for the `/data/deduplicate` page
 * @module SubmitDeduplicateService
 */

const DeDuplicateService = require('./de-duplicate-licence.service.js')

/**
 * Handles the user submission for the `/data/deduplicate` page
 *
 * It will first validate that the user has entered a reference. If they haven't we return an error that can be used by
 * the Nunjucks view to let the user know.
 *
 * If they have we first parse it, removing any whitespace and converting any lowercase characters to uppercase. This
 * parsed reference is then passed to the `DeDuplicateService` to do the actual removal of the duplicate licence.
 *
 * Once complete we return the parsed reference back to the controller. As a handy way of confirming if it worked the
 * controller will redirect the user to the search page and have it search for the licence reference. If the tool has
 * done its job the page should no longer error.
 *
 * @returns {Promise<object>} an object containing a parsed version of the licence reference submitted else an error
 * message if nothing was entered
 */
async function go (payload) {
  const licenceRef = payload['licence-ref']

  if (!licenceRef || licenceRef.trim() === '') {
    return {
      error: {
        text: 'Enter a licence reference to de-dupe'
      }
    }
  }

  const parsedLicenceRef = licenceRef.trim().toUpperCase()

  await DeDuplicateService.go(parsedLicenceRef)

  return {
    licenceRef: parsedLicenceRef
  }
}

module.exports = {
  go
}
