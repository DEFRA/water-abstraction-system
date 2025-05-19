'use strict'

/**
 * Orchestrates presenting the data for `/notifications` page
 * @module ViewNoticesService
 */

const FetchNoticesService = require('./fetch-notices.service.js')
const NoticesIndexPresenter = require('../../presenters/notices/index-notices.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Orchestrates presenting the data for `/notices` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the notices page
 */
async function go(yar, page) {
  const filters = _filters(yar)

  const selectedPageNumber = page ? Number(page) : 1

  const { results, total: numberOfNotices } = await FetchNoticesService.go(filters, selectedPageNumber)

  const pageData = await NoticesIndexPresenter.go(results, numberOfNotices)
  const pagination = PaginatorPresenter.go(numberOfNotices, selectedPageNumber, `/system/notices`)
  const pageTitle = _pageTitle(pagination.numberOfPages, selectedPageNumber)

  return {
    activeNavBar: 'manage',
    filters,
    numberOfNotices,
    ...pageData,
    pagination,
    pageTitle
  }
}

function _filters(yar) {
  let openFilter = false

  const savedFilters = yar.get('noticesFilter')

  if (savedFilters) {
    for (const key of Object.keys(savedFilters)) {
      if (key === 'noticeTypes') {
        openFilter = savedFilters[key].length > 0
      } else {
        openFilter = !!savedFilters[key]
      }

      if (openFilter) {
        break
      }
    }
  }

  return {
    fromDate: null,
    noticeTypes: [],
    openFilter,
    sentBy: null,
    toDate: null,
    ...savedFilters
  }
}

function _pageTitle(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return 'Notices'
  }

  return `Notices (page ${selectedPageNumber} of ${numberOfPages})`
}

module.exports = {
  go
}
