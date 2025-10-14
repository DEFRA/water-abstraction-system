'use strict'

/**
 * Formats data for the 'notices/{id}' page
 * @module ViewNoticePresenter
 */

const { formatLongDate, titleCase } = require('../base.presenter.js')
const { noticeMappings } = require('../../lib/static-lookups.lib.js')

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
    notifications: tableRows,
    numberShowing: notifications.length,
    pageTitle: _pageTitle(notice, selectedPage, numberOfPages),
    pageTitleCaption: `Notice ${notice.referenceCode}`,
    reference: notice.referenceCode,
    sentBy: notice.issuer,
    sentDate: formatLongDate(notice.createdAt),
    showingDeclaration: _showingDeclaration(notifications.length, totalNumber),
    status: notice.overallStatus
  }
}

function _formatTableData(notifications) {
  return notifications.map((notification) => {
    const recipient = _recipient(notification)

    return {
      recipient,
      licenceRefs: notification.licences,
      link: {
        href: `/system/notifications/${notification.id}`,
        hiddenText: `notification for recipient ${recipient[0]}`
      },
      messageType: notification.messageType,
      status: notification.status
    }
  })
}

function _pageTitle(notice, selectedPage, numberOfPages) {
  const { alertType, subtype } = notice

  let title = noticeMappings[subtype]

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

module.exports = {
  go
}
