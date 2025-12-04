'use strict'

/**
 * Returns the previous and next neighbours in an already-sorted array of objects, based on the `id` of the provided
 * anchor object.
 *
 * @module PreviousAndNextPresenter
 */

/**
 * Returns the previous and next neighbours in an already-sorted array of objects, based on the `id` of the provided
 * anchor object.
 *
 * Finds the elements immediately before and after an anchor object (by matching `id`) and returns them as a `{
 * previous, next }` pair for use in presentation layers.
 *
 * This module implements lookup logic only — it does not generate URLs, HTML, or Design System pagination markup.
 *
 * Intended to support previous/next style pagination controls such as those used in the GOV.UK Design System "Options:
 * Previous and Next" pagination example.
 *
 * @param {object[]} arrayOfElements - A pre-sorted array of objects in the order users should navigate. Each object
 * must contain an `id` property at minimum.
 *
 * @param {object} anchorElement - The object used as the anchor position. Must contain an `id` property matching the
 * same shape as array elements.
 *
 * @returns {object} An object containing:
 * - `previous` {Object|null}: The element immediately before the anchor in the array, or `null` if the anchor is the
 * first item or the `id` is not found.
 * - `next` {Object|null}: The element immediately after the anchor in the array, or `null` if the anchor is the last
 * item or the `id` is not found.
 *
 */
function go(arrayOfElements, anchorElement) {
  const index = _indexOfAnchorId(arrayOfElements, anchorElement)

  if (index === -1) {
    return { previous: null, next: null }
  }

  return {
    previous: arrayOfElements[index - 1] ?? null,
    next: arrayOfElements[index + 1] ?? null
  }
}

function _indexOfAnchorId(arrayOfElements, anchorElement) {
  return arrayOfElements.findIndex((element) => {
    return element.id === anchorElement.id
  })
}

module.exports = {
  go
}
