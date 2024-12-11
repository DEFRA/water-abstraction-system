'use strict'

/**
 * Controller for /bill-runs/setup endpoints
 * @module BillRunsSetupController
 */

const CheckService = require('../services/bill-runs/setup/check.service.js')
const InitiateSessionService = require('../services/bill-runs/setup/initiate-session.service.js')
const NoLicencesService = require('../services/bill-runs/setup/no-licences.service.js')
const RegionService = require('../services/bill-runs/setup/region.service.js')
const SeasonService = require('../services/bill-runs/setup/season.service.js')
const SubmitCheckService = require('../services/bill-runs/setup/submit-check.service.js')
const SubmitRegionService = require('../services/bill-runs/setup/submit-region.service.js')
const SubmitSeasonService = require('../services/bill-runs/setup/submit-season.service.js')
const SubmitTypeService = require('../services/bill-runs/setup/submit-type.service.js')
const SubmitYearService = require('../services/bill-runs/setup/submit-year.service.js')
const TypeService = require('../services/bill-runs/setup/type.service.js')
const YearService = require('../services/bill-runs/setup/year.service.js')

async function check(request, h) {
  const { sessionId } = request.params

  const pageData = await CheckService.go(sessionId)

  return h.view('bill-runs/setup/check.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function noLicences(request, h) {
  const { sessionId } = request.params

  const regionName = await NoLicencesService.go(sessionId)

  return h.view('bill-runs/setup/no-licences.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: `There are no licences marked for two-part tariff supplementary billing in the ${regionName} region`,
    sessionId
  })
}

async function region(request, h) {
  const { sessionId } = request.params

  const pageData = await RegionService.go(sessionId)

  return h.view('bill-runs/setup/region.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select the region',
    ...pageData
  })
}

async function season(request, h) {
  const { sessionId } = request.params

  const pageData = await SeasonService.go(sessionId)

  return h.view('bill-runs/setup/season.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select the season',
    ...pageData
  })
}

async function setup(_request, h) {
  const session = await InitiateSessionService.go()

  return h.redirect(`/system/bill-runs/setup/${session.id}/type`)
}

async function submitCheck(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitCheckService.go(sessionId, request.auth)

  if (pageData.error) {
    return h.view('bill-runs/setup/check.njk', {
      activeNavBar: 'bill-runs',
      ...pageData
    })
  }

  return h.redirect(`/system/bill-runs`)
}

async function submitRegion(request, h) {
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
    return h.redirect(`/system/bill-runs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/year`)
}

async function submitSeason(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSeasonService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/season.njk', {
      activeNavBar: 'bill-runs',
      pageTitle: 'Select the season',
      ...pageData
    })
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/check`)
}

async function submitType(request, h) {
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

async function submitYear(request, h) {
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
    return h.redirect(`/system/bill-runs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/season`)
}

async function type(request, h) {
  const { sessionId } = request.params

  const pageData = await TypeService.go(sessionId)

  return h.view('bill-runs/setup/type.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select bill run type',
    ...pageData
  })
}

async function year(request, h) {
  const { sessionId } = request.params

  const pageData = await YearService.go(sessionId)

  if (pageData.financialYearsData.length === 0) {
    return h.redirect(`/system/bill-runs/setup/${sessionId}/no-licences`)
  }

  return h.view('bill-runs/setup/year.njk', {
    activeNavBar: 'bill-runs',
    pageTitle: 'Select the financial year',
    ...pageData
  })
}

module.exports = {
  check,
  noLicences,
  region,
  season,
  setup,
  submitCheck,
  submitRegion,
  submitSeason,
  submitType,
  submitYear,
  type,
  year
}
