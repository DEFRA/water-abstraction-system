'use strict'

/**
 * Controller for /bill-runs/setup endpoints
 * @module BillRunsSetupController
 */

const InitiateSessionService = require('../services/bill-runs/setup/initiate-session.service.js')
const RegionService = require('../services/bill-runs/setup/region.service.js')
const SubmitRegionService = require('../services/bill-runs/setup/submit-region.service.js')
const SubmitTypeService = require('../services/bill-runs/setup/submit-type.service.js')
const SubmitYearService = require('../services/bill-runs/setup/submit-year.service.js')
const TypeService = require('../services/bill-runs/setup/type.service.js')
const YearService = require('../services/bill-runs/setup/year.service.js')

async function region (request, h) {
  const { sessionId } = request.params

  const pageData = await RegionService.go(sessionId)

  return h.view('bill-runs/setup/region.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select the region',
    ...pageData
  })
}

async function setup (_request, h) {
  const session = await InitiateSessionService.go()

  return h.redirect(`/system/bill-runs/setup/${session.id}/type`)
}

async function submitRegion (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitRegionService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/region.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'Select a region',
      ...pageData
    })
  }

  if (pageData.setupComplete) {
    return h.redirect(`/system/bill-runs/setup/${sessionId}/generate`)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/year`)
}

async function submitType (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitTypeService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/type.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'Select a bill run type',
      ...pageData
    })
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/region`)
}

async function submitYear (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitYearService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/year.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'Select the financial year',
      ...pageData
    })
  }

  if (pageData.setupComplete) {
    return h.redirect(`/system/bill-runs/setup/${sessionId}/generate`)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/season`)
}

async function type (request, h) {
  const { sessionId } = request.params

  const pageData = await TypeService.go(sessionId)

  return h.view('bill-runs/setup/type.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select a bill run type',
    ...pageData
  })
}

async function year (request, h) {
  const { sessionId } = request.params

  const pageData = await YearService.go(sessionId)

  return h.view('bill-runs/setup/year.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select the financial year',
    ...pageData
  })
}

module.exports = {
  region,
  setup,
  submitRegion,
  submitType,
  submitYear,
  type,
  year
}
