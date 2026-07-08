// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitAbstractionPeriodService from '../../../../app/services/licence-monitoring-station/setup/submit-abstraction-period.service.js'

describe('Licence Monitoring Station Setup - Abstraction Period Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = {
      abstractionPeriodStartDay: '1',
      abstractionPeriodStartMonth: '2',
      abstractionPeriodEndDay: '3',
      abstractionPeriodEndMonth: '4'
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

      expect(session.$update.called).toBe(true)
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
        abstractionPeriodStartDay: null,
        abstractionPeriodStartMonth: null,
        abstractionPeriodEndDay: null,
        abstractionPeriodEndMonth: null,
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
        errorList: [
          {
            href: '#abstractionPeriodStart',
            text: 'Select the start date of the abstraction period'
          },
          {
            href: '#abstractionPeriodEnd',
            text: 'Select the end date of the abstraction period'
          }
        ],
        abstractionPeriodStart: {
          text: 'Select the start date of the abstraction period'
        },
        abstractionPeriodEnd: {
          text: 'Select the end date of the abstraction period'
        }
      })
    })

    describe('because the user has not submitted anything', () => {
      it('includes an error for both input elements', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#abstractionPeriodStart',
              text: 'Select the start date of the abstraction period'
            },
            {
              href: '#abstractionPeriodEnd',
              text: 'Select the end date of the abstraction period'
            }
          ],
          abstractionPeriodStart: {
            text: 'Select the start date of the abstraction period'
          },
          abstractionPeriodEnd: {
            text: 'Select the end date of the abstraction period'
          }
        })
      })
    })

    describe('because the user has not submitted a start abstraction period', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: null,
          abstractionPeriodStartMonth: null,
          abstractionPeriodEndDay: '02',
          abstractionPeriodEndMonth: '7'
        }
      })

      it('includes an error for the start date input element', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#abstractionPeriodStart',
              text: 'Select the start date of the abstraction period'
            }
          ],
          abstractionPeriodStart: {
            text: 'Select the start date of the abstraction period'
          }
        })
      })

      it('includes what was submitted', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result).toMatchObject({
          abstractionPeriodStartDay: null,
          abstractionPeriodStartMonth: null,
          abstractionPeriodEndDay: '02',
          abstractionPeriodEndMonth: '7'
        })
      })
    })

    describe('because the user has not submitted an end abstraction period', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: '08',
          abstractionPeriodStartMonth: '12',
          abstractionPeriodEndDay: null,
          abstractionPeriodEndMonth: null
        }
      })

      it('includes an error for the end date input element', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#abstractionPeriodEnd',
              text: 'Select the end date of the abstraction period'
            }
          ],
          abstractionPeriodEnd: {
            text: 'Select the end date of the abstraction period'
          }
        })
      })

      it('includes what was submitted', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result).toMatchObject({
          abstractionPeriodStartDay: '08',
          abstractionPeriodStartMonth: '12',
          abstractionPeriodEndDay: null,
          abstractionPeriodEndMonth: null
        })
      })
    })

    describe('because the user has submitted invalid values', () => {
      beforeEach(() => {
        payload = {
          abstractionPeriodStartDay: 'abc',
          abstractionPeriodStartMonth: '123',
          abstractionPeriodEndDay: 'abc',
          abstractionPeriodEndMonth: '123'
        }
      })

      it('includes an error for both input elements', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#abstractionPeriodStart',
              text: 'Enter a real start date'
            },
            {
              href: '#abstractionPeriodEnd',
              text: 'Enter a real end date'
            }
          ],
          abstractionPeriodStart: {
            text: 'Enter a real start date'
          },
          abstractionPeriodEnd: {
            text: 'Enter a real end date'
          }
        })
      })

      it('includes what was submitted', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, payload)

        expect(result).toMatchObject({
          abstractionPeriodStartDay: 'abc',
          abstractionPeriodStartMonth: '123',
          abstractionPeriodEndDay: 'abc',
          abstractionPeriodEndMonth: '123'
        })
      })
    })
  })
})
