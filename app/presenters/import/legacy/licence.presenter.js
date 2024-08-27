'use strict'

/**
 * Maps the legacy NALD licence data to the WRLS format
 * @module LicencePresenter
 */

const { naldRegions } = require('../../../lib/static-lookups.lib.js')

/**
 * Maps the legacy NALD licence data to the WRLS format
 *
 * @param {ImportLegacyLicenceType} licence - the legacy NALD licence
 *
 * @returns {object} the NALD licence data transformed into the WRLS format ready for validation and persisting
 */
function go (licence) {
  return {
    expiredDate: licence.expiry_date,
    lapsedDate: licence.lapsed_date,
    licenceRef: licence.licence_ref,
    // Add an empty array property ready for when transforming and attaching licence versions
    licenceVersions: [],
    regionId: licence.region_id,
    regions: _regions(licence),
    revokedDate: licence.revoked_date,
    startDate: _startDate(licence),
    waterUndertaker: licence.environmental_improvement_unit_charge_code.endsWith('SWC')
  }
}

/**
 * Creates a JSON object of the region data. This is stored as a JSON object in the licence.regions column.
 *
 * @private
 */
const _regions = (licence) => {
  const historicalAreaCode = licence.historical_area_code
  const regionPrefix = licence.environmental_improvement_unit_charge_code.substr(0, 2)
  const regionalChargeArea = naldRegions[regionPrefix]
  const standardUnitChargeCode = licence.standard_unit_charge_code
  const localEnvironmentAgencyPlanCode = licence.local_environment_agency_plan_code

  return { historicalAreaCode, regionalChargeArea, standardUnitChargeCode, localEnvironmentAgencyPlanCode }
}

function _startDate (licence) {
  if (licence.original_effective_date) {
    return licence.original_effective_date
  }

  return licence.earliest_version_start_date
}

module.exports = {
  go
}
