'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitAbstractionPeriodService = require('../../../../app/services/licence-monitoring-station/setup/submit-abstraction-period.service.js')

describe('Licence Monitoring Station Setup - Abstraction Period Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
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

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitAbstractionPeriodService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.abstractionPeriodStartDay).to.equal('1')
      expect(refreshedSession.abstractionPeriodStartMonth).to.equal('2')
      expect(refreshedSession.abstractionPeriodEndDay).to.equal('3')
      expect(refreshedSession.abstractionPeriodEndMonth).to.equal('4')
    })

    it('returns an empty object in order to continue the journey', async () => {
      const result = await SubmitAbstractionPeriodService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('with an invalid payload', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view', async () => {
      const result = await SubmitAbstractionPeriodService.go(session.id, payload)

      expect(result).to.equal(
        {
          abstractionPeriodStartDay: null,
          abstractionPeriodStartMonth: null,
          abstractionPeriodEndDay: null,
          abstractionPeriodEndMonth: null,
          activeNavBar: 'search',
          backLink: {
            href: `/system/licence-monitoring-station/setup/${session.id}/full-condition`,
            text: 'Back'
          },
          monitoringStationLabel: 'LABEL',
          pageTitle: 'Enter an abstraction period for licence LICENCE_REF'
        },
        { skip: ['error'] }
      )
    })

    it('returns the validation error', async () => {
      const result = await SubmitAbstractionPeriodService.go(session.id, payload)

      expect(result.error).to.equal({
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
        const result = await SubmitAbstractionPeriodService.go(session.id, payload)

        expect(result.error).to.equal({
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
        const result = await SubmitAbstractionPeriodService.go(session.id, payload)

        expect(result.error).to.equal({
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
        const result = await SubmitAbstractionPeriodService.go(session.id, payload)

        expect(result).to.equal(
          {
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null,
            abstractionPeriodEndDay: '02',
            abstractionPeriodEndMonth: '7'
          },
          { skip: ['error', 'activeNavBar', 'backLink', 'monitoringStationLabel', 'pageTitle'] }
        )
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
        const result = await SubmitAbstractionPeriodService.go(session.id, payload)

        expect(result.error).to.equal({
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
        const result = await SubmitAbstractionPeriodService.go(session.id, payload)

        expect(result).to.equal(
          {
            abstractionPeriodStartDay: '08',
            abstractionPeriodStartMonth: '12',
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null
          },
          { skip: ['error', 'activeNavBar', 'backLink', 'monitoringStationLabel', 'pageTitle'] }
        )
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
        const result = await SubmitAbstractionPeriodService.go(session.id, payload)

        expect(result.error).to.equal({
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
        const result = await SubmitAbstractionPeriodService.go(session.id, payload)

        expect(result).to.equal(
          {
            abstractionPeriodStartDay: 'abc',
            abstractionPeriodStartMonth: '123',
            abstractionPeriodEndDay: 'abc',
            abstractionPeriodEndMonth: '123'
          },
          { skip: ['error', 'activeNavBar', 'backLink', 'monitoringStationLabel', 'pageTitle'] }
        )
      })
    })
  })
})
