'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceSupplementaryYearHelper = require('../../support/helpers/licence-supplementary-year.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const FlagForSupplementaryBillingService = require('../../../app/services/import/flag-for-supplementary-billing.service.js')

describe('Flag For Supplementary Billing service', () => {
  let transformedLicence
  let wrlsLicence
  let licence
  let clock
  let testDate

  beforeEach(async () => {
    licence = await LicenceHelper.add()
    // The service being tested will only flag licence that have charge versions in the previous 6 years.
    // Because of this, the current time needs to be stubbed so these tests don't break in the future.
    testDate = new Date('2025-03-31')

    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when given a wrls licence with pre sroc charge versions', () => {
    describe('and a nald licence with an expired date', () => {
      beforeEach(() => {
        transformedLicence = {
          revokedDate: null,
          lapsedDate: null,
          expiredDate: new Date('2024-03-31')
        }
      })

      describe('that is different to the wrls licence', () => {
        describe('and the licence is not already flagged for pre sroc billing', () => {
          beforeEach(() => {
            wrlsLicence = _wrlsPreSrocLicence(licence)
          })

          it('sets the nald licence supplementary flags correctly', async () => {
            await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

            expect(transformedLicence.includeInPresrocBilling).to.equal('yes')
            expect(transformedLicence.includeInSrocBilling).to.equal(false)
            expect(transformedLicence.licenceSupplementaryYears).to.equal([])
          })
        })

        describe('and the licence is already flagged for pre sroc billing', () => {
          beforeEach(() => {
            wrlsLicence = _wrlsPreSrocLicence(licence)
            wrlsLicence.includeInPresrocBilling = 'yes'
            wrlsLicence.includeInSrocBilling = true
          })

          it('sets the nald licence supplementary flags correctly', async () => {
            await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

            expect(transformedLicence.includeInPresrocBilling).to.equal('yes')
            expect(transformedLicence.includeInSrocBilling).to.equal(true)
            expect(transformedLicence.licenceSupplementaryYears).to.equal([])
          })
        })
      })

      describe('thats the same to the wrls licence', () => {
        beforeEach(() => {
          wrlsLicence = _wrlsPreSrocLicence(licence)
          wrlsLicence.expiredDate = new Date('2024-03-31')
        })

        it('sets the nald licence supplementary flags correctly', async () => {
          await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

          expect(transformedLicence.includeInPresrocBilling).to.equal('no')
          expect(transformedLicence.includeInSrocBilling).to.equal(false)
          expect(transformedLicence.licenceSupplementaryYears).to.equal([])
        })
      })
    })
  })

  describe('when given a wrls licence with sroc charge versions', () => {
    describe('and a nald licence with an lapsed date', () => {
      beforeEach(() => {
        transformedLicence = {
          revokedDate: null,
          lapsedDate: new Date('2024-04-01'),
          expiredDate: null
        }
      })

      describe('that is different to the wrls licence', () => {
        describe('and the licence is not already flagged for sroc billing', () => {
          beforeEach(() => {
            wrlsLicence = _wrlsSrocLicence(licence)
          })

          it('sets the nald licence supplementary flags correctly', async () => {
            await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

            expect(transformedLicence.includeInPresrocBilling).to.equal('no')
            expect(transformedLicence.includeInSrocBilling).to.equal(true)
            expect(transformedLicence.licenceSupplementaryYears).to.equal([])
          })
        })

        describe('and the licence is already flagged for sroc billing', () => {
          beforeEach(() => {
            wrlsLicence = _wrlsSrocLicence(licence)
            wrlsLicence.includeInSrocBilling = true
          })

          it('sets the nald licence supplementary flags correctly', async () => {
            await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

            expect(transformedLicence.includeInPresrocBilling).to.equal('no')
            expect(transformedLicence.includeInSrocBilling).to.equal(true)
            expect(transformedLicence.licenceSupplementaryYears).to.equal([])
          })
        })
      })

      describe('thats the same to the wrls licence', () => {
        beforeEach(() => {
          wrlsLicence = _wrlsSrocLicence(licence)
          wrlsLicence.lapsedDate = new Date('2024-04-01')
        })

        it('sets the nald licence supplementary flags correctly', async () => {
          await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

          expect(transformedLicence.includeInPresrocBilling).to.equal('no')
          expect(transformedLicence.includeInSrocBilling).to.equal(false)
          expect(transformedLicence.licenceSupplementaryYears).to.equal([])
        })
      })
    })
  })

  describe('when given a wrls licence with two-part tariff sroc charge versions', () => {
    describe('and a nald licence with a revoked date', () => {
      beforeEach(() => {
        transformedLicence = {
          revokedDate: new Date('2024-04-01'),
          lapsedDate: null,
          expiredDate: null
        }
      })

      describe('that is different to the wrls licence', () => {
        describe('and the licence is not already flagged for two-part tariff billing', () => {
          beforeEach(() => {
            wrlsLicence = _wrlsSrocTwoPartTariffLicence(licence)
          })

          it('sets the nald licence supplementary flags correctly', async () => {
            await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

            expect(transformedLicence.includeInPresrocBilling).to.equal('no')
            expect(transformedLicence.includeInSrocBilling).to.equal(false)
            expect(transformedLicence.licenceSupplementaryYears).to.equal([
              {
                financialYearEnd: 2023,
                licenceId: licence.id,
                twoPartTariff: true
              },
              {
                financialYearEnd: 2024,
                licenceId: licence.id,
                twoPartTariff: true
              },
              {
                financialYearEnd: 2025,
                licenceId: licence.id,
                twoPartTariff: true
              }
            ])
          })
        })

        describe('and the licence is already flagged for two-part tariff billing', () => {
          beforeEach(async () => {
            wrlsLicence = _wrlsSrocTwoPartTariffLicence(licence)
            wrlsLicence.chargeVersions[0].endDate = null

            await LicenceSupplementaryYearHelper.add({
              licenceId: licence.id,
              financialYearEnd: 2023,
              twoPartTariff: true
            })
          })

          it('sets the nald licence supplementary flags correctly', async () => {
            await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

            expect(transformedLicence.includeInPresrocBilling).to.equal('no')
            expect(transformedLicence.includeInSrocBilling).to.equal(false)
            expect(transformedLicence.licenceSupplementaryYears).to.equal([
              {
                financialYearEnd: 2024,
                licenceId: licence.id,
                twoPartTariff: true
              },
              {
                financialYearEnd: 2025,
                licenceId: licence.id,
                twoPartTariff: true
              }
            ])
          })
        })
      })

      describe('thats the same to the wrls licence', () => {
        beforeEach(() => {
          wrlsLicence = _wrlsSrocTwoPartTariffLicence(licence)
          wrlsLicence.revokedDate = new Date('2024-04-01')
        })

        it('sets the nald licence supplementary flags correctly', async () => {
          await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

          expect(transformedLicence.includeInPresrocBilling).to.equal('no')
          expect(transformedLicence.includeInSrocBilling).to.equal(false)
          expect(transformedLicence.licenceSupplementaryYears).to.equal([])
        })
      })
    })

    describe('when the nald licence has a revoked date older than 6 years', () => {
      beforeEach(() => {
        transformedLicence = {
          revokedDate: new Date('2010-04-01'),
          lapsedDate: null,
          expiredDate: null
        }

        wrlsLicence = _wrlsPreSrocLicence(licence)
      })

      it('sets the nald licence supplementary flags correctly', async () => {
        await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

        expect(transformedLicence.includeInPresrocBilling).to.equal('no')
        expect(transformedLicence.includeInSrocBilling).to.equal(false)
        expect(transformedLicence.licenceSupplementaryYears).to.equal([])
      })
    })

    describe('when the nald licence has a revoked date set for after the current financial year', () => {
      beforeEach(() => {
        transformedLicence = {
          revokedDate: new Date('2025-04-01'),
          lapsedDate: null,
          expiredDate: null
        }

        wrlsLicence = _wrlsPreSrocLicence(licence)
      })

      it('sets the nald licence supplementary flags correctly', async () => {
        await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)

        expect(transformedLicence.includeInPresrocBilling).to.equal('no')
        expect(transformedLicence.includeInSrocBilling).to.equal(false)
        expect(transformedLicence.licenceSupplementaryYears).to.equal([])
      })
    })
  })
})

function _wrlsPreSrocLicence (licence) {
  return {
    id: licence.id,
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

function _wrlsSrocLicence (licence) {
  return {
    id: licence.id,
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    revokedDate: null,
    lapsedDate: null,
    expiredDate: null,
    chargeVersions: [
      {
        id: '3a7b82d7-826c-42de-8f23-a6f5f8624fdc',
        startDate: new Date('2022-04-01'),
        endDate: null,
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

function _wrlsSrocTwoPartTariffLicence (licence) {
  return {
    id: licence.id,
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    revokedDate: null,
    lapsedDate: null,
    expiredDate: null,
    chargeVersions: [
      {
        id: '3a7b82d7-826c-42de-8f23-a6f5f8624fdc',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2025-03-31'),
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
