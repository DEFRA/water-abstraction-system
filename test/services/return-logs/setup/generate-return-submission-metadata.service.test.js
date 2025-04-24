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

  beforeEach(async () => {
    sessionData = {
      reported: 'abstraction-volumes',
      units: 'cubic-metres',
      singleVolume: false
    }
  })

  describe('when session.reported is abstraction-volumes', () => {
    beforeEach(async () => {
      sessionData.reported = 'abstraction-volumes'
    })

    it('type is estimated', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result.type).to.equal('estimated')
    })

    it('method is abstractionVolumes', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result.method).to.equal('abstractionVolumes')
    })
  })

  describe('when session.reported is not abstraction-volumes', () => {
    beforeEach(async () => {
      sessionData.reported = 'meter-readings'
    })

    it('type is estimated', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result.type).to.equal('measured')
    })

    it('method is oneMeter', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result.method).to.equal('oneMeter')
    })
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

  describe('when session.singleVolume is true', () => {
    beforeEach(async () => {
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
      beforeEach(async () => {
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
      beforeEach(async () => {
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

  describe('when session.singleVolume is false', () => {
    beforeEach(async () => {
      sessionData.singleVolume = false
    })

    it('sets totalFlag to false', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result.totalFlag).to.equal(false)
    })

    it('sets total as null', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result.total).to.be.null()
    })

    it('does not include totalCustomDateStart or totalCustomEndDate', () => {
      const result = GenerateReturnSubmissionMetadataService.go(sessionData)

      expect(result.totalCustomDateStart).to.be.undefined()
      expect(result.totalCustomDateEnd).to.be.undefined()
    })
  })
})
