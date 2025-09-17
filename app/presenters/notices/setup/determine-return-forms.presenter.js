'use strict'

/**
 * Formats recipients into notifications for a return form
 * @module DetermineReturnFormsPresenter
 */

/**
 * Formats recipients into notifications for a return form
 *
 * The 'pageData' this function receives is used when we create the PDF file. We have updated some of the keys and
 * reduced all the complex logic set i in the view into its presenter. That means the data is not in the shape the
 * legacy code expect. So we need to map this 'pageData' into the legacies expected 'personalisation'
 *
 * @param {{ArrayBuffer}} returnForm - The return forms PDF file
 * @param {object} pageData - The data formatted for the return form
 * @param {string} licenceRef - The reference of the licence that the return log relates to
 * @param {string} referenceCode - the unique generated reference code
 * @param {string} eventId - The event if that joins all the notifications
 *
 * @returns {object} The data formatted persisting as a `notice` record
 */
function go(returnForm, pageData, licenceRef, referenceCode, eventId) {
  return {
    content: returnForm,
    eventId,
    licences: JSON.stringify([licenceRef]),
    messageRef: 'pdf.return_form',
    messageType: 'letter',
    personalisation: _personalisation(pageData),
    reference: referenceCode
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
