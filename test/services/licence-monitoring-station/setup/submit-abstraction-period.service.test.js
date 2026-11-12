// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitAbstractionPeriodService from '../../../../src/services/licence-monitoring-station/setup/submit-abstraction-period.service.js'

describe('Licence Monitoring Station Setup - Abstraction Period Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = {
      abstractionPeriodEndDay: '3',
      abstractionPeriodEndMonth: '4',
      abstractionPeriodStartDay: '1',
      abstractionPeriodStartMonth: '2'
    }

    sessionData = {
      label: 'LABEL',
      licenceRef: 'LICENCE_REF'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitAbstractionPeriodService(session.id, payload)

      expect(session.abstractionPeriodStartDay).toEqual('1')
      expect(session.abstractionPeriodStartMonth).toEqual('2')
      expect(session.abstractionPeriodEndDay).toEqual('3')
      expect(session.abstractionPeriodEndMonth).toEqual('4')

      expect(session.$update).toHaveBeenCalled()
    })

    it('returns an empty object in order to continue the journey', async () => {
      const result = await SubmitAbstractionPeriodService(session.id, payload)

      expect(result).toEqual({})
    })
  })

  describe('with an invalid payload', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view', async () => {
      const result = await SubmitAbstractionPeriodService(session.id, payload)

      expect(result).toMatchObject({
        abstractionPeriodEndDay: null,
        abstractionPeriodEndMonth: null,
        abstractionPeriodStartDay: null,
        abstractionPeriodStartMonth: null,
        backLink: {
          href: `/system/licence-monitoring-station/setup/${session.id}/full-condition`,
          text: 'Back'
        },
        monitoringStationLabel: 'LABEL',
        pageTitle: 'Enter an abstraction period for licence LICENCE_REF'
      })
    })

    it('returns the validation error', async () => {
      const result = await SubmitAbstractionPeriodService(session.id, payload)

      expect(result.error).toEqual({
        abstractionPeriodEnd: {
          text: 'Select the end date of the abstraction period'
        },
        abstractionPeriodStart: {
          text: 'Select the start date of the abstraction period'
        },
        errorList: [
          {
            href: '#abstractionPeriodStart',
            text: 'Select the start date of the abstraction period'
          },
          {
            href: '#abstractionPeriodEnd',
            text: 'Select the end date of the abstraction period'
          }
        ]
      })
    })

    describe('because the user has not submitted anything', () => {
      it('includes an error for both input elements', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result.error).toEqual({
          abstractionPeriodEnd: {
            text: 'Select the end date of the abstraction period'
          },
          abstractionPeriodStart: {
            text: 'Select the start date of the abstraction period'
          },
          errorList: [
            {
              href: '#abstractionPeriodStart',
              text: 'Select the start date of the abstraction period'
            },
            {
              href: '#abstractionPeriodEnd',
              text: 'Select the end date of the abstraction period'
            }
          ]
        })
      })
    })

    describe('because the user has not submitted a start abstraction period', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodEndDay: '02',
          abstractionPeriodEndMonth: '7',
          abstractionPeriodStartDay: null,
          abstractionPeriodStartMonth: null
        }
      })

      it('includes an error for the start date input element', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result.error).toEqual({
          abstractionPeriodStart: {
            text: 'Select the start date of the abstraction period'
          },
          errorList: [
            {
              href: '#abstractionPeriodStart',
              text: 'Select the start date of the abstraction period'
            }
          ]
        })
      })

      it('includes what was submitted', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result).toMatchObject({
          abstractionPeriodEndDay: '02',
          abstractionPeriodEndMonth: '7',
          abstractionPeriodStartDay: null,
          abstractionPeriodStartMonth: null
        })
      })
    })

    describe('because the user has not submitted an end abstraction period', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodEndDay: null,
          abstractionPeriodEndMonth: null,
          abstractionPeriodStartDay: '08',
          abstractionPeriodStartMonth: '12'
        }
      })

      it('includes an error for the end date input element', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result.error).toEqual({
          abstractionPeriodEnd: {
            text: 'Select the end date of the abstraction period'
          },
          errorList: [
            {
              href: '#abstractionPeriodEnd',
              text: 'Select the end date of the abstraction period'
            }
          ]
        })
      })

      it('includes what was submitted', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result).toMatchObject({
          abstractionPeriodEndDay: null,
          abstractionPeriodEndMonth: null,
          abstractionPeriodStartDay: '08',
          abstractionPeriodStartMonth: '12'
        })
      })
    })

    describe('because the user has submitted invalid values', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodEndDay: 'abc',
          abstractionPeriodEndMonth: '123',
          abstractionPeriodStartDay: 'abc',
          abstractionPeriodStartMonth: '123'
        }
      })

      it('includes an error for both input elements', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result.error).toEqual({
          abstractionPeriodEnd: {
            text: 'Enter a real end date'
          },
          abstractionPeriodStart: {
            text: 'Enter a real start date'
          },
          errorList: [
            {
              href: '#abstractionPeriodStart',
              text: 'Enter a real start date'
            },
            {
              href: '#abstractionPeriodEnd',
              text: 'Enter a real end date'
            }
          ]
        })
      })

      it('includes what was submitted', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result).toMatchObject({
          abstractionPeriodEndDay: 'abc',
          abstractionPeriodEndMonth: '123',
          abstractionPeriodStartDay: 'abc',
          abstractionPeriodStartMonth: '123'
        })
      })
    })
  })
})
