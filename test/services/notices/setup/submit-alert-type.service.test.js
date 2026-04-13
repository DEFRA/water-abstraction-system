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
const SubmitAlertTypeService = require('../../../../app/services/notices/setup/submit-alert-type.service.js')

describe('Notices - Setup - Submit Alert Type service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = { alertType: 'stop' }
    sessionData = AbstractionAlertSessionData.get()

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('when the "alertType" has not been previously set', () => {
      it('saves the submitted value', async () => {
        await SubmitAlertTypeService.go(session.id, payload)

        expect(session.alertType).to.equal('stop')
        expect(session.$update.called).to.be.true()
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitAlertTypeService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('when the user selects a different "alertType" to a previous selection', () => {
      beforeEach(() => {
        sessionData.alertType = 'resume'
        sessionData.removedThresholds = ['123']

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('sets the "alertThresholds" to an empty array', async () => {
        await SubmitAlertTypeService.go(session.id, payload)

        expect(session.alertThresholds).to.equal([])
        expect(session.$update.called).to.be.true()
      })

      it('sets the "removedThresholds" to an empty array', async () => {
        await SubmitAlertTypeService.go(session.id, payload)

        expect(session.removedThresholds).to.equal([])
        expect(session.$update.called).to.be.true()
      })
    })

    describe('when the user selects the same "alertType" they previously selected', () => {
      beforeEach(() => {
        sessionData.alertType = 'stop'
        sessionData.alertThresholds = ['100-flow']

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('does not change the existing "alertThresholds"', async () => {
        await SubmitAlertTypeService.go(session.id, payload)

        expect(session.alertThresholds).to.equal(['100-flow'])
        expect(session.$update.called).to.be.true()
      })
    })
  })

  describe('when validation fails', () => {
    describe('and no option has been selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertTypeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'notices',
          alertTypeOptions: [
            {
              checked: false,
              hint: {
                text: 'Tell licence holders they may need to reduce or stop water abstraction soon.'
              },
              text: 'Warning',
              value: 'warning'
            },
            {
              checked: false,
              hint: {
                text: 'Tell licence holders they can take water at a reduced amount.'
              },
              text: 'Reduce',
              value: 'reduce'
            },
            {
              checked: false,
              hint: {
                text: 'Tell licence holders they must stop taking water.'
              },
              text: 'Stop',
              value: 'stop'
            },
            {
              checked: false,
              hint: {
                text: 'Tell licence holders they can take water at the normal amount.'
              },
              text: 'Resume',
              value: 'resume'
            }
          ],
          backLink: { href: `/system/monitoring-stations/${sessionData.monitoringStationId}`, text: 'Back' },
          error: {
            alertType: {
              text: 'Select the type of alert you need to send'
            },
            errorList: [
              {
                href: '#alertType',
                text: 'Select the type of alert you need to send'
              }
            ]
          },
          pageTitle: 'Select the type of alert you need to send',
          pageTitleCaption: 'Death star'
        })
      })
    })

    describe('and "stop" or "reduce" have been selected but no thresholds have that alert type', () => {
      beforeEach(() => {
        payload = { alertType: 'stop' }

        sessionData.licenceMonitoringStations = [
          {
            ...sessionData.licenceMonitoringStations[0],
            restrictionType: 'warning'
          }
        ]

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('returns page data for the view, with errors (and the selected alert type checked)', async () => {
        const result = await SubmitAlertTypeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'notices',
          alertTypeOptions: [
            {
              checked: false,
              hint: {
                text: 'Tell licence holders they may need to reduce or stop water abstraction soon.'
              },
              text: 'Warning',
              value: 'warning'
            },
            {
              checked: false,
              hint: {
                text: 'Tell licence holders they can take water at a reduced amount.'
              },
              text: 'Reduce',
              value: 'reduce'
            },
            {
              checked: true,
              hint: {
                text: 'Tell licence holders they must stop taking water.'
              },
              text: 'Stop',
              value: 'stop'
            },
            {
              checked: false,
              hint: {
                text: 'Tell licence holders they can take water at the normal amount.'
              },
              text: 'Resume',
              value: 'resume'
            }
          ],
          backLink: { href: `/system/monitoring-stations/${sessionData.monitoringStationId}`, text: 'Back' },
          error: {
            alertType: {
              text: 'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
            },
            errorList: [
              {
                href: '#alertType',
                text: 'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
              }
            ]
          },
          pageTitle: 'Select the type of alert you need to send',
          pageTitleCaption: 'Death star'
        })
      })
    })
  })
})
