'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alert/alert-type` page
 *
 * @module AlertTypePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alert/alert-type` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    alertTypeOptions: _alertTypeOptions(),
    backLink: `/system/monitoring-stations/${session.monitoringStationId}`,
    caption: session.monitoringStationName,
    pageTitle: 'Select the type of alert you need to send'
  }
}

function _alertTypeOptions() {
  return [
    {
      value: 'warning',
      text: 'Warning',
      hint: {
        text: 'Tell licence holders they may need to reduce or stop water abstraction soon.'
      }
    },
    {
      value: 'reduce',
      text: 'Reduce',
      hint: {
        text: 'Tell licence holders they can take water at a reduced amount.'
      }
    },
    {
      value: 'stop',
      text: 'Stop',
      hint: {
        text: 'Tell licence holders they must stop taking water.'
      }
    },
    {
      value: 'resume',
      text: 'Resume',
      hint: {
        text: 'Tell licence holders they can take water at the normal amount.'
      }
    }
  ]
}

module.exports = {
  go
}
