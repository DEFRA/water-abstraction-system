'use strict'

/**
 * Fetches a licence's purposes needed for `/return-versions/setup/{sessionId}/purpose` page
 * @module FetchPurposesService
 */

const PurposeModel = require('../../../models/purpose.model.js')

/**
 * Fetches a licence's purposes needed for `/return-versions/setup/{sessionId}/purpose` page
 *
 * Specifically, we need to look for the 'relevant' licence version for the start date the user has entered. That will
 * then give us the licence version purposes, which we use in a WHERE EXISTS clause to determine which purposes to
 * fetch and show to the user.
 *
 * We find the 'relevant' licence version for the start date the user has entered, by filtering for those where the end
 * date is null or greater then sorting them ascending order (oldest at the top).
 *
 * If a licence only has one 'current' licence version (it will have a null end date) then it will be the one selected.
 *
 * If it has a superseded licence version, but the start date is greater than its end date, we still just get the
 * 'current' version returned. Else the first licence version with an end date equal to or greater than our start date
 * is the version that will be used.
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 * @param {Date} startDate - The start date the user has selected for the new return version, needed to find the
 * relevant licence version
 *
 * @returns {Promise<object>} The distinct purposes for the matching licence's current version
 */
async function go(licenceId, startDate) {
  return PurposeModel.query()
    .select(['purposes.id', 'purposes.description'])
    .whereRaw(
      `
        EXISTS (
          SELECT
            1
          FROM
            public.licence_version_purposes lvp
          INNER JOIN (
            SELECT
              lv.id
            FROM
              public.licence_versions lv
            WHERE
              lv.licence_id = ?
              AND (
                lv.end_date IS NULL OR lv.end_date >= ?
              )
            ORDER BY lv.end_date ASC
            LIMIT 1
          ) relevant_lic_ver ON relevant_lic_ver.id = lvp.licence_version_id
          WHERE
            lvp.purpose_id = purposes.id
        )
      `,
      [licenceId, startDate]
    )
    .orderBy([{ column: 'purposes.description', order: 'asc' }])
}

module.exports = {
  go
}
