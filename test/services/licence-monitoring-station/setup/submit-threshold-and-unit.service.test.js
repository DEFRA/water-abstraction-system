'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitThresholdAndUnitService = require('../../../../app/services/licence-monitoring-station/setup/submit-threshold-and-unit.service.js')

describe('Licence Monitoring Station Setup - Threshold and Unit service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      data: {
        label: 'Monitoring Station Label',
        monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869'
      }
    }

    session = await SessionHelper.add(sessionData)
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = { threshold: '1000', unit: 'Ml/d' }
      })

      it('saves the submitted option', async () => {
        await SubmitThresholdAndUnitService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.threshold).to.equal(1000)
        expect(refreshedSession.unit).to.equal('Ml/d')
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitThresholdAndUnitService.go(session.id, payload)

          expect(result).to.equal({
            checkPageVisited: undefined
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitThresholdAndUnitService.go(session.id, payload)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {
          unit: 'select'
        }
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitThresholdAndUnitService.go(session.id, payload)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            backLink: '/system/monitoring-stations/e1c44f9b-51c2-4aee-a518-5509d6f05869',
            displayUnits: [
              { value: 'Ml/d', text: 'Ml/d', selected: false },
              { value: 'm3/s', text: 'm3/s', selected: false },
              { value: 'm3/d', text: 'm3/d', selected: false },
              { value: 'l/s', text: 'l/s', selected: false },
              { value: 'mAOD', text: 'mAOD', selected: false },
              { value: 'mBOD', text: 'mBOD', selected: false },
              { value: 'mASD', text: 'mASD', selected: false },
              { value: 'm', text: 'm', selected: false },
              { value: 'SLD', text: 'SLD', selected: false },
              { value: 'ft3/s', text: 'ft3/s', selected: false },
              { value: 'gpd', text: 'gpd', selected: false },
              { value: 'Mgpd', text: 'Mgpd', selected: false },
              { value: 'select', text: 'Select an option', selected: true }
            ],
            monitoringStationLabel: 'Monitoring Station Label',
            pageTitle: 'What is the licence hands-off flow or level threshold?',
            threshold: null
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not entered or selected anything', () => {
        it('includes an error for both input elements and radio elements', async () => {
          const result = await SubmitThresholdAndUnitService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [
              { href: '#threshold', text: 'Enter a threshold' },
              { href: '#unit', text: 'Select which units to use' }
            ],
            threshold: { message: 'Enter a threshold' },
            unit: { message: 'Select which units to use' }
          })
        })
      })

      describe('because the user has not entered the "threshold"', () => {
        beforeEach(async () => {
          payload = {
            unit: 'Ml/d'
          }
        })

        it('includes an error for the threshold input elements', async () => {
          const result = await SubmitThresholdAndUnitService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [{ href: '#threshold', text: 'Enter a threshold' }],
            threshold: { message: 'Enter a threshold' }
          })
        })
      })

      describe('because the user has not selected the "unit"', () => {
        beforeEach(async () => {
          payload = {
            threshold: '1000',
            unit: 'select'
          }
        })

        it('includes an error for the unit radio elements', async () => {
          const result = await SubmitThresholdAndUnitService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [{ href: '#unit', text: 'Select which units to use' }],
            unit: { message: 'Select which units to use' }
          })
        })
      })
    })
  })
})
