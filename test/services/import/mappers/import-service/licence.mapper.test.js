'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureLicence = require('../../_fixtures/licence.js')
const FixtureVersions = require('../../_fixtures/versions.js')

// Thing under test
const ImportServiceLicenceMapper =
  require('../../../../../app/services/import/mappers/import-service/licence.mapper.js')

describe.only('Licence mapper', () => {
  let licence

  beforeEach(() => {
    licence = { ...FixtureLicence }
  })

  it('returns the matching agreements data', () => {
    const results = ImportServiceLicenceMapper.go(licence)

    expect(results).to.equal({
      licenceRef: '2/27/15/359',
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
    describe('the "licenceRef" property', () => {
      it('returns licence ref from the licence LIC_NO', () => {
        const result = ImportServiceLicenceMapper.go(licence)

        expect(result.licenceRef).to.equal(licence.LIC_NO)
      })
    })
    describe('the "startDate" property', () => {
      describe('when the licence has ORIG_EFF_DATE', () => {
        it('returns ORIG_EFF_DATE as the start date in the correct format', () => {
          const result = ImportServiceLicenceMapper.go(licence)

          expect(result.startDate).to.equal('2005-06-03')
        })
      })
      describe('when the licence ORIG_EFF_DATE is null', () => {
        beforeEach(() => {
          licence.ORIG_EFF_DATE = 'null'
        })

        describe('then start date of the earliest non-draft licence version is used', () => {
          it('returns the start date in the correct format', () => {
            //  need to add licence versions
            const result = ImportServiceLicenceMapper.go(licence, FixtureVersions)

            expect(result.startDate).to.equal('2005-06-05')
          })
        })
      })
    })
  })
})
