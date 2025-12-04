'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ApplyQuantitiesService = require('../../../../app/services/return-logs/setup/apply-quantities.service.js')

describe('Return Logs Setup - Update Quantities service', () => {
  let session

  describe('when called with meter readings', () => {
    describe('and the unit of measurement is cubic metres', () => {
      before(() => {
        session = {
          lines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              reading: 0,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              reading: 300,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ],
          meter10TimesDisplay: 'no',
          reported: 'meterReadings',
          startReading: 0,
          units: 'cubicMetres',
          unitSymbol: 'm³'
        }
      })

      it('updates the session data with the correct quantities', async () => {
        const result = await ApplyQuantitiesService.go(session)

        expect(result).to.equal({
          lines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              quantity: 0,
              quantityCubicMetres: 0,
              reading: 0,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              quantity: null,
              quantityCubicMetres: null,
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              quantity: 300,
              quantityCubicMetres: 300,
              reading: 300,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ],
          meter10TimesDisplay: 'no',
          reported: 'meterReadings',
          startReading: 0,
          units: 'cubicMetres',
          unitSymbol: 'm³'
        })
      })

      describe('and the start reading is 100', () => {
        before(() => {
          session = {
            lines: [
              {
                endDate: '2023-04-30T00:00:00.000Z',
                reading: 100,
                startDate: '2023-04-01T00:00:00.000Z'
              },
              {
                endDate: '2023-05-31T00:00:00.000Z',
                startDate: '2023-05-01T00:00:00.000Z'
              },
              {
                endDate: '2023-06-30T00:00:00.000Z',
                reading: 300,
                startDate: '2023-06-01T00:00:00.000Z'
              }
            ],
            meter10TimesDisplay: 'no',
            reported: 'meterReadings',
            startReading: 100,
            units: 'cubicMetres',
            unitSymbol: 'm³'
          }
        })

        it('updates the session data with the correct quantities', async () => {
          const result = await ApplyQuantitiesService.go(session)

          expect(result).to.equal({
            lines: [
              {
                endDate: '2023-04-30T00:00:00.000Z',
                quantity: 0,
                quantityCubicMetres: 0,
                reading: 100,
                startDate: '2023-04-01T00:00:00.000Z'
              },
              {
                endDate: '2023-05-31T00:00:00.000Z',
                quantity: null,
                quantityCubicMetres: null,
                startDate: '2023-05-01T00:00:00.000Z'
              },
              {
                endDate: '2023-06-30T00:00:00.000Z',
                quantity: 200,
                quantityCubicMetres: 200,
                reading: 300,
                startDate: '2023-06-01T00:00:00.000Z'
              }
            ],
            meter10TimesDisplay: 'no',
            reported: 'meterReadings',
            startReading: 100,
            units: 'cubicMetres',
            unitSymbol: 'm³'
          })
        })
      })
    })

    describe('and the unit of measurement is gallons', () => {
      before(() => {
        session = {
          lines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              reading: 0,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              reading: 3000,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ],
          meter10TimesDisplay: 'no',
          reported: 'meterReadings',
          startReading: 0,
          units: 'gallons',
          unitSymbol: 'gal'
        }
      })

      it('updates the session data with the correct quantities', async () => {
        const result = await ApplyQuantitiesService.go(session)

        expect(result).to.equal({
          lines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              quantity: 0,
              quantityCubicMetres: 0,
              reading: 0,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              quantity: null,
              quantityCubicMetres: null,
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              quantity: 3000,
              quantityCubicMetres: 13.63827,
              reading: 3000,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ],
          meter10TimesDisplay: 'no',
          reported: 'meterReadings',
          startReading: 0,
          units: 'gallons',
          unitSymbol: 'gal'
        })
      })

      describe('and the meter has a x10 display', () => {
        before(() => {
          session = {
            lines: [
              {
                endDate: '2023-04-30T00:00:00.000Z',
                reading: 0,
                startDate: '2023-04-01T00:00:00.000Z'
              },
              {
                endDate: '2023-05-31T00:00:00.000Z',
                startDate: '2023-05-01T00:00:00.000Z'
              },
              {
                endDate: '2023-06-30T00:00:00.000Z',
                reading: 3000,
                startDate: '2023-06-01T00:00:00.000Z'
              }
            ],
            meter10TimesDisplay: 'yes',
            reported: 'meterReadings',
            startReading: 0,
            units: 'gallons',
            unitSymbol: 'gal'
          }
        })

        it('updates the session data with the correct quantities', async () => {
          const result = await ApplyQuantitiesService.go(session)

          expect(result).to.equal({
            lines: [
              {
                endDate: '2023-04-30T00:00:00.000Z',
                quantity: 0,
                quantityCubicMetres: 0,
                reading: 0,
                startDate: '2023-04-01T00:00:00.000Z'
              },
              {
                endDate: '2023-05-31T00:00:00.000Z',
                quantity: null,
                quantityCubicMetres: null,
                startDate: '2023-05-01T00:00:00.000Z'
              },
              {
                endDate: '2023-06-30T00:00:00.000Z',
                quantity: 30000,
                quantityCubicMetres: 136.3827,
                reading: 3000,
                startDate: '2023-06-01T00:00:00.000Z'
              }
            ],
            meter10TimesDisplay: 'yes',
            reported: 'meterReadings',
            startReading: 0,
            units: 'gallons',
            unitSymbol: 'gal'
          })
        })
      })
    })
  })

  describe('when called with volumes', () => {
    describe('and the unit of measurement was previously megalitres but has changed to cubic metres', () => {
      before(() => {
        session = {
          lines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              quantity: 100,
              quantityCubicMetres: 100000,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              quantity: 300,
              quantityCubicMetres: 300000,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ],
          meter10TimesDisplay: 'no',
          reported: 'abstractionVolumes',
          units: 'cubicMetres',
          unitSymbol: 'm³'
        }
      })

      it('updates the session data with the correct quantities', async () => {
        const result = await ApplyQuantitiesService.go(session)

        expect(result).to.equal({
          lines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              quantity: 100000,
              quantityCubicMetres: 100000,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              quantity: null,
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              quantity: 300000,
              quantityCubicMetres: 300000,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ],
          meter10TimesDisplay: 'no',
          reported: 'abstractionVolumes',
          units: 'cubicMetres',
          unitSymbol: 'm³'
        })
      })
    })
  })
})
