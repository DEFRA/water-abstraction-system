'use strict'

/**
 * Fetches licence versions that were created in last 2 months that have no matching workflow record
 * @module FetchLicenceUpdatesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches licence versions that were created in last two months that have no matching workflow record
 *
 * If a licence was created in the last two moths and doesn't have a `to_setup` record in workflow it is deemed to have
 * been 'updated.
 *
 * Note, if the licence version is linked to a licence that is part of an in-progress PRESROC bill run it will be
 * excluded from the results (see {@link https://eaflood.atlassian.net/browse/WATER-3528 | WATER-3528}).
 *
 * Also, if a workflow record already exists for the licence version, for example, it is already under review, it will
 * also be excluded from the results.
 *
 * @returns {Promise<object[]>} The ID for each licence version created in the last 2 months without a workflow record,
 * plus associated licence ID and whether a charge version exists for the licence
 */
async function go() {
  const twoMonthsAgo = _twoMonthsAgo()

  // NOTE: We've resorted to Knex rather than Objection JS due to the complexity of the query. As we are not intending
  // to work with the results directly their was no driver to return LicenceVersionModel instances which Objection
  // would have provided.
  return (
    db
      .select(
        'lv.id',
        'lv.licenceId',
        // We add this information to the `data` property of the workflow record so we can tell the user whether they
        // need to create a charge version (new licence) or check the existing one(s)
        db.raw(
          'EXISTS(SELECT 1 FROM public.charge_versions cv WHERE cv.licence_id = lv.licence_id) AS charge_version_exists'
        )
      )
      .from('licenceVersions AS lv')
      .whereNotExists(db.select(1).from('workflows as w').whereColumn('w.licenceVersionId', 'lv.id'))
      // This is only relevant for PRESROC bill runs (see WATER-3528). If a licence is linked to an in-progress PRESROC
      // bill run and gets added to workflow it appears to break the PRESROC billing engine
      .whereNotExists(
        db
          .select(1)
          .from('chargeVersions AS cv')
          .innerJoin('billRunChargeVersionYears AS brcvy', 'brcvy.chargeVersionId', 'cv.id')
          .innerJoin('billRuns AS br', 'br.id', 'brcvy.billRunId')
          .whereIn('br.status', ['processing', 'queued', 'ready', 'review'])
          .whereColumn('cv.licenceId', 'lv.licenceId')
      )
      .where('lv.createdAt', '>=', twoMonthsAgo.toISOString())
      // We're not sure when a licence version's status is set to draft. But the legacy job we are replacing excluded
      // licence versions with this state
      .whereNot('lv.status', 'draft')
  )
}

function _twoMonthsAgo() {
  const today = new Date()

  today.setMonth(today.getMonth() - 2)

  return today
}

module.exports = {
  go
}
