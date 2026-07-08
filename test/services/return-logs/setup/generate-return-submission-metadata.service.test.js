'use strict'

// Thing under test
const GenerateReturnSubmissionMetadataService = require('../../../../app/services/return-logs/setup/generate-return-submission-metadata.service.js')

describe('Return Logs Setup - Generate Return Submission Metadata', () => {
  let sessionData

  beforeEach(() => {
    sessionData = {
      lines: [],
      meterProvided: 'no',
      reported: 'abstractionVolumes',
      singleVolume: false,
      units: 'cubicMetres',
      unitSymbol: 'm³'
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
      const result = GenerateReturnSubmissionMetadataService(sessionData)

      expect(result).toEqual({})
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
        { ...sessionData, units: 'cubicMetres', unitSymbol: 'm³' },
        { ...sessionData, units: 'litres', unitSymbol: 'l' },
        { ...sessionData, units: 'megalitres', unitSymbol: 'Ml' },
        { ...sessionData, units: 'gallons', unitSymbol: 'gal' }
      ]

      const results = sessionDataToTest.map((session) => {
        return GenerateReturnSubmissionMetadataService(session).units
      })

      expect(results).toEqual(['m³', 'l', 'Ml', 'gal'])
    })

    describe('and session.reported is abstractionVolumes', () => {
      beforeEach(() => {
        sessionData.reported = 'abstractionVolumes'
      })

      it('sets method as abstractionVolumes', () => {
        const result = GenerateReturnSubmissionMetadataService(sessionData)

        expect(result.method).toEqual('abstractionVolumes')
      })

      describe('and meter details are provided', () => {
        beforeEach(() => {
          sessionData.meterProvided = 'yes'
          sessionData.meterMake = 'MAKE'
          sessionData.meterSerialNumber = 'SERIAL'
          sessionData.meter10TimesDisplay = 'no'
        })

        it('correctly populates meters array with details', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.meters).toEqual([
            {
              multiplier: 1,
              manufacturer: 'MAKE',
              serialNumber: 'SERIAL',
              meterDetailsProvided: true
            }
          ])
        })

        it('sets type as measured', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.type).toEqual('measured')
        })
      })

      describe('and meter details are not provided', () => {
        beforeEach(() => {
          sessionData.meterProvided = 'no'
        })

        it('correctly sets meters array as empty', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.meters).toEqual([])
        })

        it('sets type as estimated', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.type).toEqual('estimated')
        })
      })

      describe('and session.singleVolume is true', () => {
        beforeEach(() => {
          sessionData.singleVolume = true
          sessionData.singleVolumeQuantity = 12345
        })

        it('sets totalFlag to true', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.totalFlag).toEqual(true)
        })

        it('sets total as session.singleVolumeQuantity', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.total).toEqual(12345)
        })

        describe('and session.periodDateUsedOptions is custom-dates', () => {
          beforeEach(() => {
            sessionData.periodDateUsedOptions = 'custom-dates'
            sessionData.fromFullDate = '2025-01-01'
            sessionData.toFullDate = '2025-12-31'
          })

          it('sets totalCustomDates as true', () => {
            const result = GenerateReturnSubmissionMetadataService(sessionData)

            expect(result.totalCustomDates).toEqual(true)
          })

          it('sets totalCustomDateStart to fromFullDate', () => {
            const result = GenerateReturnSubmissionMetadataService(sessionData)

            expect(result.totalCustomDateStart).toEqual('2025-01-01')
          })

          it('sets totalCustomDateEnd to toFullDate', () => {
            const result = GenerateReturnSubmissionMetadataService(sessionData)

            expect(result.totalCustomDateEnd).toEqual('2025-12-31')
          })
        })

        describe('and session.periodDateUsedOptions is not custom-dates', () => {
          beforeEach(() => {
            sessionData.periodDateUsedOptions = 'default'
          })

          it('sets totalCustomDates as false', () => {
            const result = GenerateReturnSubmissionMetadataService(sessionData)

            expect(result.totalCustomDates).toEqual(false)
          })

          it('does not include totalCustomDateStart or totalCustomEndDate', () => {
            const result = GenerateReturnSubmissionMetadataService(sessionData)

            expect(result.totalCustomDateStart).toBeUndefined()
            expect(result.totalCustomDateEnd).toBeUndefined()
          })
        })
      })

      describe('and session.singleVolume is false', () => {
        beforeEach(() => {
          sessionData.singleVolume = false
        })

        it('sets totalFlag to false', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.totalFlag).toEqual(false)
        })

        it('does not include total, totalCustomDateStart or totalCustomEndDate', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.total).toBeUndefined()
          expect(result.totalCustomDateStart).toBeUndefined()
          expect(result.totalCustomDateEnd).toBeUndefined()
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
        const result = GenerateReturnSubmissionMetadataService(sessionData)

        expect(result.method).toEqual('oneMeter')
      })

      describe('and meter details are provided', () => {
        beforeEach(() => {
          sessionData.meterProvided = 'yes'
          sessionData.meterMake = 'MAKE'
          sessionData.meterSerialNumber = 'SERIAL'
          sessionData.meter10TimesDisplay = 'no'
        })

        it('sets type as measured', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.type).toEqual('measured')
        })

        it('returns the expected meter array', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.meters).toEqual([
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
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.type).toEqual('measured')
        })

        it('returns the expected meter array', () => {
          const result = GenerateReturnSubmissionMetadataService(sessionData)

          expect(result.meters).toEqual([
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
