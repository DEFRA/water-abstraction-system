'use strict'

/**
 * Transforms an array of object into the previous and next pagination objects
 *
 * https://design-system.service.gov.uk/components/pagination/#options-pagination-example--next:~:text=For%20navigating%20between%20content%20pages
 *
 * @module PaginatorPreviousAndNextPresenter
 */

/**
 * Returns the next and previous element base on the id in the arrays order
 *
 * @param {Array} arrayOfElements - a sorted array of objects, with an id as minimum
 * @param {string} elementAnchorId - a UUID to use as the position in the array
 *
 * @returns {object} an object containing the 'next' and 'previous' items
 */
function go(arrayOfElements, elementAnchorId) {
  const index = arrayOfElements
    .map((element) => {
      return element.id
    })
    .indexOf(elementAnchorId)

  const previous = index >= 0 ? (arrayOfElements[index - 1] ?? null) : null
  const next = index >= 0 ? (arrayOfElements[index + 1] ?? null) : null

  return {
    previous,
    next
  }
}

module.exports = {
  go
}
