'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionDataFixture = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const RecipientsFixture = require('../../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Things we need to stub
const DetermineRecipientsService = require('../../../../../app/services/notices/setup/determine-recipients.service.js')
const FetchAbstractionAlertRecipientsService = require('../../../../../app/services/notices/setup/fetch-abstraction-alert-recipients.service.js')

// Thing under test
const CheckAlertService = require('../../../../../app/services/notices/setup/preview/check-alert.service.js')

describe('Notices Setup - Preview - Preview service', () => {
  let licenceMonitoringStations
  let recipients
  let session
  let testRecipient
  let testRecipients

  beforeEach(async () => {
    // Populate the session with abstraction alert data
    licenceMonitoringStations = AbstractionAlertSessionDataFixture.licenceMonitoringStations()

    const abstractionAlertSessionData = AbstractionAlertSessionDataFixture.get(licenceMonitoringStations)
    const sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
      ],
      referenceCode: 'WAA-XM0WMH'
    }

    session = await SessionHelper.add({ data: sessionData })

    // Create the recipients data
    recipients = RecipientsFixture.recipients()
    testRecipients = [recipients.primaryUser]
    // Assign the licence ref to the recipient of the alert to be displayed
    testRecipients[0].licence_refs = licenceMonitoringStations.two.licence.licenceRef
    testRecipient = testRecipients[0]

    Sinon.stub(DetermineRecipientsService, 'go').returns(testRecipients)
    Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await CheckAlertService.go(testRecipient.contact_hash_id, session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/check`,
        caption: 'WAA-XM0WMH',
        pageTitle: 'Check the recipient previews',
        restrictionHeading: 'Flow and level restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}/alert/${licenceMonitoringStations.two.id}`,
              text: 'Preview'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStations.two.licence.id,
            licenceRef: licenceMonitoringStations.two.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100m3/s'
          }
        ]
      })
    })
  })
})
