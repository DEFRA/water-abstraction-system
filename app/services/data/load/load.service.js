'use strict'

/**
 * Loads the entities requested by our acceptance tests when `/data/load` is called into the DB using the helpers
 * @module LoadService
 */

/**
 * Loads the entities requested by our acceptance tests when `/data/load` is called into the DB using the helpers
 *
 * Takes arrays of entities from the payload and using our test helpers creates associated records in the DB. For
 * example, given the following payload a new 'region' record will be created using the `RegionHelper`, and a 'licence'
 * using the `LicenceHelper`.
 *
 * ```json
 * {
 *   "regions": [
 *     {
 *       "id": "d0a4123d-1e19-480d-9dd4-f70f3387c4b9",
 *       "chargeRegionId": "S",
 *       "naldRegionId": 9,
 *       "displayName": "Test Region",
 *       "name": "Test Region"
 *     }
 *   ],
 *   "licences": [
 *     {
 *       "id": "f8702a6a-f61d-4b0a-9af3-9a53768ee516",
 *       "licenceRef": "AT/TEST/01",
 *       "regionId": "d0a4123d-1e19-480d-9dd4-f70f3387c4b9",
 *       "regions": {
 *         "historicalAreaCode": "SAAR",
 *         "regionalChargeArea": "Southern"
 *       },
 *       "startDate": "2022-04-01",
 *       "waterUndertaker": true
 *     }
 *   ]
 * }
 * ```
 *
 * The IDs have been defined in the payload to make it possible to link the new licence to the new region.
 *
 * > Order matters!
 *
 * This is only possible because the region is defined in the payload _before_ the licence. If they were the other way
 * round an error would be thrown when inserting the licence due to a foreign key constraint that requires the
 * referenced region to exist.
 *
 * The values for each entity instance are passed to the associated helper. Like the unit tests, it is on the caller
 * to override any defaults the helper will use. As this is intended to support acceptance testing it is likely you will
 * need to define real values instead of leaving the helper generate the data.
 *
 * ### Looking up an ID (or value)
 *
 * Some records link to lookup values that already exist, for example charge categories and purposes. The problem is
 * the IDs will be different in every environment. It is not possible to set the ID in the fixture. For these you can
 * tell the loader to 'lookup' the ID (or value - it is up to you).
 *
 * In this example we need to lookup the ID for the `crm.entity` record whose `entity_type` is `'regime'`.
 *
 * ```json
 *   "licenceDocumentHeaders": [
 *     {
 *       "id": "282b226e-c47b-4dcc-bbb0-94648fb6b242",
 *       "regimeEntityId": {
 *         "schema": "crm",
 *         "table": "entity",
 *         "lookup": "entityType",
 *         "value": "regime",
 *         "select": "entityId"
 *       }
 *     }
 *   ]
 * ```
 *
 * The result of the lookup will be used as the value for `regimeEntityId` when it is passed to the
 * `LicenceDocumentHeaderHelper`. You _must_ provide all elements for the query. Transformed to SQL this would be
 * `SELECT entity_id FROM crm.entity WHERE entity_type = 'regime'`.
 *
 * @param {Object} payload - the body from the request containing the entities to be created
 *
 * @returns {Promise<Object>} for each entity type passed in an array of ID's for the records created, for example
 *
 * ```javascript
 * {
 *   regions: ['d0a4123d-1e19-480d-9dd4-f70f3387c4b9'],
 *   licences: ['f8702a6a-f61d-4b0a-9af3-9a53768ee516']
 * }
 * ```
 */
async function go (payload) {
  return {}
}

module.exports = {
  go
}
