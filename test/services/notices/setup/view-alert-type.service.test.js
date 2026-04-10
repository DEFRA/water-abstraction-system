'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../support/fixtures/abstraction-alert-session-data.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewAlertTypeService = require('../../../../app/services/notices/setup/view-alert-type.service.js')

describe('Notices Setup - Setup - View Alert Type service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = AbstractionAlertSessionData.get()
    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAlertTypeService.go(session.id)

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
        pageTitle: 'Select the type of alert you need to send',
        pageTitleCaption: 'Death star'
      })
    })
  })
})
