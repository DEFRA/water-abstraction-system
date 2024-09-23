'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchLicenceChargeVersionsService = require('../../../app/services/import/fetch-licence-charge-versions.service.js')

// Thing under test
const TransformLicenceSupplementaryFlagsService = require('../../../app/services/import/transform-licence-supplementary-flags.service.js')

describe('Transform Licence Supplementary Flags service', () => {
  describe('when given a valid nald licence and wrls licence id', () => {
    let wrlsLicenceId
    let transformedLicence

    beforeEach(async () => {
      const licence = await LicenceHelper.add()

      wrlsLicenceId = licence.id

      transformedLicence = {
        revokedDate: null,
        lapsedDate: null,
        expiredDate: new Date('2024-03-31')
      }
    })

    afterEach(() => {
      Sinon.restore()
    })

    describe('and the nald licence has a new expired date', () => {
      describe('and the licence has pre sroc charge versions', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLicenceChargeVersionsService, 'go').resolves(_preSrocLicence(wrlsLicenceId))
        })

        it('should flag the licence for pre sroc supplementary billing', async () => {
          await TransformLicenceSupplementaryFlagsService.go(transformedLicence, wrlsLicenceId)

          expect(transformedLicence.includeInSrocBilling).to.equal(false)
          expect(transformedLicence.includeInPresrocBilling).to.equal('yes')
          expect(transformedLicence.licenceSupplementaryYears).to.equal([])
        })
      })

      describe('and the licence has sroc charge versions', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLicenceChargeVersionsService, 'go').resolves(_srocLicence(wrlsLicenceId))
        })

        it('should flag the licence for sroc supplementary billing', async () => {
          await TransformLicenceSupplementaryFlagsService.go(transformedLicence, wrlsLicenceId)

          expect(transformedLicence.includeInSrocBilling).to.equal(true)
          expect(transformedLicence.includeInPresrocBilling).to.equal('no')
          expect(transformedLicence.licenceSupplementaryYears).to.equal([])
        })
      })

      describe('and the licence has two-part tariff charge versions', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLicenceChargeVersionsService, 'go').resolves(_twoPartTariffLicence(wrlsLicenceId))
        })

        it('should flag the licence for two-part tariff supplementary billing', async () => {
          await TransformLicenceSupplementaryFlagsService.go(transformedLicence, wrlsLicenceId)

          expect(transformedLicence.includeInSrocBilling).to.equal(false)
          expect(transformedLicence.includeInPresrocBilling).to.equal('no')
          expect(transformedLicence.licenceSupplementaryYears).to.equal([
            {
              financialYearEnd: 2023,
              twoPartTariff: true,
              licenceId: wrlsLicenceId
            },
            {
              financialYearEnd: 2024,
              twoPartTariff: true,
              licenceId: wrlsLicenceId
            }
          ])
        })
      })
    })

    describe('and the nald licence has no new expired date', () => {
      beforeEach(async () => {
        transformedLicence.expiredDate = null
        Sinon.stub(FetchLicenceChargeVersionsService, 'go').resolves(_preSrocLicence(wrlsLicenceId))
      })

      it('should not mark the licence for supplementary billing', async () => {
        await TransformLicenceSupplementaryFlagsService.go(transformedLicence, wrlsLicenceId)

        expect(transformedLicence.includeInSrocBilling).to.equal(false)
        expect(transformedLicence.includeInPresrocBilling).to.equal('no')
        expect(transformedLicence.licenceSupplementaryYears).to.equal([])
      })
    })
  })
})

function _preSrocLicence (id) {
  return {
    id,
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    revokedDate: null,
    lapsedDate: null,
    expiredDate: null,
    chargeVersions: [
      {
        id: '3a7b82d7-826c-42de-8f23-a6f5f8624fdc',
        startDate: new Date('2019-04-01'),
        endDate: new Date('2022-03-31'),
        chargeReferences: [{
          id: '4eac1d61-94e3-4582-94c6-d2fb3f13d348',
          s127: false,
          chargeElements: [{
            id: '83175dc5-a057-4def-942a-501ea520e383',
            section127Agreement: false
          }]
        }]
      }
    ]
  }
}

function _srocLicence (id) {
  return {
    id,
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    revokedDate: null,
    lapsedDate: null,
    expiredDate: null,
    chargeVersions: [
      {
        id: '3a7b82d7-826c-42de-8f23-a6f5f8624fdc',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2024-03-31'),
        chargeReferences: [{
          id: '4eac1d61-94e3-4582-94c6-d2fb3f13d348',
          s127: false,
          chargeElements: [{
            id: '83175dc5-a057-4def-942a-501ea520e383',
            section127Agreement: false
          }]
        }]
      }
    ]
  }
}

function _twoPartTariffLicence (id) {
  return {
    id,
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    revokedDate: null,
    lapsedDate: null,
    expiredDate: null,
    chargeVersions: [
      {
        id: '3a7b82d7-826c-42de-8f23-a6f5f8624fdc',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2024-03-31'),
        chargeReferences: [{
          id: '4eac1d61-94e3-4582-94c6-d2fb3f13d348',
          s127: 'true',
          chargeElements: [{
            id: '83175dc5-a057-4def-942a-501ea520e383',
            section127Agreement: true
          }]
        }]
      }
    ]
  }
}
