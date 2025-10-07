'use strict'

/**
 * Formats data for the 'notices/{id}' page
 * @module ViewNoticePresenter
 */

const { formatLongDate, titleCase } = require('../base.presenter.js')

const NOTICE_MAPPINGS = {
  'hof-resume': 'HOF resume',
  'hof-stop': 'HOF stop',
  'hof-warning': 'HOF warning',
  paperReturnForms: 'Paper return',
  renewal: 'Renewal',
  returnInvitation: 'Returns invitation',
  returnReminder: 'Returns reminder',
  waterAbstractionAlerts: 'alert'
}

/**
 * Formats data for the 'notices/{id}' page
 *
 * @param {module:EventModel} notice - The notice object
 * @param {module:NotificationModel[]} notifications - The notifications linked to the notice
 * @param {number} totalNumber - The total number of notifications linked to the notice
 * @param {number} selectedPage - The selected page of results
 * @param {number} numberOfPages - The number of pages of results to paginate
 *
 * @returns {object[]} - The data formatted for the view template
 */
function go(notice, notifications, totalNumber, selectedPage, numberOfPages) {
  const tableRows = _formatTableData(notifications)

  return {
    backLink: { href: '/system/notices', text: 'Go back to notices' },
    createdBy: notice.issuer,
    dateCreated: formatLongDate(notice.createdAt),
    notifications: tableRows,
    numberShowing: notifications.length,
    pageTitle: _pageTitle(notice, selectedPage, numberOfPages),
    pageTitleCaption: `Notice ${notice.referenceCode}`,
    reference: notice.referenceCode,
    showingDeclaration: _showingDeclaration(notifications.length, totalNumber),
    status: _status(notice)
  }
}

function _formatTableData(notifications) {
  return notifications.map((notification) => {
    return {
      recipient: _recipient(notification),
      licenceRefs: notification.licences,
      messageType: notification.messageType,
      status: notification.status
    }
  })
}

function _pageTitle(notice, selectedPage, numberOfPages) {
  const { alertType, subtype } = notice

  let title = NOTICE_MAPPINGS[subtype]

  if (alertType) {
    title = `${titleCase(alertType)} alert`
  }

  // NOTE: when there are no results at all numberOfPages will be 0. Hence our test is `< 2` instead of `=== 1`
  if (numberOfPages < 2) {
    return title
  }

  return `${title} (page ${selectedPage} of ${numberOfPages})`
}

function _recipient(notification) {
  const { messageType, personalisation, recipientName } = notification

  if (messageType === 'email') {
    return [recipientName]
  }

  return [
    personalisation['address_line_1'],
    personalisation['address_line_2'],
    personalisation['address_line_3'],
    personalisation['address_line_4'],
    personalisation['address_line_5'],
    personalisation['address_line_6'],
    personalisation['address_line_7'],
    personalisation['postcode']
  ].filter(Boolean)
}

function _showingDeclaration(numberDisplayed, totalNumber) {
  if (totalNumber > numberDisplayed) {
    return `Showing ${numberDisplayed} of ${totalNumber} notifications`
  }

  return `Showing all ${totalNumber} notifications`
}

function _status(notice) {
  const { errorCount, pendingCount, returnedCount } = notice

  if (errorCount > 0) {
    return 'error'
  }

  if (returnedCount > 0) {
    return 'returned'
  }

  if (pendingCount > 0) {
    return 'pending'
  }

  return 'sent'
}

module.exports = {
  go
}
