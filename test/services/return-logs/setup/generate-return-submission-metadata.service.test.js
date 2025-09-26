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
      reported: 'abstractionVolumes',
      units: 'cubicMetres',
      singleVolume: false,
      meterProvided: 'no',
      lines: []
    }
  })

  describe('when this is a nil return', () => {
    beforeEach(() => {
      sessionData.journey = 'nilReturn'
      sessionData.lines.push(
        {
          startDate: '2025-03-01T00:00:00.000Z',
          endDate: '2025-03-31T00:00:00.000Z'
        },
        {
          startDate: '2025-04-01T00:00:00.000Z',
          endDate: '2025-04-30T00:00:00.000Z'
        }
      )
    })

    it('returns an empty object', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result).to.equal({})
    })
  })

  describe('when this is not a nil return', () => {
    beforeEach(() => {
      sessionData.journey = 'enterReturn'
      sessionData.lines.push(
        {
          startDate: '2025-03-01T00:00:00.000Z',
          endDate: '2025-03-31T00:00:00.000Z',
          reading: null,
          quantity: 1000
        },
        {
          startDate: '2025-04-01T00:00:00.000Z',
          endDate: '2025-04-30T00:00:00.000Z',
          reading: null,
          quantity: 4000
        }
      )
    })

    it('correctly sets units', () => {
      const sessionDataToTest = [
        { ...sessionData, units: 'cubicMetres' },
        { ...sessionData, units: 'litres' },
        { ...sessionData, units: 'megalitres' },
        { ...sessionData, units: 'gallons' }
      ]

      const results = sessionDataToTest.map((session) => {
        return GenerateReturnSubmissionMetadataService.go(session).units
      })

      expect(results).to.equal(['m³', 'l', 'Ml', 'gal'])
    })

    describe('and session.reported is abstractionVolumes', () => {
      beforeEach(() => {
        sessionData.reported = 'abstractionVolumes'
      })

      it('sets method as abstractionVolumes', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.method).to.equal('abstractionVolumes')
      })

      describe('and meter details are provided', () => {
        beforeEach(() => {
          sessionData.meterProvided = 'yes'
          sessionData.meterMake = 'MAKE'
          sessionData.meterSerialNumber = 'SERIAL'
          sessionData.meter10TimesDisplay = 'no'
        })

        it('correctly populates meters array with details', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.meters).to.equal([
            {
              multiplier: 1,
              manufacturer: 'MAKE',
              serialNumber: 'SERIAL',
              meterDetailsProvided: true
            }
          ])
        })

        it('sets type as measured', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.type).to.equal('measured')
        })
      })

      describe('and meter details are not provided', () => {
        beforeEach(() => {
          sessionData.meterProvided = 'no'
        })

        it('correctly sets meters array as empty', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.meters).to.equal([])
        })

        it('sets type as estimated', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.type).to.equal('estimated')
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
            sessionData.fromFullDate = '2025-01-01'
            sessionData.toFullDate = '2025-12-31'
          })

          it('sets totalCustomDates as true', () => {
            const result = GenerateReturnSubmissionMetadataService.go(sessionData)

            expect(result.totalCustomDates).to.equal(true)
          })

          it('sets totalCustomDateStart to fromFullDate', () => {
            const result = GenerateReturnSubmissionMetadataService.go(sessionData)

            expect(result.totalCustomDateStart).to.equal('2025-01-01')
          })

          it('sets totalCustomDateEnd to toFullDate', () => {
            const result = GenerateReturnSubmissionMetadataService.go(sessionData)

            expect(result.totalCustomDateEnd).to.equal('2025-12-31')
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
    })

    describe('and session.reported is meterReadings', () => {
      beforeEach(() => {
        sessionData.reported = 'meterReadings'
        sessionData.startReading = 250
        sessionData.lines[0].reading = 750
        sessionData.lines[1].reading = 3000
      })

      it('sets method as oneMeter', () => {
        const result = GenerateReturnSubmissionMetadataService.go(sessionData)

        expect(result.method).to.equal('oneMeter')
      })

      describe('and meter details are provided', () => {
        beforeEach(() => {
          sessionData.meterProvided = 'yes'
          sessionData.meterMake = 'MAKE'
          sessionData.meterSerialNumber = 'SERIAL'
          sessionData.meter10TimesDisplay = 'no'
        })

        it('sets type as measured', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.type).to.equal('measured')
        })

        it('returns the expected meter array', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.meters).to.equal([
            {
              units: 'm³',
              meterDetailsProvided: true,
              multiplier: 1,
              manufacturer: 'MAKE',
              serialNumber: 'SERIAL',
              startReading: 250,
              readings: {
                '2025-03-01_2025-03-31': 750,
                '2025-04-01_2025-04-30': 3000
              }
            }
          ])
        })
      })

      describe('and meter details are not provided', () => {
        beforeEach(() => {
          sessionData.meterProvided = 'no'
        })

        // This is consistent with the legacy code; only returns with volumes and no meter have type set to estimated
        it('sets type as measured', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.type).to.equal('measured')
        })

        it('returns the expected meter array', () => {
          const result = GenerateReturnSubmissionMetadataService.go(sessionData)

          expect(result.meters).to.equal([
            {
              units: 'm³',
              meterDetailsProvided: false,
              multiplier: 1,
              startReading: 250,
              readings: {
                '2025-03-01_2025-03-31': 750,
                '2025-04-01_2025-04-30': 3000
              }
            }
          ])
        })
      })
    })
  })
})
