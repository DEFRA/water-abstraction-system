'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things to stub
const FullConditionService = require('../../../../app/services/licence-monitoring-station/setup/full-condition.service.js')

// Thing under test
const SubmitFullConditionService = require('../../../../app/services/licence-monitoring-station/setup/submit-full-condition.service.js')

describe('Full Condition Service', () => {
  let payload
  let session

  const pageData = { pageData: 'PAGE_DATA' }

  beforeEach(async () => {
    payload = {
      condition: 'f97ef1d2-5775-4b13-926b-b8045c043fa5'
    }

    session = await SessionHelper.add()

    Sinon.stub(FullConditionService, 'go').resolves(pageData)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitFullConditionService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.conditionId).to.equal(payload.condition)
    })

    describe('and no_conditions was passed in the payload', () => {
      beforeEach(() => {
        payload = { condition: 'no_conditions' }
      })

      it('returns true for abstractionPeriod', async () => {
        const result = await SubmitFullConditionService.go(session.id, payload)

        expect(result).to.equal({ abstractionPeriod: true })
      })
    })

    describe('and a UUID was passed in the payload', () => {
      it('returns false for abstractionPeriod', async () => {
        const result = await SubmitFullConditionService.go(session.id, payload)

        expect(result).to.equal({ abstractionPeriod: false })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitFullConditionService.go(session.id, payload)

      expect(result).to.equal({
        error: { text: 'Select a condition' },
        ...pageData
      })
    })
  })
})
