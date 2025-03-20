'use strict'

/**
 * Orchestrates validating the data for `/notifications/setup/{sessionId}/ad-hoc-licence` page
 * @module SubmitAdHocLicenceService
 */

const LicenceModel = require('../../../models/licence.model.js')
const AdHocLicencePresenter = require('../../../presenters/notifications/setup/ad-hoc-licence.presenter.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')
const AdHocLicenceValidator = require('../../../validators/notifications/setup/ad-hoc-licence.validator.js')
const DetermineReturnsPeriodService = require('./determine-returns-period.service.js')

/**
 * Orchestrates validating the data for `/notifications/setup/{sessionId}/ad-hoc-licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return an the same error.
 * We then fetch all the due returns for the licence.
 * If there are no due returns then we return a notification to the user informing them that there are no due returns.
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

  const formattedData = AdHocLicencePresenter.go(payload.licenceRef, session.referenceCode)

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
 * Ad-hoc licence notifications has highlighted an issue with using the returns period dates.
 *
 * This code is intended as a temporary 'fix' to allow ad-hoc returns to use the returns invitations Notify template
 * (which requires the 'determinedReturnsPeriod' dates)
 *
 * This function alters the 'dueDate' by adding 28 days to the current date (this may not be the final state and should be regarded as a
 * placeholder).
 *
 * This also, manually, sets gets the 'startDate' and 'endDate' for 'allYear' which represents the current financial
 * kyear.
 *
 * @private
 */
function _determinedReturnsPeriod() {
  const dueDate = new Date()
  
  dueDate.setDate(dueDate.getDate() + 28)
  
  // TODO: Remove this use of DetermineReturnsPeriodService(). Ad-hoc will use the same Notify template as invitations,
  // but currently it expects period start and end date values to be provided. We don't have these on the ad-hoc journey
  // so for now are using whatever the current return period is. Once we have confirmation the template has been updated
  // we can drop this call. 
  const returnsPeriod = DetermineReturnsPeriodService.go('allYear')

  return {
    dueDate,
    ...returnsPeriod
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

  const validation = AdHocLicenceValidator.go(payload, licenceExists, dueReturns)

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
