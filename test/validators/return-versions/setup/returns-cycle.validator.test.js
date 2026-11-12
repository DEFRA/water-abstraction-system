// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Thing under test
import ReturnsCycleValidator from '../../../../src/validators/return-versions/setup/returns-cycle.validator.js'

describe('Return Versions Setup - Returns Cycle validator', () => {
  let payload
  let session

  beforeAll(() => {
    payload = {
      returnsCycle: 'winter-and-all-year'
    }

    session = _testSession()
  })

  describe('when valid data is provided', () => {
    it('confirms the data is valid', async () => {
      const result = ReturnsCycleValidator(payload, session)

      expect(result.value.returnsCycle).toBeDefined()
    })
  })

  describe('when invalid data is provided', () => {
    beforeAll(() => {
      payload = {
        returnsCycle: 'ABC123'
      }
    })

    it('fails validation with the error message "Select the returns cycle for the requirements for returns"', () => {
      const result = ReturnsCycleValidator(payload, session)

      expect(result.error.details[0].message).toEqual('Select the returns cycle for the requirements for returns')
    })
  })

  describe('when a user selects summer but quarterly returns is marked true', () => {
    beforeAll(() => {
      payload = {
        returnsCycle: 'summer'
      }

      session.quarterlyReturns = true
    })

    it('fails validation with the error message "Quarterly returns submissions cannot be set for returns requirements in the summer cycle"', () => {
      const result = ReturnsCycleValidator(payload, session)

      expect(result.error.details[0].message).toEqual(
        'Quarterly returns submissions cannot be set for returns requirements in the summer cycle'
      )
    })
  })

  describe('when a user selects summer but quarterly returns is marked false', () => {
    beforeAll(() => {
      payload = {
        returnsCycle: 'summer'
      }

      session.data.quarterlyReturns = false
    })

    it('confirms the data is valid', () => {
      const result = ReturnsCycleValidator(payload, session)

      expect(result.value.returnsCycle).toBeDefined()
    })
  })

  describe('when no data is provided', () => {
    beforeAll(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = ReturnsCycleValidator(payload, session)

      expect(result.error.details[0].message).toEqual('Select the returns cycle for the requirements for returns')
    })
  })
})

function _testSession() {
  return {
    data: {
      checkPageVisited: false,
      journey: 'returns-required',
      licence: {
        currentVersionStartDate: '2019-05-13T00:00:00.000Z',
        endDate: null,
        id: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        licenceHolder: 'Ferns Surfacing Limited',
        licenceRef: '01/117',
        returnVersions: [],
        startDate: '1992-08-19T00:00:00.000Z',
        waterUndertaker: false
      },
      method: 'use-existing-requirements',
      multipleUpload: false,
      quarterlyReturns: false,
      reason: 'new-licence',
      requirements: [
        {
          abstractionPeriod: [],
          agreementsExceptions: [],
          frequencyCollected: 'month',
          frequencyReported: 'month',
          points: [],
          purposes: [],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'POINT A, ADDINGTON SANDPITS'
        }
      ],
      returnVersionStartDate: '2025-12-28T00:00:00.000Z',
      startDateDay: '28',
      startDateMonth: '12',
      startDateOptions: 'anotherStartDate',
      startDateYear: '2025'
    },
    id: 'bbfb8568-cd71-4ca1-b56b-2d50dae2b2b9'
  }
}
