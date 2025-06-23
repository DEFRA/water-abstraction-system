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

describe('Abstraction Period Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {
      'abstraction-period-start-day': '1',
      'abstraction-period-start-month': '2',
      'abstraction-period-end-day': '3',
      'abstraction-period-end-month': '4'
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

  describe('when validation fails', () => {
    beforeEach(() => {
      payload['abstraction-period-start-day'] = 'INVALID_START_DAY'
      payload['abstraction-period-end-day'] = 'INVALID_END_DAY'
    })

    it('returns page data for the view', async () => {
      const result = await SubmitAbstractionPeriodService.go(session.id, payload)

      expect(result).to.equal(
        {
          abstractionPeriodStartDay: 'INVALID_START_DAY',
          abstractionPeriodStartMonth: '2',
          abstractionPeriodEndDay: 'INVALID_END_DAY',
          abstractionPeriodEndMonth: '4',
          backLink: `/system/licence-monitoring-station/setup/${session.id}/licence-number`,
          monitoringStationLabel: 'LABEL',
          pageTitle: 'Enter an abstraction period for licence LICENCE_REF'
        },
        { skip: ['error'] }
      )
    })

    it('returns the validation error', async () => {
      const result = await SubmitAbstractionPeriodService.go(session.id, payload)

      expect(result.error).to.equal({
        text: {
          startResult: 'Enter a valid start date',
          endResult: 'Enter a valid end date'
        }
      })
    })
  })
})
