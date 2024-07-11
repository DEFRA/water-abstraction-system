'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureLicence = require('../../_fixtures/licence.js')

// Thing under test
const ImportServiceLicenceMapper =
  require('../../../../../app/services/import/mappers/import-service/licence.mapper.js')

describe.only('Fetch Agreements service', () => {
  let licence

  beforeEach(() => {
    licence = {
      licence: { ...FixtureLicence }
    }
  })

  it('returns the matching agreements data', () => {
    const results = ImportServiceLicenceMapper.go(licence)

    //  the language changes for a few - licence_ref for example
    //  only needed for the insert - region_id, licence_ref, is_water_undertaker, regions, start_date, expired_date, lapsed_date, revoked_date
    // and for the other items in persist - expiredDate, lapsedDate, revokedDate

    expect(results).to.equal({
      licence: {
        licenceRef: '2/27/15/359',
        startDate: '2005-06-03',
        endDate: '2015-03-31',
        documents: [],
        agreements: [],
        externalId: '3:10013151',
        isWaterUndertaker: false,
        regions: {
          historicalAreaCode: 'RIDIN',
          regionalChargeArea: 'Yorkshire',
          standardUnitChargeCode: 'YORKI',
          localEnvironmentAgencyPlanCode: 'AIREL'
        },
        regionCode: 3,
        expiredDate: '2015-03-31',
        lapsedDate: null,
        revokedDate: null,
        _nald: { ...FixtureLicence }
      }
    })
  })

  describe('licence', () => {
    describe('the "licenceRef" property', () => {
      it('returns licence ref from the licence LIC_NO', () => {
        const result = ImportServiceLicenceMapper.go(licence)

        expect(result.licence.licenceRef).to.equal(licence.licence.LIC_NO)
      })
    })
    describe('the "startDate" property', () => {
      describe('when the licence has ORIG_EFF_DATE', () => {
        it('returns ORIG_EFF_DATE as the start date in the correct format', () => {
          const result = ImportServiceLicenceMapper.go(licence)

          expect(result.licence.startDate).to.equal('2005-06-03')
        })
      })
      describe('when the licence ORIG_EFF_DATE is null', () => {
        beforeEach(() => {
          licence.licence.ORIG_EFF_DATE = null
        })
        describe('then start date of the earliest non-draft licence version is used', () => {
          it('returns the start date in the correct format', () => {
            //  need to add licence versions
            const result = ImportServiceLicenceMapper.go(licence)

            expect(result.licence.startDate).to.equal('2005-06-03')
          })
        })
      })
    })
  })

  it('returns _nald which should match the licence data to format', () => {
    const result = ImportServiceLicenceMapper.go(licence)

    expect(result.licence._nald).to.equal({ ...FixtureLicence })
  })
})
