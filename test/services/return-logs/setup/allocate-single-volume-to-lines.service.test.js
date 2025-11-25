'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const Big = require('big.js')

// Thing under test
const AllocateSingleVolumeToLinesService = require('../../../../app/services/return-logs/setup/allocate-single-volume-to-lines.service.js')

describe('Return Logs - Allocate Single Volume To Lines Service', () => {
  describe('when passed an abstraction periods to and from date', () => {
    let lines
    let session

    describe('and a single volume that can be divided equally', () => {
      describe('and the lines have had a quantity allocated to it before', () => {
        beforeEach(() => {
          lines = _linesWithQuantity()
          session = {
            fromFullDate: new Date('2023-10-01').toISOString(),
            lines,
            singleVolumeQuantity: 2100,
            toFullDate: new Date('2024-03-31').toISOString(),
            unitSymbol: 'm³'
          }
        })

        it('removes the old allocated quantity', () => {
          AllocateSingleVolumeToLinesService.go(session)

          expect(lines[0].quantity).to.not.exist()
          expect(lines[0].quantityCubicMetres).to.not.exist()
          expect(lines[1].quantity).to.not.exist()
          expect(lines[1].quantityCubicMetres).to.not.exist()
          expect(lines[2].quantity).to.not.exist()
          expect(lines[2].quantityCubicMetres).to.not.exist()
          expect(lines[3].quantity).to.not.exist()
          expect(lines[3].quantityCubicMetres).to.not.exist()
          expect(lines[4].quantity).to.not.exist()
          expect(lines[4].quantityCubicMetres).to.not.exist()
          expect(lines[5].quantity).to.not.exist()
          expect(lines[5].quantityCubicMetres).to.not.exist()
        })

        it('allocates the new quantity to the applicable lines', () => {
          AllocateSingleVolumeToLinesService.go(session)

          expect(lines[6].quantity).to.equal(350)
          expect(lines[6].quantityCubicMetres).to.equal(350)
          expect(lines[7].quantity).to.equal(350)
          expect(lines[7].quantityCubicMetres).to.equal(350)
          expect(lines[8].quantity).to.equal(350)
          expect(lines[8].quantityCubicMetres).to.equal(350)
          expect(lines[9].quantity).to.equal(350)
          expect(lines[9].quantityCubicMetres).to.equal(350)
          expect(lines[10].quantity).to.equal(350)
          expect(lines[10].quantityCubicMetres).to.equal(350)
          expect(lines[11].quantity).to.equal(350)
          expect(lines[11].quantityCubicMetres).to.equal(350)
        })
      })

      describe('and the lines have not been allocated to before', () => {
        beforeEach(() => {
          lines = _lines()
          session = {
            fromFullDate: new Date('2023-04-01').toISOString(),
            lines,
            singleVolumeQuantity: 1200,
            toFullDate: new Date('2023-09-30').toISOString(),
            unitSymbol: 'm³'
          }
        })

        it('allocates the volume evenly across lines covered by the abstraction period', () => {
          AllocateSingleVolumeToLinesService.go(session)

          expect(lines[0].quantity).to.equal(200)
          expect(lines[0].quantityCubicMetres).to.equal(200)
          expect(lines[1].quantity).to.equal(200)
          expect(lines[1].quantityCubicMetres).to.equal(200)
          expect(lines[2].quantity).to.equal(200)
          expect(lines[2].quantityCubicMetres).to.equal(200)
          expect(lines[3].quantity).to.equal(200)
          expect(lines[3].quantityCubicMetres).to.equal(200)
          expect(lines[4].quantity).to.equal(200)
          expect(lines[4].quantityCubicMetres).to.equal(200)
          expect(lines[5].quantity).to.equal(200)
          expect(lines[5].quantityCubicMetres).to.equal(200)
        })

        it('ignores lines outside the abstraction period', () => {
          AllocateSingleVolumeToLinesService.go(session)

          expect(lines[6].quantity).to.not.exist()
          expect(lines[6].quantityCubicMetres).to.not.exist()
          expect(lines[7].quantity).to.not.exist()
          expect(lines[7].quantityCubicMetres).to.not.exist()
          expect(lines[8].quantity).to.not.exist()
          expect(lines[8].quantityCubicMetres).to.not.exist()
          expect(lines[9].quantity).to.not.exist()
          expect(lines[9].quantityCubicMetres).to.not.exist()
          expect(lines[10].quantity).to.not.exist()
          expect(lines[10].quantityCubicMetres).to.not.exist()
          expect(lines[11].quantity).to.not.exist()
          expect(lines[11].quantityCubicMetres).to.not.exist()
        })
      })
    })

    describe('and a single volume that cannot be divided equally', () => {
      beforeEach(() => {
        lines = _lines()
        session = {
          fromFullDate: new Date('2023-04-01').toISOString(),
          lines,
          singleVolumeQuantity: 1001.111123,
          toFullDate: new Date('2023-09-30').toISOString(),
          unitSymbol: 'm³'
        }
      })

      it('handles rounding errors by adjusting the last line', () => {
        AllocateSingleVolumeToLinesService.go(session)

        expect(lines[0].quantity).to.equal(166.851854)
        expect(lines[0].quantityCubicMetres).to.equal(166.851854)
        expect(lines[1].quantity).to.equal(166.851854)
        expect(lines[1].quantityCubicMetres).to.equal(166.851854)
        expect(lines[2].quantity).to.equal(166.851854)
        expect(lines[2].quantityCubicMetres).to.equal(166.851854)
        expect(lines[3].quantity).to.equal(166.851854)
        expect(lines[3].quantityCubicMetres).to.equal(166.851854)
        expect(lines[4].quantity).to.equal(166.851854)
        expect(lines[4].quantityCubicMetres).to.equal(166.851854)
        expect(lines[5].quantity).to.equal(166.851853)
        expect(lines[5].quantityCubicMetres).to.equal(166.851853)
      })

      it('allocates the single volume across lines so their total matches the single volume', () => {
        AllocateSingleVolumeToLinesService.go(session)

        const linesQuantityTotal = lines.reduce((sum, line) => {
          const quantity = line.quantity ?? 0

          return Big(sum).plus(quantity).toNumber()
        }, 0)

        expect(linesQuantityTotal).to.equal(1001.111123)
      })

      it('ignores lines outside the abstraction period', () => {
        AllocateSingleVolumeToLinesService.go(session)

        expect(lines[6].quantity).to.not.exist()
        expect(lines[6].quantityCubicMetres).to.not.exist()
        expect(lines[7].quantity).to.not.exist()
        expect(lines[7].quantityCubicMetres).to.not.exist()
        expect(lines[8].quantity).to.not.exist()
        expect(lines[8].quantityCubicMetres).to.not.exist()
        expect(lines[9].quantity).to.not.exist()
        expect(lines[9].quantityCubicMetres).to.not.exist()
        expect(lines[10].quantity).to.not.exist()
        expect(lines[10].quantityCubicMetres).to.not.exist()
        expect(lines[11].quantity).to.not.exist()
        expect(lines[11].quantityCubicMetres).to.not.exist()
      })

      describe('and the UOM is gallons (gallons multiplier: 219.969248299)', () => {
        beforeEach(() => {
          lines = _lines()
          session = {
            fromFullDate: new Date('2023-04-01').toISOString(),
            lines,
            singleVolumeQuantity: 220213.66119, // 1001.111123 cubic metres converted to gallons to 6 decimal places
            toFullDate: new Date('2023-09-30').toISOString(),
            unitSymbol: 'gal'
          }
        })

        it('handles rounding errors by adjusting the last line', () => {
          // NOTE: When using a single volume which is not in cubic metres, the single volume is first converted to
          // cubic metres before allocation to the lines `quantityCubicMetres`. The allocated line `quantityCubicMetres`
          // is then converted back to the original UOM and allocated to the `quantity`. This affects the individual
          // line quantities and totals due to rounding.
          AllocateSingleVolumeToLinesService.go(session)

          expect(lines[0].quantity).to.equal(36702.276902)
          expect(lines[0].quantityCubicMetres).to.equal(166.851854)
          expect(lines[1].quantity).to.equal(36702.276902)
          expect(lines[1].quantityCubicMetres).to.equal(166.851854)
          expect(lines[2].quantity).to.equal(36702.276902)
          expect(lines[2].quantityCubicMetres).to.equal(166.851854)
          expect(lines[3].quantity).to.equal(36702.276902)
          expect(lines[3].quantityCubicMetres).to.equal(166.851854)
          expect(lines[4].quantity).to.equal(36702.276902)
          expect(lines[4].quantityCubicMetres).to.equal(166.851854)
          expect(lines[5].quantity).to.equal(36702.276682)
          expect(lines[5].quantityCubicMetres).to.equal(166.851853)
        })

        it('allocates the single volume across lines so their total matches the single volume', () => {
          AllocateSingleVolumeToLinesService.go(session)

          const linesQuantityTotal = lines.reduce((sum, line) => {
            const quantity = line.quantity ?? 0

            return Big(sum).plus(quantity).toNumber()
          }, 0)

          const linesQuantityCubicMetresTotal = lines.reduce((sum, line) => {
            const quantityCubicMetres = line.quantityCubicMetres ?? 0

            return Big(sum).plus(quantityCubicMetres).toNumber()
          }, 0)

          expect(linesQuantityTotal).to.equal(220213.661192) // Slightly different to original volume of 220213.66119
          expect(linesQuantityCubicMetresTotal).to.equal(1001.111123)
        })
      })
    })
  })
})

function _lines() {
  return [
    { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
    { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() },
    { startDate: new Date('2023-06-01').toISOString(), endDate: new Date('2023-06-30').toISOString() },
    { startDate: new Date('2023-07-01').toISOString(), endDate: new Date('2023-07-31').toISOString() },
    { startDate: new Date('2023-08-01').toISOString(), endDate: new Date('2023-08-31').toISOString() },
    { startDate: new Date('2023-09-01').toISOString(), endDate: new Date('2023-09-30').toISOString() },
    { startDate: new Date('2023-10-01').toISOString(), endDate: new Date('2023-10-31').toISOString() },
    { startDate: new Date('2023-11-01').toISOString(), endDate: new Date('2023-11-30').toISOString() },
    { startDate: new Date('2023-12-01').toISOString(), endDate: new Date('2023-12-31').toISOString() },
    { startDate: new Date('2024-01-01').toISOString(), endDate: new Date('2024-01-31').toISOString() },
    { startDate: new Date('2024-02-01').toISOString(), endDate: new Date('2024-02-29').toISOString() },
    { startDate: new Date('2024-03-01').toISOString(), endDate: new Date('2024-03-31').toISOString() }
  ]
}

function _linesWithQuantity() {
  return [
    { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString(), quantity: 200 },
    { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString(), quantity: 200 },
    { startDate: new Date('2023-06-01').toISOString(), endDate: new Date('2023-06-30').toISOString(), quantity: 200 },
    { startDate: new Date('2023-07-01').toISOString(), endDate: new Date('2023-07-31').toISOString(), quantity: 200 },
    { startDate: new Date('2023-08-01').toISOString(), endDate: new Date('2023-08-31').toISOString(), quantity: 200 },
    { startDate: new Date('2023-09-01').toISOString(), endDate: new Date('2023-09-30').toISOString(), quantity: 200 },
    { startDate: new Date('2023-10-01').toISOString(), endDate: new Date('2023-10-31').toISOString() },
    { startDate: new Date('2023-11-01').toISOString(), endDate: new Date('2023-11-30').toISOString() },
    { startDate: new Date('2023-12-01').toISOString(), endDate: new Date('2023-12-31').toISOString() },
    { startDate: new Date('2024-01-01').toISOString(), endDate: new Date('2024-01-31').toISOString() },
    { startDate: new Date('2024-02-01').toISOString(), endDate: new Date('2024-02-29').toISOString() },
    { startDate: new Date('2024-03-01').toISOString(), endDate: new Date('2024-03-31').toISOString() }
  ]
}
