'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const SubmitCancelService = require('../../../../app/services/notices/setup/submit-cancel.service.js')

describe('Notices - Setup - Submit Cancel service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { licenceRef: '01/111', referenceCode: 'ADHC-1234', journey: 'ad-hoc' } })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelService.go(session.id)

      const noSession = await SessionModel.query().where('id', session.id)

      expect(noSession).to.equal([])
    })

    describe('when the journey is for a return', () => {
      it('returns the redirect url', async () => {
        const result = await SubmitCancelService.go(session.id)

        expect(result).to.equal('/manage')
      })
    })

    describe('when the journey is for "abstraction-alerts"', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            alertType: 'stop',
            journey: 'abstraction-alert',
            monitoringStationId: '123',
            referenceCode: 'WAA-1234'
          }
        })
      })

      it('returns the redirect url', async () => {
        const result = await SubmitCancelService.go(session.id)

        expect(result).to.equal('/system/monitoring-stations/123')
      })
    })
  })
})
