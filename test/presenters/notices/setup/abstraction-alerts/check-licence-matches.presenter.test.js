'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const CheckLicenceMatchesPresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js')

describe('Notices Setup - Abstraction Alerts - Check Licence Matches presenter', () => {
  let licenceMonitoringStations
  let session

  beforeEach(async () => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    const abstractionAlertSessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    session = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
      ]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckLicenceMatchesPresenter.go(session)

      expect(result).to.equal({
        backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`, text: 'Back' },
        cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
        pageTitle: 'Check the licence matches for the selected thresholds',
        pageTitleCaption: 'Death star',
        restrictionHeading: 'Flow and level restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 February to 1 January',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.one.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.one.licence.id,
            licenceRef: licenceMonitoringStations.one.licence.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000m'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.two.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.two.licence.id,
            licenceRef: licenceMonitoringStations.two.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100m3/s'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.three.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.three.licence.id,
            licenceRef: licenceMonitoringStations.three.licence.licenceRef,
            restriction: 'Stop or reduce',
            restrictionCount: 1,
            threshold: '100m'
          }
        ]
      })
    })

    describe('the "restrictions" property', () => {
      describe('when there are selected "alertThresholds"', () => {
        it('returns only the thresholds previously selected', () => {
          const result = CheckLicenceMatchesPresenter.go(session)

          expect(result.restrictions[0]).to.equal({
            abstractionPeriod: '1 February to 1 January',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.one.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.one.licence.id,
            licenceRef: licenceMonitoringStations.one.licence.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000m'
          })
        })

        describe('the "action" property', () => {
          it('returns the correct action', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].action).to.equal({
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.one.id}`,
              text: 'Remove'
            })
          })
        })

        describe('the "alertDate" property', () => {
          describe('when the "statusUpdatedAt" is not a date', () => {
            it('returns the correct action', () => {
              const result = CheckLicenceMatchesPresenter.go(session)

              expect(result.restrictions[0].alertDate).to.equal('')
            })
          })

          describe('when the "statusUpdatedAt" is a string', () => {
            beforeEach(() => {
              session.licenceMonitoringStations[0].latestNotification = {
                createdAt: new Date('2025-05-12'),
                id: 'cf2f5564-0659-4d2f-873d-99bf3c065548',
                sendingAlertType: 'resume'
              }
            })

            it('returns the correct action', () => {
              const result = CheckLicenceMatchesPresenter.go(session)

              expect(result.restrictions[0].alertDate).to.equal('12 May 2025')
            })
          })
        })

        describe('when there are thresholds removed from the list', () => {
          beforeEach(() => {
            session.removedThresholds = [licenceMonitoringStations.one.id]
          })

          it('returns only the thresholds previously selected and not removed', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions.length).to.equal(2)

            expect(result.restrictions).to.equal([
              {
                abstractionPeriod: '1 January to 31 March',
                action: {
                  link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.two.id}`,
                  text: 'Remove'
                },
                alert: '',
                alertDate: '',
                licenceId: licenceMonitoringStations.two.licence.id,
                licenceRef: licenceMonitoringStations.two.licence.licenceRef,
                restriction: 'Stop',
                restrictionCount: 1,
                threshold: '100m3/s'
              },
              {
                abstractionPeriod: '1 January to 31 March',
                action: {
                  link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.three.id}`,
                  text: 'Remove'
                },
                alert: '',
                alertDate: '',
                licenceId: licenceMonitoringStations.three.licence.id,
                licenceRef: licenceMonitoringStations.three.licence.licenceRef,
                restriction: 'Stop or reduce',
                restrictionCount: 1,
                threshold: '100m'
              }
            ])
          })

          describe('when there is only one threshold left to display', () => {
            beforeEach(() => {
              session.removedThresholds = [licenceMonitoringStations.one.id, licenceMonitoringStations.two.id]
            })

            it('should not show any remove links for the remaining restriction', () => {
              const result = CheckLicenceMatchesPresenter.go(session)

              expect(result.restrictions).to.equal([
                {
                  abstractionPeriod: '1 January to 31 March',
                  action: null,
                  alert: '',
                  alertDate: '',
                  licenceId: licenceMonitoringStations.three.licence.id,
                  licenceRef: licenceMonitoringStations.three.licence.licenceRef,
                  restriction: 'Stop or reduce',
                  restrictionCount: 1,
                  threshold: '100m'
                }
              ])
            })
          })
        })
      })
    })
  })
})
