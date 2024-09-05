'use strict'

/**
 * Transforms pagination information into the appropriate pagination component elements
 * @module PaginatorPresenter
 */

const DatabaseConfig = require('../../config/database.config.js')

const SIMPLE_PAGINATOR = 'simple'
const COMPLEX_START_PAGINATOR = 'start'
const COMPLEX_MIDDLE_PAGINATOR = 'middle'
const COMPLEX_END_PAGINATOR = 'end'

/**
 * Transforms pagination information into the appropriate pagination component elements
 *
 * This takes the information provided (number of records and selected page number) and uses it to generate the data
 * needed for the {@link https://design-system.service.gov.uk/components/pagination/ | GDS pagination component}.
 *
 * The pagination component is the thing seen at the bottom of pages which have to display dynamic results, for example,
 * search results or all bill runs. For example,
 *
 *  `<- Previous 1 ... 6 [7] 8 ... 42 Next ->`
 *
 * The first step is to take the number of records and divide them by our page size config (defaults to 25) to determine
 * how many pages are needed. If only 1 page is required (`numberOfRecords` is less then or equal to 25) no pagination
 * is needed and the presenter doesn't generate the component data.
 *
 * If pagination is needed, the next step is to determine the type. This is because the paginator is expected to behave
 * and display differently depending on the number of pages and which page is selected.
 *
 * ## Previous & Next
 *
 * These when displayed will move the selected page forward and backwards by one. However, the design system states
 *
 * > Do not show the previous page link on the first page – and do not show the next page link on the last page.
 *
 * So, one of the things this presenter needs to determine is whether both or just one of the 'previous' and 'next'
 * controls should be displayed.
 *
 * ## Page items
 *
 * The example previously given is for a large page range. It shows 7 'page items'; first, previous, current, next and
 * last plus 2 ellipses for skipped pages. The ellipses are there because we are not expected to show a page item for
 * _every_ page in the range. This is as per the  design system guidance.
 *
 * > show page numbers for: the current page, at least one page immediately before and after the current page, first and
 * > last pages. Use ellipses (…) to replace any skipped pages.
 *
 * It includes a number of examples of ways of implementing this. They are not consistent so it has been left
 * to us to pick one. A control that applies the guidance will have at most 7 items visible. Our approach is to _always_
 * display 7 page items unless there are less than 7 pages. To do this we define pagination types. The first split is
 * 'simple' or 'complex'.
 *
 * ### Simple
 *
 * This applies for any scenario where the number of pages is 7 or less. In this case we simply iterate from 1 up to the
 * number of pages creating a page item for each one. No ellipses are used.
 *
 *  `[1] 2 3 4 5 6 7 Next -->`
 *
 * ### Complex
 *
 * This applies where we have 8 or more pages of results. It means at least one page item we will need to be an
 * ellipsis. The next problem is determining if both should be displayed, or only one and if only one where?
 *
 * To do this we break the complex component down into a further 3 types; start, middle and end. They are determined
 * based on which is the current page.
 *
 * #### Start
 *
 * If the current page is one of the first 4 pages we define the pagination type as 'complex start'. If, for example,
 * the current page is `[2]` and we took the guidance at face value we could have generated the paginator as
 *
 * `<- Previous 1 [2] 3 ... 42 Next ->`
 *
 * This control only displays 5 page items. But once the current page is `[5]` or more we are required to show ellipsis
 * at both ends.
 *
 * `<- Previous 1 ... 4 [5] 6 ... 42 Next ->`
 *
 * Now we're displaying 7 page items. Our approach removes the inconsistency and always shows 7 page items. This means
 * when `[2]` is the current page the paginator will display.
 *
 * `<- Previous 1 [2] 3 4 5 ... 42 Next ->`
 *
 * #### Middle
 *
 * This applies where the current page is greater than 4 and less than the number of pages minus 4 (for example, if the
 * number of pages is 42 this means the current page is greater than 4 and less than 39). If it is we define the
 * pagination type as 'complex middle'.
 *
 * When this is the case the selected page is in the 'middle' and an ellipsis needs to be shown at both ends.
 *
 * `<- Previous 1 ... 4 [5] 6 ... 42 Next ->`
 *
 * ##### End
 *
 * When the current page is one of the last 4 pages we define the pagination type as 'complex end'. If, for example,
 * the number of pages is 42 and the current page is 39 we'll generate the following paginator.
 *
 * `<- Previous 1 ... 38 [39] 40 41 42 Next ->`
 *
 * @param {number} numberOfRecords - the total number of records or results of the thing being paginated
 * @param {number} selectedPageNumber - the page of results selected for viewing
 * @param {string} path - the URL path the paginator should use, for example, `'/system/bill-runs'`
 *
 * @returns {object} if no pagination is needed just the `numberOfPages` is returned else a `component:` property is
 * also included that can be directly passed to the `govukPagination()` in the view.
 */
function go (numberOfRecords, selectedPageNumber, path) {
  const numberOfPages = Math.ceil(numberOfRecords / DatabaseConfig.defaultPageSize)

  if (numberOfPages < 2) {
    return { numberOfPages }
  }

  const component = _component(selectedPageNumber, numberOfPages, path)

  return {
    component,
    numberOfPages
  }
}

function _component (selectedPageNumber, numberOfPages, path) {
  const items = _items(selectedPageNumber, numberOfPages, path)

  const component = { items }

  if (selectedPageNumber !== 1) {
    component.previous = { href: `${path}?page=${selectedPageNumber - 1}` }
  }

  if (selectedPageNumber !== numberOfPages) {
    component.next = { href: `${path}?page=${selectedPageNumber + 1}` }
  }

  return component
}

function _complexPaginatorEnd (selectedPageNumber, numberOfPages, path) {
  const items = []

  items.push(_item(1, selectedPageNumber, path))
  items.push({ ellipsis: true })
  items.push(_item(numberOfPages - 4, selectedPageNumber, path))
  items.push(_item(numberOfPages - 3, selectedPageNumber, path))
  items.push(_item(numberOfPages - 2, selectedPageNumber, path))
  items.push(_item(numberOfPages - 1, selectedPageNumber, path))
  items.push(_item(numberOfPages, selectedPageNumber, path))

  return items
}

function _complexPaginatorMiddle (selectedPageNumber, numberOfPages, path) {
  const items = []

  items.push(_item(1, selectedPageNumber, path))
  items.push({ ellipsis: true })
  items.push(_item(selectedPageNumber - 1, selectedPageNumber, path))
  items.push(_item(selectedPageNumber, selectedPageNumber, path))
  items.push(_item(selectedPageNumber + 1, selectedPageNumber, path))
  items.push({ ellipsis: true })
  items.push(_item(numberOfPages, selectedPageNumber, path))

  return items
}

function _complexPaginatorStart (selectedPageNumber, numberOfPages, path) {
  const items = []

  items.push(_item(1, selectedPageNumber, path))
  items.push(_item(2, selectedPageNumber, path))
  items.push(_item(3, selectedPageNumber, path))
  items.push(_item(4, selectedPageNumber, path))
  items.push(_item(5, selectedPageNumber, path))
  items.push({ ellipsis: true })
  items.push(_item(numberOfPages, selectedPageNumber, path))

  return items
}

function _item (pageNumber, selectedPageNumber, path) {
  return {
    number: pageNumber,
    visuallyHiddenText: `Page ${pageNumber}`,
    href: pageNumber === 1 ? path : `${path}?page=${pageNumber}`,
    current: pageNumber === selectedPageNumber
  }
}

function _items (selectedPageNumber, numberOfPages, path) {
  const paginatorType = _paginatorType(selectedPageNumber, numberOfPages)

  let items

  switch (paginatorType) {
    case COMPLEX_START_PAGINATOR:
      items = _complexPaginatorStart(selectedPageNumber, numberOfPages, path)
      break
    case COMPLEX_MIDDLE_PAGINATOR:
      items = _complexPaginatorMiddle(selectedPageNumber, numberOfPages, path)
      break
    case COMPLEX_END_PAGINATOR:
      items = _complexPaginatorEnd(selectedPageNumber, numberOfPages, path)
      break
    default:
      items = _simplePaginator(selectedPageNumber, numberOfPages, path)
  }

  return items
}

function _paginatorType (selectedPageNumber, numberOfPages) {
  if (numberOfPages <= 7) {
    return SIMPLE_PAGINATOR
  }

  if (selectedPageNumber <= 4) {
    return COMPLEX_START_PAGINATOR
  }

  if (selectedPageNumber >= (numberOfPages - 3)) {
    return COMPLEX_END_PAGINATOR
  }

  return COMPLEX_MIDDLE_PAGINATOR
}

function _simplePaginator (selectedPageNumber, numberOfPages, path) {
  const items = []

  for (let i = 1; i <= numberOfPages; i++) {
    items.push(_item(i, selectedPageNumber, path))
  }

  return items
}

module.exports = {
  go
}
