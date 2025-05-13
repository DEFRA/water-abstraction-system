'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const GenerateReturnSubmissionMetadataService = require('../../../../app/services/return-logs/setup/generate-return-submission-metadata.service.js')

describe('Return Logs Setup - Generate Return Submission Metadata', () => {
  let sessionData

  beforeEach(() => {
    sessionData = {
      reported: 'abstraction-volumes',
      units: 'cubic-metres',
      singleVolume: false,
      meterProvided: 'no'
    }
  })

  describe('when this is a nil return', () => {
    beforeEach(() => {
      sessionData.journey = 'nil-return'
    })

    it('returns an empty object', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result).to.equal({})
    })
  })

  describe('when this is not a nil return', () => {
    beforeEach(() => {
      sessionData.journey = 'enter-return'
    })

    it('correctly sets units', () => {
      const sessionDataToTest = [
        { ...sessionData, units: 'cubic-metres' },
        { ...sessionData, units: 'litres' },
        { ...sessionData, units: 'megalitres' },
        { ...sessionData, units: 'gallons' }
      ]

      const results = sessionDataToTest.map((session) => {
        return GenerateReturnSubmissionMetadataService.go(session).units
      })

      expect(results).to.equal(['m³', 'l', 'Ml', 'gal'])
    })

    describe('and session.reported is abstraction-volumes', () => {
      beforeEach(() => {
        sessionData.reported = 'abstraction-volumes'
      })

      it('sets method as abstractionVolumes', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.method).to.equal('abstractionVolumes')
      })
    })

    describe('and session.reported is not abstraction-volumes', () => {
      beforeEach(() => {
        sessionData.reported = 'meter-readings'
      })

      it('sets method as oneMeter', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.method).to.equal('oneMeter')
      })
    })

    describe('and session.singleVolume is true', () => {
      beforeEach(() => {
        sessionData.singleVolume = true
        sessionData.singleVolumeQuantity = 12345
      })

      it('sets totalFlag to true', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.totalFlag).to.equal(true)
      })

      it('sets total as session.singleVolumeQuantity', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.total).to.equal(12345)
      })

      describe('and session.periodDateUsedOptions is custom-dates', () => {
        beforeEach(() => {
          sessionData.periodDateUsedOptions = 'custom-dates'
          sessionData.fromFullDate = '2023-01-01'
          sessionData.toFullDate = '2023-12-31'
        })

        it('sets totalCustomDates as true', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.totalCustomDates).to.equal(true)
        })

        it('sets totalCustomDateStart to fromFullDate', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.totalCustomDateStart).to.equal('2023-01-01')
        })

        it('sets totalCustomDateEnd to toFullDate', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.totalCustomDateEnd).to.equal('2023-12-31')
        })
      })

      describe('and session.periodDateUsedOptions is not custom-dates', () => {
        beforeEach(() => {
          sessionData.periodDateUsedOptions = 'default'
        })

        it('sets totalCustomDates as false', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.totalCustomDates).to.equal(false)
        })

        it('does not include totalCustomDateStart or totalCustomEndDate', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.totalCustomDateStart).to.be.undefined()
          expect(result.totalCustomDateEnd).to.be.undefined()
        })
      })
    })

    describe('and session.singleVolume is false', () => {
      beforeEach(() => {
        sessionData.singleVolume = false
      })

      it('sets totalFlag to false', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.totalFlag).to.equal(false)
      })

      it('does not include total, totalCustomDateStart or totalCustomEndDate', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.total).to.be.undefined()
        expect(result.totalCustomDateStart).to.be.undefined()
        expect(result.totalCustomDateEnd).to.be.undefined()
      })
    })

    describe('and session.meterProvided is no', () => {
      beforeEach(() => {
        sessionData.meterProvided = 'no'
      })

      it('sets type as estimated', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.type).to.equal('estimated')
      })

      it('returns an empty array for meters', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.meters).to.equal([])
      })
    })

    describe('and session.meterProvided is yes', () => {
      beforeEach(() => {
        sessionData.meterProvided = 'yes'
        sessionData.meterMake = 'Make'
        sessionData.meterSerialNumber = '123456789'
        sessionData.startReading = 1000
        sessionData.meter10TimesDisplay = 'no'
        sessionData.lines = [
          {
            startDate: '2023-01-01',
            endDate: '2023-01-31',
            quantity: 100,
            reading: 1100
          },
          {
            startDate: '2023-02-01',
            endDate: '2023-02-28',
            quantity: 200,
            reading: 1300
          }
        ]
      })

      it('sets type as measured', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.type).to.equal('measured')
      })

      it('returns an array with meter details', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.meters).to.equal([
          {
            units: 'm³',
            meterDetailsProvided: true,
            multiplier: 1,
            manufacturer: 'Make',
            serialNumber: '123456789',
            startReading: 1000,
            readings: {
              '2023-01-01_2023-01-31': 1100,
              '2023-02-01_2023-02-28': 1300
            }
          }
        ])
      })

      describe('and there are no readings', () => {
        beforeEach(() => {
          sessionData.lines = []
        })

        it('returns an empty array for readings', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.meters[0].readings).to.equal({})
        })

        it('does not include the units', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.meters[0].units).to.be.undefined()
        })
      })
    })
  })
})
