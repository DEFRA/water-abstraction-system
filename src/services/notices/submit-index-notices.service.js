/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitIndexNoticesService
 */

import PaginatorPresenter from 'water-abstraction-engine/presenters/paginator.presenter.js'
import { formatValidationResult } from 'water-abstraction-engine/presenters/base.presenter.js'
import { clearFilters, handleOneOptionSelected } from 'water-abstraction-engine/lib/submit-page.lib.js'

import FetchNoticesDal from '../../dal/notices/fetch-notices.dal.js'
import IndexValidator from '../../validators/notices/index.validator.js'
import NoticesIndexPresenter from '../../presenters/notices/index-notices.presenter.js'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 *
 * Users can also opt to clear any filters applied.
 *
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} If no errors an empty object signifying the request can be redirected to the index page
 * else the data needed to re-render the page
 */
export default async function submitIndexNoticesService(payload, yar, auth, page) {
  const filterCleared = clearFilters(payload, yar, 'noticesFilter')

  if (filterCleared) {
    return {}
  }

  handleOneOptionSelected(payload, 'noticeTypes')
  handleOneOptionSelected(payload, 'statuses')

  const error = _validate(payload)

  if (!error) {
    _save(payload, yar)

    return {}
  }

  const savedFilters = _savedFilters(yar)

  return _replayView(payload, error, page, savedFilters, auth)
}

async function _replayView(payload, error, page, savedFilters, auth) {
  const { results: notices, total: totalNumber } = await FetchNoticesDal(savedFilters, page)

  const pagination = PaginatorPresenter(totalNumber, page, `/system/notices`, notices.length, 'notices')

  const pageData = NoticesIndexPresenter(notices, auth)

  return {
    activeNavBar: 'notices',
    error,
    filters: { ...savedFilters, ...payload },
    ...pageData,
    pagination
  }
}

function _save(payload, yar) {
  yar.set('noticesFilter', {
    fromDate: payload.fromDate,
    noticeTypes: payload.noticeTypes,
    reference: payload.reference ?? null,
    sentBy: payload.sentBy ?? null,
    sentFromDay: payload.sentFromDay ?? null,
    sentFromMonth: payload.sentFromMonth ?? null,
    sentFromYear: payload.sentFromYear ?? null,
    sentToDay: payload.sentToDay ?? null,
    sentToMonth: payload.sentToMonth ?? null,
    sentToYear: payload.sentToYear ?? null,
    statuses: payload.statuses,
    toDate: payload.toDate
  })
}

function _savedFilters(yar) {
  return {
    noticeTypes: [],
    openFilter: true,
    reference: null,
    sentBy: null,
    sentFromDay: null,
    sentFromMonth: null,
    sentFromYear: null,
    sentToDay: null,
    sentToMonth: null,
    sentToYear: null,
    statuses: [],
    ...yar.get('noticesFilter')
  }
}

function _validate(payload) {
  const validationResult = IndexValidator(payload)

  return formatValidationResult(validationResult)
}
