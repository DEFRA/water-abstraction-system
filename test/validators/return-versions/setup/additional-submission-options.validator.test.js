'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AdditionalSubmissionOptionsValidator = require('../../../../app/validators/return-versions/setup/additional-submission-options.validator.js')

describe('Return Versions Setup - Additional Submission Options validator', () => {
  let payload
  let session

  before(() => {
    payload = {
      additionalSubmissionOptions: ['multiple-upload']
    }

    session = _testSession()
  })

  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload, session)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    before(() => {
      payload = {
        options: ['Invalid option']
      }
    })

    it('fails validation with the error message "Select additional submission options for the requirements for returns"', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload, session)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal(
        'Select additional submission options for the requirements for returns'
      )
    })
  })

  describe('when quarterly return submission is selected but requirements have a return cycle of summer', () => {
    before(() => {
      session.data.requirements[0].returnsCycle = 'summer'

      payload = {
        additionalSubmissionOptions: ['quarterly-returns']
      }
    })

    it('fails validation with the error message "Quarterly returns submissions cannot be set for returns requirements in the summer cycle"', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload, session)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal(
        'Quarterly returns submissions cannot be set for returns requirements in the summer cycle'
      )
    })
  })

  describe('when no data is provided', () => {
    before(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload, session)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal(
        'Select additional submission options for the requirements for returns'
      )
    })
  })
})

function _testSession() {
  return {
    id: 'bbfb8568-cd71-4ca1-b56b-2d50dae2b2b9',
    data: {
      method: 'use-existing-requirements',
      reason: 'new-licence',
      journey: 'returns-required',
      licence: {
        id: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        endDate: null,
        startDate: '1992-08-19T00:00:00.000Z',
        licenceRef: '01/117',
        licenceHolder: 'Ferns Surfacing Limited',
        returnVersions: [],
        waterUndertaker: false,
        currentVersionStartDate: '2019-05-13T00:00:00.000Z'
      },
      requirements: [
        {
          points: [],
          purposes: [],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'POINT A, ADDINGTON SANDPITS',
          abstractionPeriod: [],
          frequencyReported: 'month',
          frequencyCollected: 'month',
          agreementsExceptions: []
        }
      ],
      startDateDay: '28',
      startDateYear: '2025',
      multipleUpload: false,
      startDateMonth: '12',
      checkPageVisited: true,
      quarterlyReturns: true,
      startDateOptions: 'anotherStartDate',
      returnVersionStartDate: '2025-12-28T00:00:00.000Z'
    }
  }
}
