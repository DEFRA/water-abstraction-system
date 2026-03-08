'use strict'

/**
 * Fetches the licences, related to a company, data needed for the view '/companies/{id}/licences'
 * @module FetchLicencesService
 */

const LicenceModel = require('../../models/licence.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the licences, related to a company, data needed for the view '/companies/{id}/licences'
 *
 * @param {string} companyId - The company id for the company
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the licences for the company and the pagination object
 */
async function go(companyId, page = '1') {
  const { results, total: totalNumber } = await _fetch(companyId, page)

  const licenceIds = results.map((licence) => {
    return licence.id
  })

  const licences = await _fetchDetail(licenceIds)

  return { licences, totalNumber }
}

/**
 * We need to grab the company Id and derived name off the licence version holder for the latest licence version linked
 * to each licence fetched.
 *
 * For reasons explained in `_fetchDetail()`, we rely on a lateral join to get the data, but it has a big impact on
 * performance if applied at _this_ level.
 *
 * We compared paging through the 427 licences for one of our largest licence holders, and these were the times in ms
 * to fetch each page.
 *
 * |Time as one query|Time as two queries|
 * |-----------------|-------------------|
 * |             1408|                218|
 * |             1383|                166|
 * |             1467|                223|
 * |             1623|                151|
 * |             1698|                217|
 *
 * As you can see it makes a massive difference. So we fetch the licence data in two stages, first just the licence IDs,
 * and then the details for those licences.
 *
 * @private
 */
async function _fetch(companyId, page) {
  return LicenceModel.query()
    .select(['licences.id'])
    .whereExists(
      LicenceModel.relatedQuery('licenceVersions')
        .innerJoinRelated('licenceVersionHolder')
        .where('licenceVersionHolder.companyId', companyId)
    )
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

/**
 * A note about the uncommon use of `joinRaw` in the query.
 *
 * Essentially, for each licence we want it's current licence version, and then its a cinch to get the licence holder
 * name and company ID from its joined licence version holder record.
 *
 * We have the `currentVersion` modifier on the licence model. However, when applied as part of a query that is fetching
 * multiple licences it does not work. The `limit()` clause means only the licence version for the first licence
 * is fetched, after that all other licences have an empty `licenceVersions` property.
 *
 * If we just wanted the one field, we could have just done a `raw()` call within the select, something we've done in
 * other queries. But we want both two fields from the relevant licence version holder record.
 *
 * Doing a traditional join with the `limit()` clause is just going to have the same result as our modifier. Dropping it
 * will result in returning lots of licence versions we don't need.
 *
 * A lateral join solves our problem, as it acts like a `foreach` loop in the SQL. For every licence, it runs the
 * subquery once, passing in the licence ID as a parameter. Therefore, the limit only applies in the context of the
 * current licence. And as a inner join, we can pull as many fields as we need from the licence version holder table.
 *
 * NOTE: For anyone wondering what the `ON true` bit is for in the join, it's just a quirk of the syntax when doing
 * lateral joins. In SQL, every JOIN requires an ON condition. But with lateral joins, the join logic is defined inside
 * the subquery. However, the database still demands an ON keyword to complete the statement. ON true simply satisfies
 * that requirement by saying: "The condition for this join is always met."
 *
 * @private
 */
async function _fetchDetail(licenceIds) {
  return LicenceModel.query()
    .select([
      'licences.expiredDate',
      'licences.id',
      'licences.lapsedDate',
      'licences.licenceRef',
      'licences.revokedDate',
      'licences.startDate',
      'latest_holder.company_id AS currentLicenceHolderId',
      'latest_holder.derived_name AS currentLicenceHolder'
    ])
    .whereIn('id', licenceIds)
    .joinRaw(
      `LEFT JOIN LATERAL (
      SELECT
        lvh.company_id,
        lvh.derived_name
      FROM public.licence_versions lv
      INNER JOIN public.licence_version_holders lvh
        ON lvh.licence_version_id = lv.id
      WHERE
        lv.licence_id = licences.id
      ORDER BY
        lv.start_date DESC,
        lv.issue DESC,
        lv.increment DESC
      LIMIT 1
    ) AS latest_holder ON true`
    )
    .orderBy('licenceRef', 'asc')
}

module.exports = {
  go
}
