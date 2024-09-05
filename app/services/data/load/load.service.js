'use strict'

/**
 * Loads the entities requested by our acceptance tests when `/data/load` is called into the DB using the helpers
 * @module LoadService
 */

const { db } = require('../../../../db/db.js')

const ExpandedError = require('../../../errors/expanded.error.js')

const AddressHelper = require('../../../../test/support/helpers/address.helper.js')
const BillLicenceHelper = require('../../../../test/support/helpers/bill-licence.helper.js')
const BillRunChargeVersionYearHelper = require('../../../../test/support/helpers/bill-run-charge-version-year.helper.js')
const BillRunVolumeHelper = require('../../../../test/support/helpers/bill-run-volume.helper.js')
const BillRunHelper = require('../../../../test/support/helpers/bill-run.helper.js')
const BillHelper = require('../../../../test/support/helpers/bill.helper.js')
const BillingAccountAddressHelper = require('../../../../test/support/helpers/billing-account-address.helper.js')
const BillingAccountHelper = require('../../../../test/support/helpers/billing-account.helper.js')
const ChangeReasonHelper = require('../../../../test/support/helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../../test/support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../../test/support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../../test/support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../../test/support/helpers/charge-version.helper.js')
const CompanyAddressHelper = require('../../../../test/support/helpers/company-address.helper.js')
const CompanyContactHelper = require('../../../../test/support/helpers/company-contact.helper.js')
const CompanyHelper = require('../../../../test/support/helpers/company.helper.js')
const ContactHelper = require('../../../../test/support/helpers/contact.helper.js')
const EventHelper = require('../../../../test/support/helpers/event.helper.js')
const GaugingStationHelper = require('../../../../test/support/helpers/gauging-station.helper.js')
const LicenceAgreementHelper = require('../../../../test/support/helpers/licence-agreement.helper.js')
const LicenceDocumentHeaderHelper = require('../../../../test/support/helpers/licence-document-header.helper.js')
const LicenceDocumentRoleHelper = require('../../../../test/support/helpers/licence-document-role.helper.js')
const LicenceDocumentHelper = require('../../../../test/support/helpers/licence-document.helper.js')
const LicenceEntityRoleHelper = require('../../../../test/support/helpers/licence-entity-role.helper.js')
const LicenceEntityHelper = require('../../../../test/support/helpers/licence-entity.helper.js')
const LicenceGaugingStationHelper = require('../../../../test/support/helpers/licence-gauging-station.helper.js')
const LicenceRoleHelper = require('../../../../test/support/helpers/licence-role.helper.js')
const LicenceSupplementaryYearHelper = require('../../../../test/support/helpers/licence-supplementary-year.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../../../test/support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeHelper = require('../../../../test/support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposePointHelper = require('../../../../test/support/helpers/licence-version-purpose-point.helper.js')
const LicenceVersionHelper = require('../../../../test/support/helpers/licence-version.helper.js')
const LicenceHelper = require('../../../../test/support/helpers/licence.helper.js')
const ModLogHelper = require('../../../../test/support/helpers/mod-log.helper.js')
const PermitLicenceHelper = require('../../../../test/support/helpers/permit-licence.helper.js')
const ReturnLogHelper = require('../../../../test/support/helpers/return-log.helper.js')
const ReturnRequirementPointHelper = require('../../../../test/support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../../test/support/helpers/return-requirement-purpose.helper.js')
const ReturnRequirementHelper = require('../../../../test/support/helpers/return-requirement.helper.js')
const ReturnSubmissionLineHelper = require('../../../../test/support/helpers/return-submission-line.helper.js')
const ReturnSubmissionHelper = require('../../../../test/support/helpers/return-submission.helper.js')
const ReturnVersionHelper = require('../../../../test/support/helpers/return-version.helper.js')
const ReviewChargeElementReturnHelper = require('../../../../test/support/helpers/review-charge-element-return.helper.js')
const ReviewChargeElementHelper = require('../../../../test/support/helpers/review-charge-element.helper.js')
const ReviewChargeReferenceHelper = require('../../../../test/support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../../test/support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../../test/support/helpers/review-licence.helper.js')
const ReviewReturnHelper = require('../../../../test/support/helpers/review-return.helper.js')
const ScheduledNotificationHelper = require('../../../../test/support/helpers/scheduled-notification.helper.js')
const SessionHelper = require('../../../../test/support/helpers/session.helper.js')
const TransactionHelper = require('../../../../test/support/helpers/transaction.helper.js')
const UserGroupHelper = require('../../../../test/support/helpers/user-group.helper.js')
const UserRoleHelper = require('../../../../test/support/helpers/user-role.helper.js')
const UserHelper = require('../../../../test/support/helpers/user.helper.js')
const WorkflowHelper = require('../../../../test/support/helpers/workflow.helper.js')

// The entities defined in the payload need to match the properties of this object else you'll get an error. The loader
// uses the matched value to determine which helper to use to 'load' the entity instance, and whether we can flag it
// as `is_test`.
const LOAD_HELPERS = {
  addresses: { helper: AddressHelper, test: true, legacy: { schema: 'crm_v2', table: 'addresses', id: 'address_id' } },
  billLicences: { helper: BillLicenceHelper, test: false },
  billRunChargeVersionYears: { helper: BillRunChargeVersionYearHelper, test: false },
  billRunVolumes: { helper: BillRunVolumeHelper, test: false },
  billRuns: { helper: BillRunHelper, test: false },
  bills: { helper: BillHelper, test: false },
  billingAccountAddresses: { helper: BillingAccountAddressHelper, test: true, legacy: { schema: 'crm_v2', table: 'invoice_account_addresses', id: 'invoice_account_address_id' } },
  billingAccounts: { helper: BillingAccountHelper, test: true, legacy: { schema: 'crm_v2', table: 'invoice_accounts', id: 'invoice_account_id' } },
  changeReasons: { helper: ChangeReasonHelper, test: false },
  chargeCategories: { helper: ChargeCategoryHelper, test: true, legacy: { schema: 'water', table: 'billing_charge_categories', id: 'billing_charge_category_id' } },
  chargeElements: { helper: ChargeElementHelper, test: true, legacy: { schema: 'water', table: 'charge_purposes', id: 'charge_purpose_id' } },
  chargeReferences: { helper: ChargeReferenceHelper, test: true, legacy: { schema: 'water', table: 'charge_elements', id: 'charge_element_id' } },
  chargeVersions: { helper: ChargeVersionHelper, test: true, legacy: { schema: 'water', table: 'charge_versions', id: 'charge_version_id' } },
  companyAddresses: { helper: CompanyAddressHelper, test: true, legacy: { schema: 'crm_v2', table: 'company_addresses', id: 'company_address_id' } },
  companyContacts: { helper: CompanyContactHelper, test: true, legacy: { schema: 'crm_v2', table: 'company_contacts', id: 'company_contact_id' } },
  companies: { helper: CompanyHelper, test: true, legacy: { schema: 'crm_v2', table: 'companies', id: 'company_id' } },
  contacts: { helper: ContactHelper, test: true, legacy: { schema: 'crm_v2', table: 'contacts', id: 'contact_id' } },
  events: { helper: EventHelper, test: false },
  gaugingStations: { helper: GaugingStationHelper, test: true, legacy: { schema: 'water', table: 'gauging_stations', id: 'gauging_station_id' } },
  licenceAgreements: { helper: LicenceAgreementHelper, test: true, legacy: { schema: 'water', table: 'licence_agreements', id: 'licence_agreement_id' } },
  licenceDocumentHeaders: { helper: LicenceDocumentHeaderHelper, test: false },
  licenceDocumentRoles: { helper: LicenceDocumentRoleHelper, test: true, legacy: { schema: 'crm_v2', table: 'document_roles', id: 'document_role_id' } },
  licenceDocuments: { helper: LicenceDocumentHelper, test: true, legacy: { schema: 'crm_v2', table: 'documents', id: 'document_id' } },
  licenceEntityRoles: { helper: LicenceEntityRoleHelper, test: false },
  licenceEntities: { helper: LicenceEntityHelper, test: false },
  licenceGaugingStations: { helper: LicenceGaugingStationHelper, test: true, legacy: { schema: 'water', table: 'licence_gauging_stations', id: 'licence_gauging_station_id' } },
  licenceRoles: { helper: LicenceRoleHelper, test: false },
  LicenceSupplementaryYears: { helper: LicenceSupplementaryYearHelper, test: false },
  licenceVersionPurposeConditions: { helper: LicenceVersionPurposeConditionHelper, test: false },
  licenceVersionPurposes: { helper: LicenceVersionPurposeHelper, test: true, legacy: { schema: 'water', table: 'licence_version_purposes', id: 'licence_version_purpose_id' } },
  licenceVersionPurposePoints: { helper: LicenceVersionPurposePointHelper, test: false },
  licenceVersions: { helper: LicenceVersionHelper, test: true, legacy: { schema: 'water', table: 'licence_versions', id: 'licence_version_id' } },
  licences: { helper: LicenceHelper, test: true, legacy: { schema: 'water', table: 'licences', id: 'licence_id' } },
  modLogs: { helper: ModLogHelper, test: false },
  permitLicences: { helper: PermitLicenceHelper, test: false },
  returnLogs: { helper: ReturnLogHelper, test: true, legacy: { schema: 'returns', table: 'returns', id: 'return_id' } },
  returnRequirementPoints: { helper: ReturnRequirementPointHelper, test: false },
  returnRequirementPurposes: { helper: ReturnRequirementPurposeHelper, test: false },
  returnRequirements: { helper: ReturnRequirementHelper, test: false },
  returnSubmissionLines: { helper: ReturnSubmissionLineHelper, test: false },
  returnSubmissions: { helper: ReturnSubmissionHelper, test: false },
  returnVersions: { helper: ReturnVersionHelper, test: false },
  reviewChargeElementReturns: { helper: ReviewChargeElementReturnHelper, test: false },
  reviewChargeElements: { helper: ReviewChargeElementHelper, test: false },
  reviewChargeReferences: { helper: ReviewChargeReferenceHelper, test: false },
  reviewChargeVersions: { helper: ReviewChargeVersionHelper, test: false },
  reviewLicences: { helper: ReviewLicenceHelper, test: false },
  reviewReturns: { helper: ReviewReturnHelper, test: false },
  scheduledNotifications: { helper: ScheduledNotificationHelper },
  sessions: { helper: SessionHelper, test: false },
  transactions: { helper: TransactionHelper, test: false },
  userGroups: { helper: UserGroupHelper, test: false },
  userRoles: { helper: UserRoleHelper, test: false },
  users: { helper: UserHelper, test: false },
  workflows: { helper: WorkflowHelper, test: false }
}

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
 * @param {object} payload - the body from the request containing the entities to be created
 *
 * @returns {Promise<object>} for each entity type passed in an array of ID's for the records created, for example
 *
 * ```javascript
 * {
 *   regions: ['d0a4123d-1e19-480d-9dd4-f70f3387c4b9'],
 *   licences: ['f8702a6a-f61d-4b0a-9af3-9a53768ee516']
 * }
 * ```
 */
async function go (payload) {
  // Instantiate a result object to which we'll record the ID's generated/used
  const result = {}

  if (!payload) {
    return result
  }

  // From the payload grab the entities to load; regions, licences, chargeVersions etc
  const entityKeys = Object.keys(payload)

  for (const entityKey of entityKeys) {
    result[entityKey] = []

    // Extract the next entity to load, for example licences: [{}, {}]
    const entity = payload[entityKey]

    // Then iterate through the entity's instances to be created
    for (const instance of entity) {
      // Apply any lookups defined in the instance
      await _applyLookups(instance)

      // Select the appropriate helper for the entity
      const loadHelper = _helper(entityKey)

      // Then create (load) the instance into the DB
      const { id } = await loadHelper.helper.add(instance)

      // Check if we need to apply our 'fudge' solution for setting `is_test` flags
      if (loadHelper.test) {
        await _applyTestFlag(loadHelper.legacy, id)
      }

      // Finally record the ID either generated or used in the result
      result[entityKey].push(id)
    }
  }

  return result
}

/**
 * A lookup is where we need to grab an existing value from the DB. For example, looking up the ID of the charge
 * category to use in a charge reference we are trying to load.
 *
 * In this example the instance needs to lookup the ID for the `crm.entity` record whose `entity_type` is `'regime'`.
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
 * We grab all the keys for the instance, then iterate through all its properties. In this example when we get to
 * `instance.regimeEntityId` we'll confirm it is an object with a `schema:` property. We then replace the value of
 * `instance.regimeEntityId` with the result of a query based on the details provided. In this case `SELECT entity_id
 * FROM crm.entity WHERE entity_type = 'regime'`.
 *
 * @private
 */
async function _applyLookups (instance) {
  const keys = Object.keys(instance)

  for (const key of keys) {
    if (instance[key].schema) {
      const { schema, table, lookup, value, select } = instance[key]

      instance[key] = await _selector(schema, table, select, lookup, value)
    }
  }
}

/**
 * Set the `is_test` flag on a record post-insert
 *
 * We don't believe in the idea of an `is_test` flag. All data in a non-prod environment can be considered test data. It
 * is easier to create unit tests and build stuff if you know that everything can be wiped and re-seeded.
 *
 * So, when we created our views of the legacy tables we purposefully commented out the `is_test` field from all of
 * them. We optimistically hoped to have a solution for test data that wouldn't depend on them.
 *
 * We'll we now have this solution to load test data. What we don't have yet is sufficient data to load. Meantime, our
 * tests depend on using the `/data/tear-down` to wipe stuff and it depends on `is_test` flags.
 *
 * So, this is a 'fudge' to avoid having to go back and re-create loads of views just to include the flag. The constant
 * `LOAD_HELPERS` identifies those entities that have a `is_test` field. When we load one that does we trigger this
 * function to update the flag on the source table. Then when `/data/tear-down` runs it will know to clear it.
 *
 * @private
 */
async function _applyTestFlag (legacy, id) {
  const { schema, table, id: tableId } = legacy

  return db(table).withSchema(schema).update('is_test', true).where(tableId, id)
}

function _helper (entityKey) {
  const loadHelper = LOAD_HELPERS[entityKey]

  if (!loadHelper) {
    throw new ExpandedError('Unknown entity to load', { entityKey })
  }

  return loadHelper
}

async function _selector (schema, table, select, where, value) {
  const result = await db
    .withSchema(schema)
    .first(select)
    .from(table)
    .where(where, value)

  return result[select]
}

module.exports = {
  go
}
