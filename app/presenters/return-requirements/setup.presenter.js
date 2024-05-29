'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/setup` page
 * @module SetupPresenter
 */

/**
 * Formats data for the `/return-requirements/{sessionId}/setup` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, existingData) {
  const { id: sessionId, licence, setup } = session

  const radioOptions = [{
    value: 'use-abstraction-data',
    text: 'Start by using abstraction data',
    checked: setup === 'use-abstraction-data'
  },
  {
    divider: 'or'
  },
  {
    value: 'set-up-manually',
    text: 'Set up manually',
    checked: setup === 'set-up-manually'
  }]

  if (existingData) {
    radioOptions.splice(1, 0, {
      value: 'use-existing-requirements',
      text: 'Copy existing requirements',
      checked: setup === 'use-existing-requirements'
    })
  }

  return {
    backLink: `/system/return-requirements/${sessionId}/reason`,
    licenceRef: licence.licenceRef,
    radioOptions,
    sessionId,
    setup: setup ?? null
  }
}

module.exports = {
  go
}
