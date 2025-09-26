'use strict'

/**
 * Formats recipients into notifications for a return form
 * @module ReturnFormsNotificationPresenter
 */

/**
 * Formats recipients into notifications for a return form
 *
 * The 'pageData' is the result of the presenter used when creating the PDF file. It uses different keys, and returns
 * different values specific to creating the file. We cannot just save its 'personalisation' to the DB as it differs
 * from what the legacy code persisted and uses. So, we use this presenter to map that output to what is needed when
 * saving the notification.
 *
 * @param {{ArrayBuffer}} returnForm - The return forms PDF file
 * @param {object} pageData - The data formatted for the return form
 * @param {string} licenceRef - The reference of the licence that the return log relates to
 * @param {string} eventId - The event if that joins all the notifications
 *
 * @returns {object} The data formatted persisting as a `notice` record
 */
function go(returnForm, pageData, licenceRef, eventId) {
  return {
    pdf: returnForm,
    eventId,
    licences: [licenceRef],
    messageRef: 'pdf.return_form',
    messageType: 'letter',
    personalisation: _personalisation(pageData),
    returnLogIds: [pageData.returnId]
  }
}

function _personalisation(pageData) {
  const {
    address,
    dueDate,
    endDate,
    licenceRef,
    naldAreaCode,
    purpose,
    regionCode,
    returnLogId,
    returnReference,
    returnsFrequency,
    siteDescription,
    startDate,
    twoPartTariff
  } = pageData

  return {
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2,
    address_line_3: address.address_line_3,
    address_line_4: address.address_line_4,
    address_line_5: address.address_line_5,
    address_line_6: address.address_line_6,
    address_line_7: address.address_line_7,
    due_date: dueDate,
    end_date: endDate,
    format_id: returnReference,
    is_two_part_tariff: twoPartTariff,
    licence_ref: licenceRef,
    naldAreaCode,
    purpose,
    qr_url: returnLogId,
    region_code: regionCode,
    returns_frequency: returnsFrequency,
    site_description: siteDescription,
    start_date: startDate
  }
}

module.exports = {
  go
}
