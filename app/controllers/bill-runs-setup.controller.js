/**
 * Controller for /bill-runs/setup endpoints
 * @module BillRunsSetupController
 */

import CheckService from '../services/bill-runs/setup/check.service.js'
import InitiateSessionService from '../services/bill-runs/setup/initiate-session.service.js'
import NoLicencesService from '../services/bill-runs/setup/no-licences.service.js'
import RegionService from '../services/bill-runs/setup/region.service.js'
import SeasonService from '../services/bill-runs/setup/season.service.js'
import SubmitCheckService from '../services/bill-runs/setup/submit-check.service.js'
import SubmitRegionService from '../services/bill-runs/setup/submit-region.service.js'
import SubmitSeasonService from '../services/bill-runs/setup/submit-season.service.js'
import SubmitTypeService from '../services/bill-runs/setup/submit-type.service.js'
import SubmitYearService from '../services/bill-runs/setup/submit-year.service.js'
import TypeService from '../services/bill-runs/setup/type.service.js'
import YearService from '../services/bill-runs/setup/year.service.js'

async function check(request, h) {
  const { sessionId } = request.params

  const pageData = await CheckService.go(sessionId)

  return h.view('bill-runs/setup/check.njk', pageData)
}

async function noLicences(request, h) {
  const { sessionId } = request.params

  const pageData = await NoLicencesService.go(sessionId)

  return h.view('bill-runs/setup/no-licences.njk', pageData)
}

async function region(request, h) {
  const { sessionId } = request.params

  const pageData = await RegionService.go(sessionId)

  return h.view('bill-runs/setup/region.njk', pageData)
}

async function season(request, h) {
  const { sessionId } = request.params

  const pageData = await SeasonService.go(sessionId)

  return h.view('bill-runs/setup/season.njk', pageData)
}

async function setup(_request, h) {
  const session = await InitiateSessionService.go()

  return h.redirect(`/system/bill-runs/setup/${session.id}/type`)
}

async function submitCheck(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitCheckService.go(sessionId, request.auth)

  if (pageData.error) {
    return h.view('bill-runs/setup/check.njk', pageData)
  }

  return h.redirect(`/system/bill-runs`)
}

async function submitRegion(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitRegionService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/region.njk', pageData)
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
    return h.view('bill-runs/setup/season.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/check`)
}

async function submitType(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitTypeService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/type.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/region`)
}

async function submitYear(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitYearService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/year.njk', pageData)
  }

  if (pageData.setupComplete) {
    return h.redirect(`/system/bill-runs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/season`)
}

async function type(request, h) {
  const { sessionId } = request.params

  const pageData = await TypeService.go(sessionId)

  return h.view('bill-runs/setup/type.njk', pageData)
}

async function year(request, h) {
  const { sessionId } = request.params

  const pageData = await YearService.go(sessionId)

  if (pageData.financialYearsData.length === 0) {
    return h.redirect(`/system/bill-runs/setup/${sessionId}/no-licences`)
  }

  return h.view('bill-runs/setup/year.njk', pageData)
}

export default {
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
