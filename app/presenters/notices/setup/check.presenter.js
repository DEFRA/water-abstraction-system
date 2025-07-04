'use strict'

/**
 * Formats data for the `/notices/setup/check` page
 * @module CheckPresenter
 */

const { contactName, contactAddress } = require('../../crm.presenter.js')
const { defaultPageSize } = require('../../../../config/database.config.js')

const NOTIFICATION_TYPES = {
  'abstraction-alert': 'Abstraction alerts',
  'paper-forms': 'Paper invitations',
  invitations: 'Returns invitations',
  reminders: 'Returns reminders'
}

/**
 * Formats data for the `/notices/setup/check` page
 *
 * @param {object[]} recipients - List of recipient objects, each containing recipient details like email or name.
 * @param {number|string} page - The currently selected page
 * @param {object} pagination - The result from `PaginatorPresenter`
 * @param {object} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(recipients, page, pagination, session) {
  const { journey, referenceCode } = session

  return {
    defaultPageSize,
    displayPreviewLink: journey !== 'abstraction-alert' && journey !== 'paper-forms',
    links: _links(session),
    pageTitle: _pageTitle(page, pagination),
    readyToSend: `${NOTIFICATION_TYPES[journey]} are ready to send.`,
    recipients: _recipients(page, recipients, session.id),
    recipientsAmount: recipients.length,
    referenceCode
  }
}

/**
 * Contact can be an email or an address (letter)
 *
 * If it is an address then we convert the contact CSV string to an array. If it is an email we return the email in
 * array for the UI to have consistent formatting.
 *
 * @private
 */
function _contact(recipient) {
  if (recipient.email) {
    return [recipient.email]
  }

  const name = contactName(recipient.contact)
  const address = contactAddress(recipient.contact)

  return [name, ...address]
}

function _formatRecipients(recipients, sessionId) {
  return recipients.map((recipient) => {
    return {
      contact: _contact(recipient),
      licences: recipient.licence_refs.split(','),
      method: `${recipient.message_type} - ${recipient.contact_type}`,
      previewLink: `/system/notices/setup/${sessionId}/preview/${recipient.contact_hash_id}`
    }
  })
}

function _links(session) {
  const { id, journey, licenceRef } = session

  let back
  let removeLicences = ''

  if (licenceRef) {
    back = `/system/notices/setup/${id}/check-notice-type`
  } else if (journey === 'abstraction-alert') {
    back = `/system/notices/setup/${id}/abstraction-alerts/alert-email-address`
  } else {
    back = `/system/notices/setup/${id}/returns-period`
    removeLicences = `/system/notices/setup/${id}/remove-licences`
  }

  return {
    back,
    cancel: `/system/notices/setup/${id}/cancel`,
    download: `/system/notices/setup/${id}/download`,
    removeLicences
  }
}

function _pageTitle(page, pagination) {
  if (pagination.numberOfPages > 1) {
    return `Check the recipients (page ${page} of ${pagination.numberOfPages})`
  }

  return `Check the recipients`
}

/**
 * Due to the complexity of the query we had to use a raw query to get the recipients data. This means we need to handle
 * pagination (which recipients to display based on selected page and page size) in here.
 *
 * @private
 */
function _paginateRecipients(recipients, page) {
  const pageNumber = Number(page) * defaultPageSize

  return recipients.slice(pageNumber - defaultPageSize, pageNumber)
}

/**
 * Sorts, maps, and paginates the recipients list.
 *
 * This function first maps over the recipients to transform each recipient object into a new format, then sorts the
 * resulting array of transformed recipients alphabetically by their contact's name. After sorting, it uses pagination
 * to return only the relevant subset of recipients for the given page.
 *
 * The map and sort are performed before pagination, as it is necessary to have the recipients in a defined order before
 * determining which recipients should appear on the page.
 *
 * @private
 */
function _recipients(page, recipients, sessionId) {
  const formattedRecipients = _formatRecipients(recipients, sessionId)
  const sortedRecipients = _sortRecipients(formattedRecipients)

  return _paginateRecipients(sortedRecipients, page)
}

/**
 * Sorts the recipients alphabetically by their 'contact name'.
 *
 * The contact name is the first element in the recipient's `contact` array. For letter-based recipients this will
 * be either the person or organisation name, and for email recipients this will be the email address.
 *
 * @private
 */
function _sortRecipients(recipients) {
  return recipients.sort((a, b) => {
    if (a.contact[0] < b.contact[0]) {
      return -1
    }

    if (a.contact[0] > b.contact[0]) {
      return 1
    }

    return 0
  })
}

module.exports = {
  go
}
