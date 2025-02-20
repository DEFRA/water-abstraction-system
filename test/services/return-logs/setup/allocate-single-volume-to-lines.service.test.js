'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AllocateSingleVolumeToLinesService = require('../../../../app/services/return-logs/setup/allocate-single-volume-to-lines.service.js')

describe('Return Logs - Allocate Single Volume To Lines Service', () => {
  describe('when passed an abstraction periods to and from date', () => {
    let fromDate
    let toDate
    let singleVolume
    let lines

    describe('and a single volume that can be divided equally', () => {
      describe('and the lines have had a quantity allocated to it before', () => {
        beforeEach(() => {
          singleVolume = 2100
          fromDate = new Date('2023-10-01').toISOString()
          toDate = new Date('2024-03-31').toISOString()
          lines = _linesWithQuantity()
        })

        it('removes the old allocated quantity', () => {
          AllocateSingleVolumeToLinesService.go(lines, fromDate, toDate, singleVolume)

          expect(lines[0].quantity).to.not.exist()
          expect(lines[1].quantity).to.not.exist()
          expect(lines[2].quantity).to.not.exist()
          expect(lines[3].quantity).to.not.exist()
          expect(lines[4].quantity).to.not.exist()
          expect(lines[5].quantity).to.not.exist()
        })

        it('allocates the new quantity to the applicable lines', () => {
          AllocateSingleVolumeToLinesService.go(lines, fromDate, toDate, singleVolume)

          expect(lines[6].quantity).to.equal(350)
          expect(lines[7].quantity).to.equal(350)
          expect(lines[8].quantity).to.equal(350)
          expect(lines[9].quantity).to.equal(350)
          expect(lines[10].quantity).to.equal(350)
          expect(lines[11].quantity).to.equal(350)
        })
      })

      describe('and the lines have not been allocated to before', () => {
        beforeEach(() => {
          singleVolume = 1200
          fromDate = new Date('2023-04-01').toISOString()
          toDate = new Date('2023-09-30').toISOString()
          lines = _lines()
        })

        it('allocates the volume evenly across lines covered by the abstraction period', () => {
          AllocateSingleVolumeToLinesService.go(lines, fromDate, toDate, singleVolume)

          expect(lines[0].quantity).to.equal(200)
          expect(lines[1].quantity).to.equal(200)
          expect(lines[2].quantity).to.equal(200)
          expect(lines[3].quantity).to.equal(200)
          expect(lines[4].quantity).to.equal(200)
          expect(lines[5].quantity).to.equal(200)
        })

        it('ignores lines outside the abstraction period', () => {
          AllocateSingleVolumeToLinesService.go(lines, fromDate, toDate, singleVolume)

          expect(lines[6].quantity).to.not.exist()
          expect(lines[7].quantity).to.not.exist()
          expect(lines[8].quantity).to.not.exist()
          expect(lines[9].quantity).to.not.exist()
          expect(lines[10].quantity).to.not.exist()
          expect(lines[11].quantity).to.not.exist()
        })
      })
    })

    describe('and a single volume that cannot be divided equally', () => {
      beforeEach(() => {
        singleVolume = 1001
        fromDate = new Date('2023-04-01').toISOString()
        toDate = new Date('2023-09-30').toISOString()
        lines = _lines()
      })

      it('handles rounding errors by adjusting the last line', () => {
        AllocateSingleVolumeToLinesService.go(lines, fromDate, toDate, singleVolume)

        expect(lines[0].quantity).to.equal(166.83333333333334)
        expect(lines[1].quantity).to.equal(166.83333333333334)
        expect(lines[2].quantity).to.equal(166.83333333333334)
        expect(lines[3].quantity).to.equal(166.83333333333334)
        expect(lines[4].quantity).to.equal(166.83333333333334)
        expect(lines[5].quantity).to.equal(166.83333333333323)
      })

      it('ignores lines outside the abstraction period', () => {
        AllocateSingleVolumeToLinesService.go(lines, fromDate, toDate, singleVolume)

        expect(lines[6].quantity).to.not.exist()
        expect(lines[7].quantity).to.not.exist()
        expect(lines[8].quantity).to.not.exist()
        expect(lines[9].quantity).to.not.exist()
        expect(lines[10].quantity).to.not.exist()
        expect(lines[11].quantity).to.not.exist()
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
