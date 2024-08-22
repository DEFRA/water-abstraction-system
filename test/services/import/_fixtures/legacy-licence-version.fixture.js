'use strict'

function legacyLicenceVersionFixture () {
  return {
    EFF_END_DATE: '04/06/2007',
    EFF_ST_DATE: '05/06/2005',
    INCR_NO: '0',
    ISSUE_NO: '100',
    STATUS: 'SUPER',
    FGAC_REGION_CODE: '3',
    AABL_ID: '10000003',
    purposes: []
  }
}

/**
 * Creates a test legacy import licence versions object
 *
 * @returns {object} - a legacy import licence versions object
 */
function create () {
  return {
    ...legacyLicenceVersionFixture()
  }
}

module.exports = {
  create
}
