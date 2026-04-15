'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../support/fixtures/abstraction-alert-session-data.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitAlertThresholdsService = require('../../../../app/services/notices/setup/submit-alert-thresholds.service.js')

describe.skip('Notices - Setup - Submit Alert Thresholds service', () => {
  let fetchSessionStub
  let licenceMonitoringStations
  let payload
  let session
  let sessionData

  describe('when called', () => {
    beforeEach(() => {
      licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

      sessionData = {
        ...AbstractionAlertSessionData.get(licenceMonitoringStations),
        alertType: 'stop'
      }

      payload = {
        alertThresholds: [licenceMonitoringStations.one.thresholdGroup, licenceMonitoringStations.two.thresholdGroup]
      }

      session = SessionModelStub.build(Sinon, sessionData)

      fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('continues the journey', async () => {
      const result = await SubmitAlertThresholdsService.go(session.id, payload)

      expect(result).to.equal({})
    })

    describe('and updates the session ', () => {
      describe('and one threshold has been selected ', () => {
        beforeEach(() => {
          payload = {
            alertThresholds: licenceMonitoringStations.one.thresholdGroup
          }
        })

        it('saves the submitted value as an array', async () => {
          await SubmitAlertThresholdsService.go(session.id, payload)

          expect(session.alertThresholds).to.equal([licenceMonitoringStations.one.thresholdGroup])
          expect(session.$update.called).to.be.true()
        })
      })

      describe('and more than one threshold has been selected ', () => {
        it('saves the submitted values as an array', async () => {
          await SubmitAlertThresholdsService.go(session.id, payload)

          expect(session.alertThresholds).to.equal([
            licenceMonitoringStations.one.thresholdGroup,
            licenceMonitoringStations.two.thresholdGroup
          ])

          expect(session.$update.called).to.be.true()
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('and there are no previous "alertThresholds"', () => {
      beforeEach(() => {
        const abstractionAlertSessionData = AbstractionAlertSessionData.get()

        sessionData = {
          ...abstractionAlertSessionData,
          alertThresholds: [licenceMonitoringStations.one.thresholdGroup],
          alertType: 'stop'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)

        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertThresholdsService.go(session.id, payload)

        expect(result).to.equal({
          error: {
            alertThresholds: {
              text: 'Select applicable threshold(s)'
            },
            errorList: [
              {
                href: '#alertThresholds',
                text: 'Select applicable threshold(s)'
              }
            ]
          },
          backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`, text: 'Back' },
          pageTitleCaption: 'Death star',
          pageTitle: 'Which thresholds do you need to send an alert for?',
          thresholdOptions: [
            {
              checked: false,
              hint: {
                text: 'Flow threshold'
              },
              text: '100m3/s',
              value: licenceMonitoringStations.two.thresholdGroup
            }
          ]
        })
      })
    })

    describe('and there are previous "alertThresholds"', () => {
      beforeEach(() => {
        const abstractionAlertSessionData = AbstractionAlertSessionData.get()

        sessionData = {
          ...abstractionAlertSessionData,
          alertThresholds: [licenceMonitoringStations.one.thresholdGroup],
          alertType: 'stop'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)

        payload = {}
      })

      it('returns page data for the view, with errors, and all the thresholds unselected', async () => {
        const result = await SubmitAlertThresholdsService.go(session.id, payload)

        expect(result).to.equal({
          error: {
            alertThresholds: {
              text: 'Select applicable threshold(s)'
            },
            errorList: [
              {
                href: '#alertThresholds',
                text: 'Select applicable threshold(s)'
              }
            ]
          },
          backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`, text: 'Back' },
          pageTitleCaption: 'Death star',
          pageTitle: 'Which thresholds do you need to send an alert for?',
          thresholdOptions: [
            {
              checked: false,
              hint: {
                text: 'Flow threshold'
              },
              text: '100m3/s',
              value: licenceMonitoringStations.two.thresholdGroup
            }
          ]
        })
      })
    })
  })
})
