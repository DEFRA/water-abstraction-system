'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ConsolidateDateRangesService = require('../../../app/services/supplementary-billing/consolidate-date-ranges.service')

describe.only('ConsolidateDateRanges service', () => {
  describe('when non-overlapping ranges are provided', () => {
    it('returns the ranges as-is', () => {
      const dateRanges = [
        { startDate: new Date('2023-01-01'), endDate: new Date('2023-03-31') },
        { startDate: new Date('2023-04-01'), endDate: new Date('2023-05-01') }
      ]

      const result = ConsolidateDateRangesService.go(dateRanges)

      expect(result).to.equal(dateRanges)
    })
  })

  describe('when overlapping ranges are provided', () => {
    it('returns the consolidated ranges', () => {
      const dateRanges = [
        { startDate: new Date('2023-01-01'), endDate: new Date('2023-03-31') },
        { startDate: new Date('2023-02-01'), endDate: new Date('2023-04-30') },
        { startDate: new Date('2023-05-01'), endDate: new Date('2023-06-01') }
      ]

      const result = ConsolidateDateRangesService.go(dateRanges)

      expect(result[0]).to.equal({ startDate: new Date('2023-01-01'), endDate: new Date('2023-04-30') })
      expect(result[1]).to.equal({ startDate: new Date('2023-05-01'), endDate: new Date('2023-06-01') })
    })
  })
})
