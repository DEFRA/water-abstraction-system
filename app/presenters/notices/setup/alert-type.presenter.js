'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @module AlertTypePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-type` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    alertTypeOptions: _alertTypeOptions(session.alertType),
    backLink: { href: `/system/monitoring-stations/${session.monitoringStationId}`, text: 'Back' },
    pageTitle: 'Select the type of alert you need to send',
    pageTitleCaption: session.monitoringStationName
  }
}

function _alertTypeOptions(alertType) {
  return [
    {
      checked: alertType === 'warning',
      value: 'warning',
      text: 'Warning',
      hint: {
        text: 'Tell licence holders they may need to reduce or stop water abstraction soon.'
      }
    },
    {
      checked: alertType === 'reduce',
      value: 'reduce',
      text: 'Reduce',
      hint: {
        text: 'Tell licence holders they can take water at a reduced amount.'
      }
    },
    {
      checked: alertType === 'stop',
      value: 'stop',
      text: 'Stop',
      hint: {
        text: 'Tell licence holders they must stop taking water.'
      }
    },
    {
      checked: alertType === 'resume',
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
