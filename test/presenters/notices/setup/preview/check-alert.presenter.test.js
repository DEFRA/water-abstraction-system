'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const CheckAlertPresenter = require('../../../../../app/presenters/notices/setup/preview/check-alert.presenter.js')

describe('Notices Setup - Preview - Check Alert Presenter', () => {
  const contactHashId = '7a5efa5da17ab1ead8b8c91e05a0e3f7'

  let licenceMonitoringStations
  let recipientLicenceRefs
  let session

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()
    recipientLicenceRefs = [
      licenceMonitoringStations.one.licence.licenceRef,
      licenceMonitoringStations.two.licence.licenceRef
    ]

    const abstractionAlertSessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    session = {
      id: 'b32018a3-bfd0-4822-8dfa-62f441522669',
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
      ],
      referenceCode: 'WAA-XM0WMH'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckAlertPresenter.go(contactHashId, recipientLicenceRefs, session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/check`,
        caption: 'WAA-XM0WMH',
        pageTitle: 'Check the recipient previews',
        restrictionHeading: 'Flow and level restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 February to 1 January',
            action: {
              link: `/system/notices/setup/${session.id}/preview/${contactHashId}/alert/${licenceMonitoringStations.one.id}`,
              text: 'Preview'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStations.one.licence.id,
            licenceRef: licenceMonitoringStations.one.licence.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000m'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/preview/${contactHashId}/alert/${licenceMonitoringStations.two.id}`,
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

    describe('the "restrictions" property', () => {
      describe('when there are "alertThresholds" that match the recipients licence refs', () => {
        beforeEach(() => {
          recipientLicenceRefs = [licenceMonitoringStations.two.licence.licenceRef]
        })

        it('returns only the thresholds that match the recipients licence refs', () => {
          const result = CheckAlertPresenter.go(contactHashId, recipientLicenceRefs, session)

          expect(result.restrictions).to.equal([
            {
              abstractionPeriod: '1 January to 31 March',
              action: {
                link: `/system/notices/setup/${session.id}/preview/${contactHashId}/alert/${licenceMonitoringStations.two.id}`,
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
          ])
        })

        describe('the "action" property', () => {
          it('returns the correct action', () => {
            const result = CheckAlertPresenter.go(contactHashId, recipientLicenceRefs, session)

            expect(result.restrictions[0].action).to.equal({
              link: `/system/notices/setup/${session.id}/preview/${contactHashId}/alert/${licenceMonitoringStations.two.id}`,
              text: 'Preview'
            })
          })
        })
      })
    })
  })
})
