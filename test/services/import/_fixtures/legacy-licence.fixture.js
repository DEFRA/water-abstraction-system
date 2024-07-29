'use strict'

const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

const legacyLicenceFixture = {
  AREP_AREA_CODE: 'RIDIN',
  AREP_EIUC_CODE: 'YOOTH',
  AREP_LEAP_CODE: 'AIREL',
  AREP_SUC_CODE: 'YORKI',
  EXPIRY_DATE: '31/03/2015',
  FGAC_REGION_CODE: '3',
  ID: '10013151',
  LAPSED_DATE: 'null',
  LIC_NO: generateLicenceRef(),
  ORIG_EFF_DATE: '03/06/2005',
  REV_DATE: 'null'
}

module.exports = legacyLicenceFixture
