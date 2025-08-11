'use strict'

/**
 * Formats data for the return form
 * @module PrepareReturnFormsPresenter
 */

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
    cover: _cover()
  }
}

/*
 * The data for the cover page
 */
function _cover() {
  return {
    title: `Water abstraction day return`
  }
}

module.exports = {
  go
}
