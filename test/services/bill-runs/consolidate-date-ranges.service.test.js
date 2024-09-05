'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ConsolidateDateRangesService = require('../../../app/services/bill-runs/consolidate-date-ranges.service.js')

describe('ConsolidateDateRanges service', () => {
  describe('when the provided ranges are non-overlapping', () => {
    describe('and the ranges are entirely separate', () => {
      it('returns the expected ranges', () => {
        const dateRanges = [
          { startDate: new Date('2023-01-01'), endDate: new Date('2023-02-01') },
          { startDate: new Date('2023-03-01'), endDate: new Date('2023-04-01') }
        ]

        const result = ConsolidateDateRangesService.go(dateRanges)

        expect(result[0]).to.equal({ startDate: new Date('2023-01-01'), endDate: new Date('2023-02-01') })
        expect(result[1]).to.equal({ startDate: new Date('2023-03-01'), endDate: new Date('2023-04-01') })
      })
    })

    describe('and one range starts the day after the other range ends', () => {
      it('returns the expected ranges', () => {
        const dateRanges = [
          { startDate: new Date('2023-01-01'), endDate: new Date('2023-03-31') },
          { startDate: new Date('2023-04-01'), endDate: new Date('2023-05-01') }
        ]

        const result = ConsolidateDateRangesService.go(dateRanges)

        expect(result[0]).to.equal({ startDate: new Date('2023-01-01'), endDate: new Date('2023-03-31') })
        expect(result[1]).to.equal({ startDate: new Date('2023-04-01'), endDate: new Date('2023-05-01') })
      })
    })
  })

  describe('when overlapping ranges are provided', () => {
    it('returns the consolidated ranges', () => {
      const dateRanges = [
        { startDate: new Date('2023-01-01'), endDate: new Date('2023-03-01') },
        { startDate: new Date('2023-02-01'), endDate: new Date('2023-05-01') }
      ]

      const result = ConsolidateDateRangesService.go(dateRanges)

      expect(result[0]).to.equal({ startDate: new Date('2023-01-01'), endDate: new Date('2023-05-01') })
    })

    describe('and one range is entirely within the other', () => {
      it('returns the consolidated ranges', () => {
        const dateRanges = [
          { startDate: new Date('2023-01-01'), endDate: new Date('2023-05-01') },
          { startDate: new Date('2023-02-01'), endDate: new Date('2023-03-01') }
        ]

        const result = ConsolidateDateRangesService.go(dateRanges)

        expect(result[0]).to.equal({ startDate: new Date('2023-01-01'), endDate: new Date('2023-05-01') })
      })
    })

    describe('and one range ends the same day the next range starts', () => {
      it('returns the consolidated ranges', () => {
        const dateRanges = [
          { startDate: new Date('2023-01-01'), endDate: new Date('2023-02-01') },
          { startDate: new Date('2023-02-01'), endDate: new Date('2023-05-01') }
        ]

        const result = ConsolidateDateRangesService.go(dateRanges)

        expect(result[0]).to.equal({ startDate: new Date('2023-01-01'), endDate: new Date('2023-05-01') })
      })
    })
  })

  describe('when a mix of overlapping and non-overlapping ranges is provided', () => {
    it('returns the correct consolidated ranges', () => {
      const dateRanges = [
        { startDate: new Date('2023-01-01'), endDate: new Date('2023-03-01') },
        { startDate: new Date('2023-02-01'), endDate: new Date('2023-05-01') },
        { startDate: new Date('2023-06-01'), endDate: new Date('2023-07-01') }
      ]

      const result = ConsolidateDateRangesService.go(dateRanges)

      expect(result[0]).to.equal({ startDate: new Date('2023-01-01'), endDate: new Date('2023-05-01') })
      expect(result[1]).to.equal({ startDate: new Date('2023-06-01'), endDate: new Date('2023-07-01') })
    })
  })
})
