/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitViewNoticeService
 */

import { formatValidationResult } from '../../presenters/base.presenter.js'
import FetchNoticeService from '../../services/notices/fetch-notice.service.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import ViewNoticePresenter from '../../presenters/notices/view-notice.presenter.js'
import ViewValidator from '../../validators/notices/view.validator.js'
import { clearFilters } from '../../lib/submit-page.lib.js'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 *
 * Users can also opt to clear any filters applied.
 *
 * @param {string} noticeId - The UUID of the selected notice
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} If no errors an empty object signifying the request can be redirected to the view page
 * else the data needed to re-render the page
 */
export default async function submitViewNoticeService(noticeId, payload, yar, page) {
  const filterKey = `noticeFilter-${noticeId}`

  const filterCleared = clearFilters(payload, yar, filterKey)

  if (filterCleared) {
    return {}
  }

  const error = _validate(payload)

  if (!error) {
    _save(payload, yar, filterKey)

    return {}
  }

  // When the page comes from the request via the controller then it will be a string. For consistency we want it as a
  // number

  const savedFilters = _savedFilters(yar, filterKey)

  return _replayView(noticeId, payload, error, page, savedFilters)
}

async function _replayView(noticeId, payload, error, page, savedFilters) {
  const { notice, notifications, totalNumber } = await FetchNoticeService(noticeId, page, savedFilters)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/notices/${notice.id}`,
    notifications.length,
    'notifications'
  )
  const pageData = ViewNoticePresenter(notice, notifications)

  return {
    activeNavBar: 'notices',
    error,
    filters: { ...savedFilters, ...payload },
    ...pageData,
    pagination,
    totalNumber
  }
}

function _save(payload, yar, filterKey) {
  yar.set(filterKey, {
    licence: payload.licence ?? null,
    recipient: payload.recipient ?? null,
    status: payload.status ?? null
  })
}

function _savedFilters(yar, filterKey) {
  return {
    licence: null,
    openFilter: true,
    recipient: null,
    status: null,
    ...yar.get(filterKey)
  }
}

function _validate(payload) {
  const validationResult = ViewValidator(payload)

  return formatValidationResult(validationResult)
}
