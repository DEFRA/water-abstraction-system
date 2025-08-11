'use strict'

/**
 * Formats data for the return form
 * @module PrepareReturnFormsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for the return form
 *
 * The return form has multiple pages and some complex logic / data.
 *
 * Each page will be assigned a corresponding object to isolate the data to each page where possible. Those pages are:
 * - The "cover" page, this is the first page. The address is on this page.
 *
 * @returns {object} - The data formatted for the return form
 */
function go() {
  return {
    address: _address(),
    description: 'mock site',
    dueDate: formatLongDate(new Date('2023-10-01')),
    endDate: formatLongDate(new Date('2023-09-30')),
    licenceRef: '123',
    purpose: 'a purpose',
    regionAndArea: 'A place / in the sun',
    returnRef: '7646',
    startDate: formatLongDate(new Date('2023-09-01')),
    title: _title(),
    twoPartTariff: true,
    formatId: 'format id 123'
  }
}

function _address() {
  return {
    addressLine1: 'Sherlock Holmes',
    addressLine2: '221B Baker Street',
    addressLine3: 'London',
    addressLine4: 'NW1 6XE',
    addressLine5: 'United Kingdom'
  }
}
/*
 * {{ 'Water abstraction daily return ' if frequency === 'day' }}
 * {{ 'Water abstraction weekly return ' if frequency === 'week' }}
 * {{ 'Water abstraction monthly return ' if frequency === 'month' }}
 * {{ 'Water abstraction quarterly return ' if frequency === 'quarter' }}
 * {{ 'Water abstraction yearly return ' if frequency === 'year' }}
 */
function _title() {
  return 'Water abstraction daily return'
}

module.exports = {
  go
}
