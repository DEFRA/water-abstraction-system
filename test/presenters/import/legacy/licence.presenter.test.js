'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureLegacyLicence = require('../../../services/import/_fixtures/legacy-licence.fixture.js')
const FixtureLegacyLicenceVersion = require('../../../services/import/_fixtures/legacy-licence-version.fixture.js')

// Thing under test
const LicencePresenter =
  require('../../../../app/presenters/import/legacy/licence.presenter.js')

describe('Import legacy licence presenter', () => {
  let licence

  beforeEach(() => {
    licence = { ...FixtureLegacyLicence.create() }
  })

  it('returns the matching agreements data', () => {
    const results = LicencePresenter.go(licence)

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
          const result = LicencePresenter.go(licence)

          expect(result.expiredDate).to.equal('2015-03-31')
        })
      })

      describe('when the licence does not have an expiry date', () => {
        beforeEach(() => {
          licence.EXPIRY_DATE = 'null'
        })
        it('returns null', () => {
          const result = LicencePresenter.go(licence)

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
          const result = LicencePresenter.go(licence)

          expect(result.lapsedDate).to.equal('2006-09-01')
        })
      })

      describe('when the licence does not have an lapsed date', () => {
        it('returns null', () => {
          const result = LicencePresenter.go(licence)

          expect(result.lapsedDate).to.be.null()
        })
      })
    })

    describe('the "licenceRef" property', () => {
      it('returns licence ref from the licence LIC_NO', () => {
        const result = LicencePresenter.go(licence)

        expect(result.licenceRef).to.equal(licence.LIC_NO)
      })
    })

    describe('the "naldRegionId" property', () => {
      it('returns the FGAC_REGION_CODE as an integer assigned to naldRegionId', () => {
        const result = LicencePresenter.go(licence)

        expect(result.naldRegionId).to.equal(3)
      })
    })

    describe('the "regions" property', () => {
      it('returns region', () => {
        const result = LicencePresenter.go(licence)

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
          const result = LicencePresenter.go(licence)

          expect(result.revokedDate).to.equal('2006-09-01')
        })
      })

      describe('when the licence does not have an revoked date', () => {
        it('returns null', () => {
          const result = LicencePresenter.go(licence)

          expect(result.revokedDate).to.be.null()
        })
      })
    })

    describe('the "startDate" property', () => {
      describe('when the licence has ORIG_EFF_DATE', () => {
        it('returns ORIG_EFF_DATE as the start date in the correct format', () => {
          const result = LicencePresenter.go(licence)

          expect(result.startDate).to.equal('2005-06-03')
        })
      })
      describe('when the licence ORIG_EFF_DATE is null', () => {
        let licenceVersions

        beforeEach(() => {
          licence.ORIG_EFF_DATE = 'null'

          licenceVersions = [
            { ...FixtureLegacyLicenceVersion.create(), EFF_ST_DATE: '07/07/2001' },
            // This licence version should be used by the sort as it is the earliest
            { ...FixtureLegacyLicenceVersion.create(), EFF_ST_DATE: '01/01/2001' }
          ]
        })

        describe('then start date of the earliest non-draft licence version is used', () => {
          it('returns the start date in the ISO format', () => {
            const result = LicencePresenter.go(licence, licenceVersions)

            expect(result.startDate).to.equal('2001-01-01')
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
          const result = LicencePresenter.go(licence)

          expect(result.waterUndertaker).to.be.true()
        })
      })

      describe('when the licence AREP_EIUC_CODE does not end with "SWC" ', () => {
        it('returns waterUndertaker as false', () => {
          const result = LicencePresenter.go(licence)

          expect(result.waterUndertaker).to.be.false()
        })
      })
    })
  })
})
