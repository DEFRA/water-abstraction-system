'use strict'

/**
 * Controller for /bill-runs/create endpoints
 * @module BillRunsCreateController
 */

const Boom = require('@hapi/boom')

const ExistsService = require('../services/bill-runs/create/exists.service.js')
const InitiateSessionService = require('../services/bill-runs/create/initiate-session.service.js')
const GenerateService = require('../services/bill-runs/create/generate.service.js')
const RegionService = require('../services/bill-runs/create/region.service.js')
const SeasonService = require('../services/bill-runs/create/season.service.js')
const TypeService = require('../services/bill-runs/create/type.service.js')
const SubmitRegionService = require('../services/bill-runs/create/submit-region.service.js')
const SubmitSeasonService = require('../services/bill-runs/create/submit-season.service.js')
const SubmitTypeService = require('../services/bill-runs/create/submit-type.service.js')
const SubmitYearService = require('../services/bill-runs/create/submit-year.service.js')
const YearService = require('../services/bill-runs/create/year.service.js')

async function create (_request, h) {
  const session = await InitiateSessionService.go()

  return h.redirect(`/system/bill-runs/create/${session.id}/type`)
}

async function generate (request, h) {
  const { sessionId } = request.params

  const results = await ExistsService.go(sessionId)

  // If the results includes a pageData property it's because `ExistsService` found a match and so has formatted page
  // data for the `/exists` page. We direct there and don't generate a bill run
  if (results.pageData) {
    return h.view('bill-runs/create/exists.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'This bill run already exists',
      ...results.pageData
    })
  }

  // If we get here then we are go for launch!
  try {
    await GenerateService.go(request.auth.credentials.user, results)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }

  return h.redirect('/billing/batch/list')
}

async function region (request, h) {
  const { sessionId } = request.params

  const pageData = await RegionService.go(sessionId)

  return h.view('bill-runs/create/region.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select the region',
    ...pageData
  })
}

async function season (request, h) {
  const { sessionId } = request.params

  const pageData = await SeasonService.go(sessionId)

  return h.view('bill-runs/create/season.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select the season',
    ...pageData
  })
}

async function submitRegion (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitRegionService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/create/region.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'Select a region',
      ...pageData
    })
  }

  if (pageData.journeyComplete) {
    return h.redirect(`/system/bill-runs/create/${sessionId}/generate`)
  }

  return h.redirect(`/system/bill-runs/create/${sessionId}/year`)
}

async function submitSeason (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSeasonService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/create/season.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'Select the season',
      ...pageData
    })
  }

  return h.redirect(`/system/bill-runs/create/${sessionId}/generate`)
}

async function submitType (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitTypeService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/create/type.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'Select a bill run type',
      ...pageData
    })
  }

  return h.redirect(`/system/bill-runs/create/${sessionId}/region`)
}

async function submitYear (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitYearService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/create/year.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'Select the financial year',
      ...pageData
    })
  }

  if (pageData.journeyComplete) {
    return h.redirect(`/system/bill-runs/create/${sessionId}/generate`)
  }

  return h.redirect(`/system/bill-runs/create/${sessionId}/season`)
}

async function type (request, h) {
  const { sessionId } = request.params

  const pageData = await TypeService.go(sessionId)

  return h.view('bill-runs/create/type.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select a bill run type',
    ...pageData
  })
}

async function year (request, h) {
  const { sessionId } = request.params

  const pageData = await YearService.go(sessionId)

  return h.view('bill-runs/create/year.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select the financial year',
    ...pageData
  })
}

module.exports = {
  create,
  generate,
  region,
  season,
  submitRegion,
  submitSeason,
  submitType,
  submitYear,
  type,
  year
}
