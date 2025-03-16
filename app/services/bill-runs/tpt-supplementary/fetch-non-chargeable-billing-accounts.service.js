'use strict'

/**
 * Fetches 'billing accounts' linked to non-chargeable licences for a two-part tariff supplementary bill run
 * @module FetchNonChargeableBillingAccountsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches 'billing accounts' linked to non-chargeable licences for a two-part tariff supplementary bill run
 *
 * There is a particular scenario which the system in its current state cannot handle using `FetchBillingAccounts`.
 *
 * For example, licence 01/123 was billed under WA00001234A in the 2023/24 two-part tariff annual bill run. It had a 2PT
 * SROC charge version starting on 2022-04-01 linked to WA00001234A. A user then adds a non-chargeable charge version to
 * the licence, starting on 2023-04-01. This will automatically set the end date 2024-03-31 on the 2PT charge version.
 *
 * The user will expect the supplementary engine to generate a full credit to WA00001234A for 2023/24. The problem is
 * the legacy code when it creates the non-chargeable charge version does _not_ set a billing account against it
 * (frustrating but understandable - they are declaring the licence as non-chargeable so why would there be a billing
 * account?)
 *
 * `FetchBillingAccounts` depends on being able to link billing accounts to the charge versions its filtered based on
 * the bill run 'in progress'.
 *
 * If the non-chargeable charge version started mid-year, for example 2023-10-01, we'd be fine. `FetchBillingAccounts`
 * would still return WA00001234A and licence 01/123 because the 2PT charge version is still 'live' for part of 2023/24.
 * The bit of the engine that checks for previous transactions for a licence would be triggered.
 *
 * But in our example, there is no longer a chargeable charge version for any part of 2023/24, `FetchBillingAccounts`
 * would not pick up the licence because only the non-chargeable charge version, which has no billing account is 'live'.
 * This means the check for previous transactions would never get triggered and we'd never raise the credit.
 *
 * So, for this specific scenario we have this service. It is called by `FetchBillingAccounts` after it has retrieved
 * its results to catch licences in this state.
 *
 * The query looks for licences that have been flagged for 2PT and have been assigned to the bill run in progress that
 * have non-chargeable charge versions applicable to the year being billed. Any licences already captured by
 * `FetchBillingAccounts` are excluded.
 *
 * It generates a mock 'billing account' object for each account number returned, with a mock 'charge version' for each
 * licence.
 *
 * Because it is possible to have a billing account linked to multiple licences, and for a user to make all its licences
 * non-chargeable at the same time, we're forced to do some grouping.
 *
 * @param {string} billRunId - The UUID of the supplementary two-part tariff bill run to fetch billing accounts for
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 * @param {module:BillingAccountModel[]} billingAccounts - The results from `FetchBillingAccountsService`, used to
 * exclude already fetched billing accounts from our results
 *
 * @returns {Promise<object[]>} An array of objects that mock a `BillingAccount' with charge versions for each connected
 * licence
 */
async function go(billRunId, billingPeriod, billingAccounts) {
  const { billingAccountIds, licenceIds } = _uniqueIds(billingAccounts)

  const results = await _fetch(billRunId, billingPeriod, billingAccountIds, licenceIds)

  return _mockBillingAccounts(results)
}

async function _fetch(billRunId, billingPeriod, billingAccountIds, licenceIds) {
  const financialYearEnd = billingPeriod.endDate.getFullYear()
  const params = [
    billingPeriod.endDate,
    billingPeriod.startDate,
    billRunId,
    financialYearEnd,
    billingAccountIds,
    licenceIds
  ]

  const query = `
    SELECT DISTINCT
      b.billing_account_id,
      b.account_number,
      bl.licence_id,
      bl.licence_ref,
      (l.regions->>'historicalAreaCode') AS historical_area_code,
      (l.regions->>'regionalChargeArea') AS regional_charge_area,
      r.charge_region_id
    FROM
      public.bill_licences bl
    INNER JOIN public.licences l
      ON l.id = bl.licence_id
    INNER JOIN public.regions r
      ON r.id = l.region_id
    INNER JOIN public.bills b
      ON b.id = bl.bill_id
    INNER JOIN public.bill_runs br
      ON br.id = b.bill_run_id
    INNER JOIN public.charge_versions cv
      ON cv.licence_id = bl.licence_id
    INNER JOIN public.change_reasons cr
      ON cr.id = cv.change_reason_id
    INNER JOIN public.licence_supplementary_years lsy
      ON lsy.licence_id = cv.licence_id
    WHERE
      cr."type" = 'new_non_chargeable_charge_version'
      AND cv.start_date <= ?
      AND (
        cv.end_date IS NULL
        OR cv.end_date >= ?
      )
      AND lsy.bill_run_id = ?
      AND br.scheme = 'sroc'
      AND br.status = 'sent'
      AND br.batch_type IN ('two_part_tariff', 'two_part_supplementary')
      AND br.to_financial_year_ending = ?
      AND (
        NOT (b.billing_account_id = ANY(?))
        OR NOT (bl.licence_id = ANY(?))
      )
    ORDER BY
      b.account_number ASC;
  `

  const { rows } = await db.raw(query, params)

  return rows
}

/**
 * Convert the raw results from the query into something that looks like a result from `FetchBillingAccountsService`
 *
 * It is possible have a billing account that is linked to multiple licences that have all been made non-chargeable. If
 * this happens the billing account will appear multiple times in the results.
 *
 * The engine expects the billing accounts it processes to be unique. So, whilst converting the results we also group
 * them by billing account.
 *
 * The other fields that are set are needed by the engine. An empty chargeReferences tells it this is not something to
 * attempt to generate a new line from. It is only to be used to track down previous transactions that might need to be
 * credited. The details against the licence are expected by the Charging Module API CreateTransactionPresenter (they
 * are not against the transaction so we have to source them from the licence).
 *
 * @private
 */
function _mockBillingAccounts(results) {
  const billingAccounts = []

  for (const result of results) {
    const existingBillingAccount = billingAccounts.find((billingAccount) => {
      return billingAccount.id === result.billing_account_id
    })

    const chargeVersion = {
      chargeReferences: [],
      licence: {
        id: result.licence_id,
        licenceRef: result.licence_ref,
        historicalAreaCode: result.historical_area_code,
        regionalChargeArea: result.regional_charge_area,
        region: { chargeRegionId: result.charge_region_id }
      }
    }

    if (existingBillingAccount) {
      existingBillingAccount.chargeVersions.push(chargeVersion)

      continue
    }

    const billingAccount = {
      accountNumber: result.account_number,
      id: result.billing_account_id,
      chargeVersions: [chargeVersion]
    }

    billingAccounts.push(billingAccount)
  }

  return billingAccounts
}

function _uniqueIds(billingAccounts) {
  const allBillingAccountIds = []
  const allLicenceIds = []

  for (const billingAccount of billingAccounts) {
    const { chargeVersions, id } = billingAccount

    allBillingAccountIds.push(id)

    for (const chargeVersion of chargeVersions) {
      allLicenceIds.push(chargeVersion.licence.id)
    }
  }

  const billingAccountIds = [...new Set(allBillingAccountIds)]
  const licenceIds = [...new Set(allLicenceIds)]

  return { billingAccountIds, licenceIds }
}

module.exports = {
  go
}
