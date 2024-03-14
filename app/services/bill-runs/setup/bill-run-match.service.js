'use strict'

/**
 * Determines if an existing bill run matches the one a user is trying to setup
 * @module ExistsService
 */

const FetchLiveBillRunsService = require('./fetch-live-bill-runs.service.js')
const FetchMatchingBillRunService = require('./fetch-matching-bill-run.service.js')

async function go (regionId, batchType, financialEndYear, season = null) {
  const supplementary = batchType === 'supplementary'

  const matchingBillRuns = await _fetchMatchingBillRuns(regionId, batchType, financialEndYear, season)
  const liveBillRuns = await _fetchLiveBillRuns(matchingBillRuns, regionId, supplementary, financialEndYear)

  return _processFetchResults(matchingBillRuns, liveBillRuns, supplementary, financialEndYear)
}

async function _fetchLiveBillRuns (matchingBillRuns, regionId, supplementary, financialEndYear) {
  // We don't need to check live bill runs if we already have a match for a non-supplementary bill run
  if (!supplementary && matchingBillRuns.length > 0) {
    return []
  }

  // We are making an assumption here for supplementary. If we have 2 results then FetchMatchingBillRun must have
  // matched a supplementary in both the current financial year and 2022 (last year of PRESROC). This is because
  // FetchMatchingBillRun drops the filter by year when checking for supplementary so looks across all years. Our
  // working understanding is you can't have 2 bill runs in progress for the same financial year (our and the legacy
  // engine won't allow it). So, it _must_ be because we have previously created a supplementary bill run for the
  // same region which triggered an SROC and PRESROC which are both sat in 'ready'
  if (supplementary && matchingBillRuns.length > 1) {
    return []
  }

  // No matches or only 1 match for supplementary means we need to check for any live bill runs
  return FetchLiveBillRunsService.go(regionId, financialEndYear, supplementary)
}

async function _fetchMatchingBillRuns (regionId, batchType, financialEndYear, season) {
  const summer = season === 'summer'

  return FetchMatchingBillRunService.go(regionId, batchType, financialEndYear, summer)
}

function _processFetchResults (matchingBillRuns, liveBillRuns, supplementary, financialEndYear) {
  // First, a shortcut! If we have no results to process we have no results to return!
  if (matchingBillRuns.length === 0 && liveBillRuns.length === 0) {
    return []
  }

  if (!supplementary) {
    return _processNonSupplementaryResults(matchingBillRuns, liveBillRuns)
  }

  return _processSupplementaryResults(matchingBillRuns, liveBillRuns, financialEndYear)
}

function _processNonSupplementaryResults (matchingBillRuns, liveBillRuns) {
  // If there was a match we return that as the result to display to the user as it will be more applicable
  if (matchingBillRuns.length > 0) {
    return [matchingBillRuns[0]]
  }

  // Else if there is a live bill run we display the first result. Any live bill run will block a new one
  return [liveBillRuns[0]]
}

function _processSupplementaryResults (matchingBillRuns, liveBillRuns, financialEndYear) {
  // If we are here we are dealing with a supplementary. What we want to know when it comes to supplementary is
  //
  // - does it have any matches/live bill runs for the current financial year?
  // - does it have any matches/live bill runs for the last PRESROC year (2022)?
  //
  // If it is yes to both we have to block the new one. If it yes to just one, the other can go ahead. If it is no to
  // both then both can be triggered
  const results = []

  let currentMatch = false
  let presrocMatch = false

  // NOTE: This needs explaining. First, for supplementary we only care about 'live' bill runs. Supplementary ignores
  // completed ones because you can have as many completed supplementary bill runs in a year as you like. So, if
  // matchingBillRuns is empty it means there are no live _supplementary_ bill runs. So, we only need to check the
  // results in liveBillRuns.
  //
  // If matchingBillRuns contained 2 results we wouldn't be here (see notes in _fetchLiveBillRuns()).
  //
  // But when matchingBillRuns contains just 1 match it means we have a live supplementary in either the current year or
  // 2022. So, we needed to call FetchLiveBillRunsService to check for all live bill runs in both years. That means
  // liveBillRuns will contain the same live supplementary in matchingBillRuns. Hence, we can just process liveBillRuns
  // for our match results.
  const billRunsToProcess = liveBillRuns.length > 0 ? liveBillRuns : matchingBillRuns

  for (const billRun of billRunsToProcess) {
    if (billRun.toFinancialYearEnding === financialEndYear) {
      results.push(billRun)
      currentMatch = true
    } else {
      results.push(billRun)
      presrocMatch = true
    }

    if (currentMatch && presrocMatch) {
      break
    }
  }

  return results
}

module.exports = {
  go
}
