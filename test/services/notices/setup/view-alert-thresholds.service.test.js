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
const ViewAlertThresholdsService = require('../../../../app/services/notices/setup/view-alert-thresholds.service.js')

describe('Notices - Setup - View Alert Thresholds service', () => {
  let session
  let sessionData
  let licenceMonitoringStations

  beforeEach(async () => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    sessionData = {
      ...AbstractionAlertSessionData.get(licenceMonitoringStations),
      alertType: 'stop'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAlertThresholdsService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
          text: 'Back'
        },
        pageTitle: 'Which thresholds do you need to send an alert for?',
        pageTitleCaption: 'Death star',
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
