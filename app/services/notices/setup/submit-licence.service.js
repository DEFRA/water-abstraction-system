'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 * @module SubmitLicenceService
 */

const DetermineReturnsPeriodService = require('./determine-returns-period.service.js')
const LicenceModel = require('../../../models/licence.model.js')
const LicencePresenter = require('../../../presenters/notices/setup/licence.presenter.js')
const LicenceValidator = require('../../../validators/notices/setup/licence.validator.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return an the same error.
 * We then fetch all the due returns for the licence.
 * If there are no due returns then we return an error to the user informing them that there are no due returns the
 * licence.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An empty object if there are no errors else the page data for the licence page including
 * the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = await _validate(payload)

  const formattedData = LicencePresenter.go(payload.licenceRef)

  if (validationResult) {
    return {
      activeNavBar: 'manage',
      error: validationResult,
      ...formattedData
    }
  }

  await _save(session, payload)

  return {}
}

/**
 * A licence notification has highlighted an issue with using the returns period dates.
 *
 * This code is intended as a temporary 'fix' to allow single licence returns to use the returns invitations Notify template
 * (which requires the 'determinedReturnsPeriod' dates)
 *
 * This function alters the 'dueDate' by adding 28 days to the current date (this may not be the final state and should be regarded as a
 * placeholder).
 *
 * @private
 */
function _determinedReturnsPeriod() {
  // TODO: Remove this use of DetermineReturnsPeriodService(). A single licence return will use the same Notify template as invitations,
  // but currently it expects period start and end date values to be provided. We don't have these on the single licence
  // returns path so for now are using whatever the current return period is. Once we have confirmation the template has
  // been updated we can drop this call.
  const { returnsPeriod, summer } = DetermineReturnsPeriodService.go('allYear')

  const dueDate = new Date()
  const twentyEightDays = 28

  dueDate.setDate(dueDate.getDate() + twentyEightDays)

  return {
    ...returnsPeriod,
    summer,
    dueDate
  }
}

async function _dueReturnsExist(licenceRef) {
  const dueReturns = await ReturnLogModel.query().where('licenceRef', licenceRef).where('status', 'due').first()

  return !!dueReturns
}

async function _licenceExists(licenceRef) {
  const licence = await LicenceModel.query().where('licenceRef', licenceRef).select('licenceRef').first()

  return !!licence
}

async function _save(session, payload) {
  session.licenceRef = payload.licenceRef

  session.determinedReturnsPeriod = _determinedReturnsPeriod()

  return session.$update()
}

async function _validate(payload) {
  let licenceExists = false
  let dueReturns = false

  if (payload.licenceRef) {
    licenceExists = await _licenceExists(payload.licenceRef)
    dueReturns = await _dueReturnsExist(payload.licenceRef)
  }

  const validation = LicenceValidator.go(payload, licenceExists, dueReturns)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
