'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureLicence = require('../_fixtures/licence.js')
const FixtureVersions = require('../_fixtures/versions.js')

// Thing under test
const LegacyImportLicenceMapper =
  require('../../../../app/services/import/legacy-import/licence.mapper.js')

describe('Legacy import licence mapper', () => {
  let licence

  beforeEach(() => {
    licence = { ...FixtureLicence }
  })

  it('returns the matching agreements data', () => {
    const results = LegacyImportLicenceMapper.go(licence)

    expect(results).to.equal({
      licenceRef: licence.LIC_NO,
      startDate: '2005-06-03',
      waterUndertaker: false,
      regions: {
        historicalAreaCode: 'RIDIN',
        regionalChargeArea: 'Yorkshire',
        standardUnitChargeCode: 'YORKI',
        localEnvironmentAgencyPlanCode: 'AIREL'
      },
      naldRegionId: 3,
      expiredDate: '2015-03-31',
      lapsedDate: null,
      revokedDate: null

    })
  })

  describe('licence', () => {
    describe('the "expiredDate" property', () => {
      describe('when the licence has an expiry date', () => {
        it('returns the licence expired date in the ISO format', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.expiredDate).to.equal('2015-03-31')
        })
      })

      describe('when the licence does not have an expiry date', () => {
        beforeEach(() => {
          licence.EXPIRY_DATE = 'null'
        })
        it('returns null', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.expiredDate).to.be.null()
        })
      })
    })

    describe('the "lapsedDate" property', () => {
      describe('when the licence has an lapsed date', () => {
        beforeEach(() => {
          licence.LAPSED_DATE = '01/09/2006'
        })

        it('returns the licence expired date in the ISO format', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.lapsedDate).to.equal('2006-09-01')
        })
      })

      describe('when the licence does not have an lapsed date', () => {
        it('returns null', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.lapsedDate).to.be.null()
        })
      })
    })

    describe('the "licenceRef" property', () => {
      it('returns licence ref from the licence LIC_NO', () => {
        const result = LegacyImportLicenceMapper.go(licence)

        expect(result.licenceRef).to.equal(licence.LIC_NO)
      })
    })

    describe('the "naldRegionId" property', () => {
      it('returns the FGAC_REGION_CODE as an integer assigned to naldRegionId', () => {
        const result = LegacyImportLicenceMapper.go(licence)

        expect(result.naldRegionId).to.equal(3)
      })
    })

    describe('the "regions" property', () => {
      it('returns region', () => {
        const result = LegacyImportLicenceMapper.go(licence)

        expect(result.regions).to.equal({
          historicalAreaCode: 'RIDIN',
          regionalChargeArea: 'Yorkshire',
          standardUnitChargeCode: 'YORKI',
          localEnvironmentAgencyPlanCode: 'AIREL'
        })
      })
    })

    describe('the "revokedDate" property', () => {
      describe('when the licence has an revoked date', () => {
        beforeEach(() => {
          licence.REV_DATE = '01/09/2006'
        })

        it('returns the licence revoked date in the ISO format', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.revokedDate).to.equal('2006-09-01')
        })
      })

      describe('when the licence does not have an revoked date', () => {
        it('returns null', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.revokedDate).to.be.null()
        })
      })
    })

    describe('the "startDate" property', () => {
      describe('when the licence has ORIG_EFF_DATE', () => {
        it('returns ORIG_EFF_DATE as the start date in the correct format', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.startDate).to.equal('2005-06-03')
        })
      })
      describe('when the licence ORIG_EFF_DATE is null', () => {
        beforeEach(() => {
          licence.ORIG_EFF_DATE = 'null'
        })

        describe('then start date of the earliest non-draft licence version is used', () => {
          it('returns the start date in the ISO format', () => {
            //  need to add licence versions
            const result = LegacyImportLicenceMapper.go(licence, FixtureVersions)

            expect(result.startDate).to.equal('2005-06-05')
          })
        })
      })
    })

    describe('the "waterUndertaker" property', () => {
      describe('when the licence AREP_EIUC_CODE ends with "SWC" ', () => {
        beforeEach(() => {
          licence.AREP_EIUC_CODE = 'ANSWC'
        })

        it('returns waterUndertaker as true', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.waterUndertaker).to.be.true()
        })
      })

      describe('when the licence AREP_EIUC_CODE does not end with "SWC" ', () => {
        it('returns waterUndertaker as false', () => {
          const result = LegacyImportLicenceMapper.go(licence)

          expect(result.waterUndertaker).to.be.false()
        })
      })
    })
  })
})
