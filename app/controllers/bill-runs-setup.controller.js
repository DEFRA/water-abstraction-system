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

export async function check(request, h) {
  const { sessionId } = request.params

  const pageData = await CheckService(sessionId)

  return h.view('bill-runs/setup/check.njk', pageData)
}

export async function noLicences(request, h) {
  const { sessionId } = request.params

  const pageData = await NoLicencesService(sessionId)

  return h.view('bill-runs/setup/no-licences.njk', pageData)
}

export async function region(request, h) {
  const { sessionId } = request.params

  const pageData = await RegionService(sessionId)

  return h.view('bill-runs/setup/region.njk', pageData)
}

export async function season(request, h) {
  const { sessionId } = request.params

  const pageData = await SeasonService(sessionId)

  return h.view('bill-runs/setup/season.njk', pageData)
}

export async function setup(_request, h) {
  const session = await InitiateSessionService()

  return h.redirect(`/system/bill-runs/setup/${session.id}/type`)
}

export async function submitCheck(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitCheckService(sessionId, request.auth)

  if (pageData.error) {
    return h.view('bill-runs/setup/check.njk', pageData)
  }

  return h.redirect(`/system/bill-runs`)
}

export async function submitRegion(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitRegionService(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/region.njk', pageData)
  }

  if (pageData.setupComplete) {
    return h.redirect(`/system/bill-runs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/year`)
}

export async function submitSeason(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSeasonService(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/season.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/check`)
}

export async function submitType(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitTypeService(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/type.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/region`)
}

export async function submitYear(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitYearService(sessionId, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/setup/year.njk', pageData)
  }

  if (pageData.setupComplete) {
    return h.redirect(`/system/bill-runs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/bill-runs/setup/${sessionId}/season`)
}

export async function type(request, h) {
  const { sessionId } = request.params

  const pageData = await TypeService(sessionId)

  return h.view('bill-runs/setup/type.njk', pageData)
}

export async function year(request, h) {
  const { sessionId } = request.params

  const pageData = await YearService(sessionId)

  if (pageData.financialYearsData.length === 0) {
    return h.redirect(`/system/bill-runs/setup/${sessionId}/no-licences`)
  }

  return h.view('bill-runs/setup/year.njk', pageData)
}
