'use strict'

/**
 * @module PermitLicenceHelper
 */

const PermitLicenceModel = require('../../../app/models/permit-licence.model.js')
const { generateLicenceRef } = require('./licence.helper.js')

/**
 * Add a new licence into the licence table in the permit schema
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceStatusId` - 1
 * - `licenceTypeId` - 8
 * - `licenceRegimeId` - 1
 * - `licenceRef` - [randomly generated - 01/123]
 * - `licenceDataValue` - large JSON blob. See _licenceDataValue() for details
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:PermitLicenceModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return PermitLicenceModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults (data = {}) {
  const licenceRef = data.licenceRef ? data.licenceRef : generateLicenceRef()
  const defaults = {
    licenceStatusId: 1,
    licenceTypeId: 8,
    licenceRef,
    licenceRegimeId: 1,
    licenceDataValue: _licenceDataValue(licenceRef)
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * In real life, when a licence is imported from NALD into WRLS a number of records get created. A lot of it is
 * duplication, but not everything from NALD is put into tables.
 *
 * This seems to stem from an early architectural decision that WRLS would be building a generic 'permit' repository.
 * Some top level information is captured in `permit.licence`. But because it needed to be 'generic' everything
 * (everything 😱) from NALD gets dumped into the JSONB field `licence_data_value`. The problem is, when the previous
 * team built a feature that needed info only held in `licence_data_value`, rather than put it into a table, they just
 * dipped into the JSON. And they did this again, and again, and again!
 *
 * You cannot load a licence in the UI without having this field properly populated. And that means it'll block our
 * acceptance tests if we don't put something 'real' into it.
 *
 * This was the NALD dump the legacy acceptance test data loading solution used. It doesn't matter that the data
 * included doesn't match with the related licence and other records. The critical factor is the structure must align
 * with what the legacy apps expect.
 * @param licenceRef
 */
function _licenceDataValue (licenceRef) {
  return {
    ID: '9000000',
    data: {
      cams: [],
      roles: [
        {
          array: [
            {
              CODE: 'WP',
              DESCR: 'Work Phone',
              CONT_NO: '01234 567 567',
              ACON_AADD_ID: '9000020',
              ACON_APAR_ID: '9999999',
              FGAC_REGION_CODE: '6'
            }
          ],
          role_type: {
            CODE: 'EO',
            DESCR: 'Enforcement Officer'
          },
          role_party: {
            ID: '9999999',
            NAME: 'Test',
            DESCR: 'Test role description',
            FORENAME: 'Test role first name',
            INITIALS: 'N',
            APAR_TYPE: 'PER',
            SALUTATION: 'Ms'
          },
          role_detail: {
            ID: '9000004',
            EFF_ST_DATE: '01/04/2022',
            ACON_AADD_ID: '9000020',
            ACON_APAR_ID: '9999999',
            EFF_END_DATE: '01/04/2023'
          },
          role_address: {
            ID: '9000022',
            TOWN: 'Test town',
            COUNTY: 'Test county',
            COUNTRY: 'null',
            POSTCODE: 'AT1 1AT',
            ADDR_LINE1: 'Test address line 1',
            ADDR_LINE2: 'Test address line 2',
            ADDR_LINE3: 'Test address line 3',
            ADDR_LINE4: 'Test address line 4',
            FGAC_REGION_CODE: '9'
          }
        }
      ],
      purposes: [
        {
          ID: '9000007',
          LANDS: 'Boldly outlined on map',
          NOTES: 'null',
          purpose: [
            {
              purpose_primary: {
                CODE: 'P',
                DESCR: 'Production Of Energy'
              },
              purpose_tertiary: {
                CODE: '80',
                DESCR: 'Evaporative Cooling',
                ALSF_CODE: 'H'
              },
              purpose_secondary: {
                CODE: 'ELC',
                DESCR: 'Electricity'
              }
            }
          ],
          INST_QTY: '12',
          DAILY_QTY: '123',
          ANNUAL_QTY: '12345',
          HOURLY_QTY: '12',
          PERIOD_ST_DAY: '1',
          purposePoints: [
            {
              NOTES: 'null',
              point_detail: {
                ID: '90000012',
                NGR1_EAST: '1234',
                LOCAL_NAME: 'Test purpose local name',
                NGR1_NORTH: '1234',
                NGR1_SHEET: 'TQ',
                FGAC_REGION_CODE: '9'
              },
              point_source: {
                CODE: 'ABC',
                NAME: 'Test source name',
                NOTES: 'Test source notes',
                CART_NORTH: '1234',
                LOCAL_NAME: 'Test local name',
                FGAC_REGION_CODE: '9'
              },
              FGAC_REGION_CODE: '9',
              means_of_abstraction: {
                CODE: 'ABC',
                DESCR: 'Test means of abstraction',
                NOTES: 'null'
              }
            }
          ],
          APUR_APPR_CODE: 'P',
          APUR_APSE_CODE: 'ELC',
          APUR_APUS_CODE: '80',
          PERIOD_END_DAY: '31',
          PERIOD_ST_MONTH: '1',
          TIMELTD_ST_DATE: 'null',
          FGAC_REGION_CODE: '9',
          PERIOD_END_MONTH: '12',
          TIMELTD_END_DATE: 'null',
          licenceAgreements: [],
          licenceConditions: []
        }
      ],
      versions: [
        {
          APP_NO: licenceRef,
          STATUS: 'CURR',
          INCR_NO: '0',
          parties: [
            {
              ID: '9999999',
              NAME: 'Test party name',
              DESCR: 'null',
              FORENAME: 'null',
              INITIALS: 'null',
              contacts: [
                {
                  AADD_ID: '9000020',
                  APAR_ID: '9999999',
                  party_address: {
                    ID: '9000022',
                    TOWN: 'Test town',
                    COUNTY: 'Test county',
                    COUNTRY: 'null',
                    POSTCODE: 'AT1 1AT',
                    ADDR_LINE1: 'Test address line 1',
                    ADDR_LINE2: 'Test address line 2',
                    ADDR_LINE3: 'Test address line 3',
                    ADDR_LINE4: 'Test address line 4',
                    FGAC_REGION_CODE: '9'
                  },
                  FGAC_REGION_CODE: '9'
                }
              ],
              APAR_TYPE: 'ORG',
              LOCAL_NAME: 'null',
              SALUTATION: 'null',
              FGAC_REGION_CODE: '9'
            }
          ],
          ISSUE_NO: '100',
          EFF_ST_DATE: '01/04/2022',
          RETURNS_REQ: 'Y',
          ACON_AADD_ID: '9000020',
          ACON_APAR_ID: '9999999',
          EFF_END_DATE: '01/04/2023',
          LIC_SIG_DATE: '01/04/2022',
          FGAC_REGION_CODE: '9'
        }
      ],
      current_version: {
        party: {
          ID: '9999999',
          NAME: 'Testing',
          DESCR: 'null',
          FORENAME: 'null',
          INITIALS: 'null',
          APAR_TYPE: 'ORG',
          LOCAL_NAME: 'null',
          SALUTATION: 'null',
          FGAC_REGION_CODE: '9',
          ASIC_ASID_DIVISION: 'null'
        },
        address: {
          ID: '9000022',
          TOWN: 'Test town',
          COUNTY: 'Test county',
          COUNTRY: 'null',
          POSTCODE: 'AT1 1AT',
          ADDR_LINE1: 'Test address line 1',
          ADDR_LINE2: 'Test address line 2',
          ADDR_LINE3: 'Test address line 3',
          ADDR_LINE4: 'Test address line 4',
          FGAC_REGION_CODE: '9'
        },
        formats: [
          {
            ID: '9000025',
            DESCR: 'Test format description',
            CC_IND: 'N',
            points: [
              {
                ID: '9000026',
                AADD_ID: '9000020',
                NGR1_EAST: '1234',
                LOCAL_NAME: 'Test point local name',
                NGR1_NORTH: '1234',
                NGR1_SHEET: 'TQ',
                FGAC_REGION_CODE: '9'
              }
            ],
            TPT_FLAG: 'N',
            purposes: [
              {
                ARTY_ID: '9000027',
                PURP_ALIAS: 'Evaporative Cooling',
                APUR_APPR_CODE: 'P',
                APUR_APSE_CODE: 'ELC',
                APUR_APUS_CODE: '80',
                primary_purpose: 'Production Of Energy',
                FGAC_REGION_CODE: '9',
                tertiary_purpose: 'Evaporative Cooling',
                secondary_purpose: 'Electricity'
              }
            ],
            ANNUAL_QTY: '1234',
            SITE_DESCR: 'Test site description',
            TIMELTD_ST_DATE: 'null',
            FGAC_REGION_CODE: '9',
            FORM_PRODN_MONTH: '10',
            TIMELTD_END_DATE: 'null',
            ABS_PERIOD_ST_DAY: '1',
            ABS_PERIOD_END_DAY: '31',
            ARTC_REC_FREQ_CODE: 'D',
            ARTC_RET_FREQ_CODE: 'A',
            FORMS_REQ_ALL_YEAR: 'Y',
            ABS_PERIOD_ST_MONTH: '1',
            ABS_PERIOD_END_MONTH: '12'
          }
        ],
        licence: {
          CODE: 'FULL',
          DESCR: 'Full Licence (>=28 Days)',
          party: [
            {
              ID: '9000029',
              NAME: 'Test party name',
              APAR_TYPE: 'ORG',
              FGAC_REGION_CODE: '9'
            }
          ],
          STATUS: 'CURR',
          INCR_NO: '0',
          ISSUE_NO: '100',
          EFF_ST_DATE: '01/04/2022',
          RETURNS_REQ: 'Y',
          ACON_AADD_ID: '9000020',
          ACON_APAR_ID: '9999999',
          EFF_END_DATE: 'null',
          LIC_SIG_DATE: '01/04/2022',
          FGAC_REGION_CODE: '9'
        },
        purposes: [
          {
            ID: '9000030',
            LANDS: 'Boldly outlined on map',
            NOTES: 'null',
            purpose: [
              {
                purpose_primary: {
                  CODE: 'P',
                  DESCR: 'Production Of Energy'
                },
                purpose_tertiary: {
                  CODE: '80',
                  DESCR: 'Evaporative Cooling',
                  ALSF_CODE: 'H'
                },
                purpose_secondary: {
                  CODE: 'ELC',
                  DESCR: 'Electricity'
                }
              }
            ],
            INST_QTY: '12',
            DAILY_QTY: '123',
            ANNUAL_QTY: '12345',
            HOURLY_QTY: '12',
            PERIOD_ST_DAY: '1',
            purposePoints: [
              {
                NOTES: 'null',
                point_detail: {
                  ID: '9000031',
                  AADD_ID: '9000020',
                  NGR1_EAST: '1234',
                  LOCAL_NAME: 'Test local name 1',
                  NGR1_NORTH: '1234',
                  NGR1_SHEET: 'TQ',
                  FGAC_REGION_CODE: '9'
                },
                point_source: {
                  CODE: 'ABC',
                  NAME: 'Test point source name 1',
                  NOTES: 'Test point source notes 1',
                  CART_NORTH: '1234',
                  LOCAL_NAME: 'Test local name 1',
                  FGAC_REGION_CODE: '9'
                },
                FGAC_REGION_CODE: '9',
                means_of_abstraction: {
                  CODE: 'UNP',
                  DESCR: 'Unspecified Pump 1'
                }
              },
              {
                NOTES: 'null',
                point_detail: {
                  ID: '9000032',
                  AADD_ID: '9000022',
                  NGR1_EAST: '5678',
                  LOCAL_NAME: 'Test local name 2',
                  NGR1_NORTH: '5678',
                  NGR1_SHEET: 'TT',
                  FGAC_REGION_CODE: '9'
                },
                point_source: {
                  CODE: 'DEF',
                  NAME: 'Test point source name 2',
                  NOTES: 'Test point source notes 2',
                  CART_NORTH: '5678',
                  LOCAL_NAME: 'Test local name 2',
                  FGAC_REGION_CODE: '9'
                },
                FGAC_REGION_CODE: '9',
                means_of_abstraction: {
                  CODE: 'UNP',
                  DESCR: 'Unspecified Pump 2'
                }
              }
            ],
            APUR_APPR_CODE: 'P',
            APUR_APSE_CODE: 'ELC',
            APUR_APUS_CODE: '80',
            PERIOD_END_DAY: '31',
            PERIOD_ST_MONTH: '1',
            TIMELTD_ST_DATE: 'null',
            FGAC_REGION_CODE: '9',
            PERIOD_END_MONTH: '12',
            TIMELTD_END_DATE: 'null',
            licenceAgreements: [],
            licenceConditions: []
          }
        ],
        expiry_date: '01/04/2023',
        version_effective_date: '20220401',
        original_effective_date: '20220401'
      }
    },
    NOTES: 'Licence notes',
    LIC_NO: licenceRef,
    REV_DATE: 'null',
    vmlVersion: 2,
    EXPIRY_DATE: '01/04/2023',
    LAPSED_DATE: 'null',
    ORIG_EFF_DATE: '01/04/2022',
    ORIG_SIG_DATE: '01/04/2022',
    FGAC_REGION_CODE: '9'
  }
}

module.exports = {
  add,
  defaults
}
