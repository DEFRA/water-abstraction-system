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
export default function alertTypePresenter(session) {
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
      hint: {
        text: 'Tell licence holders they may need to reduce or stop water abstraction soon.'
      },
      text: 'Warning',
      value: 'warning'
    },
    {
      checked: alertType === 'reduce',
      hint: {
        text: 'Tell licence holders they can take water at a reduced amount.'
      },
      text: 'Reduce',
      value: 'reduce'
    },
    {
      checked: alertType === 'stop',
      hint: {
        text: 'Tell licence holders they must stop taking water.'
      },
      text: 'Stop',
      value: 'stop'
    },
    {
      checked: alertType === 'resume',
      hint: {
        text: 'Tell licence holders they can take water at the normal amount.'
      },
      text: 'Resume',
      value: 'resume'
    }
  ]
}
