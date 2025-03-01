'use strict'

const { titleCase } = require('./base.presenter.js')

/**
 * Formats how the bill run type for display in views
 *
 * @param {string} batchType - The type of bill run; annual, supplementary, two_part_tariff or two_part_supplementary
 * @param {string} scheme - Whether the bill run is PRESROC (alcs) or SROC (sroc)
 * @param {boolean} summer - Applies to PRESROC two-part tariff bill runs. Whether the bill run is for summer only
 *
 * @returns {string} The bill run type formatted for display
 */
function formatBillRunType(batchType, scheme, summer) {
  if (!['two_part_tariff', 'two_part_supplementary'].includes(batchType)) {
    return titleCase(batchType)
  }

  if (batchType === 'two_part_supplementary') {
    return 'Two-part tariff supplementary'
  }

  if (scheme === 'sroc') {
    return 'Two-part tariff'
  }

  if (summer) {
    return 'Two-part tariff summer'
  }

  return 'Two-part tariff winter and all year'
}

/**
 * Formats a bill run's scheme (alcs or sroc) for display in a view (Old or Current)
 *
 * @param {string} scheme - The bill run scheme to format
 *
 * @returns {string} The scheme formatted for display
 */
function formatChargeScheme(scheme) {
  if (scheme === 'sroc') {
    return 'Current'
  }

  return 'Old'
}

/**
 * Generates the page title for a bill run, for example, 'Anglian supplementary'
 *
 * Typically the page title when viewing a bill run is the region name followed by the bill run type. We determine the
 * bill run type using the bill run's batch type, scheme and in the case of two-part tariff PRESROC bill runs, whether
 * it is summer only or not.
 *
 * @param {string} regionName - Name of the region the bill run is for
 * @param {string} batchType - The type of bill run; annual, supplementary or two_part_tariff
 * @param {string} scheme - Whether the bill run is PRESROC (alcs) or SROC (sroc)
 * @param {boolean} summer - Applies to PRESROC two-part tariff bill runs. Whether the bill run is for summer only
 *
 * @returns The bill run title to use in bill run pages
 */
function generateBillRunTitle(regionName, batchType, scheme, summer) {
  const billRunType = formatBillRunType(batchType, scheme, summer)

  return `${titleCase(regionName)} ${billRunType.toLowerCase()}`
}

module.exports = {
  formatBillRunType,
  formatChargeScheme,
  generateBillRunTitle
}
