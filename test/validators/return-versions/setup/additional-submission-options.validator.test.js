// Thing under test
import AdditionalSubmissionOptionsValidator from '../../../../app/validators/return-versions/setup/additional-submission-options.validator.js'

describe('Return Versions Setup - Additional Submission Options validator', () => {
  let payload
  let session

  beforeAll(() => {
    payload = {
      additionalSubmissionOptions: ['multiple-upload']
    }

    session = _testSession()
  })

  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = AdditionalSubmissionOptionsValidator(payload, session)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    beforeAll(() => {
      payload = {
        options: ['Invalid option']
      }
    })

    it('fails validation with the error message "Select additional submission options for the requirements for returns"', () => {
      const result = AdditionalSubmissionOptionsValidator(payload, session)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual(
        'Select additional submission options for the requirements for returns'
      )
    })
  })

  describe('when quarterly return submission is selected but requirements have a return cycle of summer', () => {
    beforeAll(() => {
      session.requirements[0].returnsCycle = 'summer'

      payload = {
        additionalSubmissionOptions: ['quarterly-returns']
      }
    })

    it('fails validation with the error message "Quarterly returns submissions cannot be set for returns requirements in the summer cycle"', () => {
      const result = AdditionalSubmissionOptionsValidator(payload, session)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual(
        'Quarterly returns submissions cannot be set for returns requirements in the summer cycle'
      )
    })
  })

  describe('when no data is provided', () => {
    beforeAll(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = AdditionalSubmissionOptionsValidator(payload, session)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual(
        'Select additional submission options for the requirements for returns'
      )
    })
  })
})

function _testSession() {
  return {
    id: 'bbfb8568-cd71-4ca1-b56b-2d50dae2b2b9',
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
