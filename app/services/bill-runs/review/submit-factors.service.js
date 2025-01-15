'use strict'

/**
 * Handles user submission for the review charge reference factors page
 * @module SubmitFactorsService
 */

const FactorsPresenter = require('../../../presenters/bill-runs/review/factors.presenter.js')
const FactorsValidator = require('../../../validators/bill-runs/review/factors.validator.js')
const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')
const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')

/**
 * Handles user submission for the review charge reference factors page
 *
 * It first validates the payload of the submitted request.
 *
 * If there is no validation error it will save the selected value to the review charge reference then return an empty
 * object. This will indicate to the controller that the submission was successful triggering it to redirect back to the
 * review charge reference page.
 *
 * If there is a validation error it is combined with the output of the presenter to generate the page data needed to
 * re-render the view with an error message.
 *
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference being updated
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An empty object if there are no errors else the page data for the page including the
 * validation error details
 */
async function go(reviewChargeReferenceId, yar, payload) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(reviewChargeReferenceId, payload)
    yar.flash('banner', 'The adjustment factors for this licence have been updated')

    return {}
  }

  const reviewChargeReference = await FetchReviewChargeReferenceService.go(reviewChargeReferenceId)
  const formattedData = FactorsPresenter.go(reviewChargeReference)

  return {
    activeNavBar: 'bill-runs',
    amendedAggregate: payload.amendedAggregate,
    amendedChargeAdjustment: payload.amendedChargeAdjustment,
    error: validationResult,
    ...formattedData
  }
}

async function _save(reviewChargeReferenceId, payload) {
  return ReviewChargeReferenceModel.query().findById(reviewChargeReferenceId).patch(payload)
}

function _validate(payload) {
  const validation = FactorsValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const result = {
    errorList: []
  }

  validation.error.details.forEach((detail) => {
    const href = detail.context.key === 'amendedAggregate' ? '#amended-aggregate' : '#amended-charge-adjustment'

    result.errorList.push({
      href,
      text: detail.message
    })

    result[detail.context.key] = { message: detail.message }
  })

  return result
}

module.exports = {
  go
}
