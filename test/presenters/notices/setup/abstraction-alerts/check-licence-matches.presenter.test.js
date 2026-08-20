// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Thing under test
import CheckLicenceMatchesPresenter from '../../../../../src/presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js'

describe('Notices - Setup - Abstraction Alerts - Check Licence Matches presenter', () => {
  const filters = {}

  let licenceMonitoringStations
  let session

  beforeEach(async () => {
    filters.absPeriod = null
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
      const result = CheckLicenceMatchesPresenter(filters, session)

      expect(result).toEqual({
        actionHeaderLink: null,
        backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`, text: 'Back' },
        cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
        caption: null,
        clearFilter: false,
        items: [
          {
            checked: false,
            id: '1-2-1-1',
            text: '1 February to 1 January',
            value: '1-2-1-1'
          },
          {
            checked: false,
            id: '1-1-31-3',
            text: '1 January to 31 March',
            value: '1-1-31-3'
          }
        ],
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

    describe('and the abstraction period filter has been applied', () => {
      beforeEach(() => {
        filters.absPeriod = '1-1-31-3'
      })

      it('returns page data for the view', () => {
        const result = CheckLicenceMatchesPresenter(filters, session)

        expect(result).toEqual({
          actionHeaderLink: {
            link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-filtered-thresholds/1-1-31-3`,
            text: 'Remove 2 alerts'
          },
          backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`, text: 'Back' },
          cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
          caption: 'Showing alerts filtered by abstraction period',
          clearFilter: false,
          items: [
            {
              checked: false,
              id: '1-2-1-1',
              text: '1 February to 1 January',
              value: '1-2-1-1'
            },
            {
              checked: true,
              id: '1-1-31-3',
              text: '1 January to 31 March',
              value: '1-1-31-3'
            }
          ],
          pageTitle: 'Check the licence matches for the selected thresholds',
          pageTitleCaption: 'Death star',
          restrictionHeading: 'Flow and level restriction type and threshold',
          restrictions: [
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

      describe('and only one threshold matches the filter', () => {
        beforeEach(() => {
          filters.absPeriod = '1-2-1-1'
        })

        it('returns the "actionHeaderLink" with the alert count in the singular', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.actionHeaderLink).toEqual({
            link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-filtered-thresholds/1-2-1-1`,
            text: 'Remove 1 alert'
          })
        })

        it('still returns the "action" for the matching threshold', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.restrictions).toEqual([
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
            }
          ])
        })

        it('returns the "restrictionHeading" based on the thresholds matching the filter', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.restrictionHeading).toEqual('Level restriction type and threshold')
        })
      })

      describe('and no thresholds match the filter', () => {
        beforeEach(() => {
          filters.absPeriod = '1-2-1-1'
          session.removedThresholds = [licenceMonitoringStations.one.id]
        })

        it('flags that the filter should be cleared', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.clearFilter).toBe(true)
        })

        it('does not return the "caption" or "actionHeaderLink"', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.caption).toBeNull()
          expect(result.actionHeaderLink).toBeNull()
        })

        it('returns all the relevant thresholds unfiltered', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.restrictions).toEqual([
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

        it('returns none of the "items" as checked', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.items).toEqual([
            {
              checked: false,
              id: '1-1-31-3',
              text: '1 January to 31 March',
              value: '1-1-31-3'
            }
          ])
        })
      })
    })

    describe('the "items" property', () => {
      describe('when multiple thresholds share the same abstraction period', () => {
        it('returns a single item for that abstraction period', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.items).toEqual([
            {
              checked: false,
              id: '1-2-1-1',
              text: '1 February to 1 January',
              value: '1-2-1-1'
            },
            {
              checked: false,
              id: '1-1-31-3',
              text: '1 January to 31 March',
              value: '1-1-31-3'
            }
          ])
        })
      })
    })

    describe('the "restrictions" property', () => {
      describe('when there are selected "alertThresholds"', () => {
        it('returns only the thresholds previously selected', () => {
          const result = CheckLicenceMatchesPresenter(filters, session)

          expect(result.restrictions[0]).toEqual({
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
            const result = CheckLicenceMatchesPresenter(filters, session)

            expect(result.restrictions[0].action).toEqual({
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.one.id}`,
              text: 'Remove'
            })
          })
        })

        describe('the "alertDate" property', () => {
          describe('when the "statusUpdatedAt" is not a date', () => {
            it('returns the correct action', () => {
              const result = CheckLicenceMatchesPresenter(filters, session)

              expect(result.restrictions[0].alertDate).toEqual('')
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
              const result = CheckLicenceMatchesPresenter(filters, session)

              expect(result.restrictions[0].alertDate).toEqual('12 May 2025')
            })
          })
        })

        describe('when there are thresholds removed from the list', () => {
          beforeEach(() => {
            session.removedThresholds = [licenceMonitoringStations.one.id]
          })

          it('returns only the thresholds previously selected and not removed', () => {
            const result = CheckLicenceMatchesPresenter(filters, session)

            expect(result.restrictions).toHaveLength(2)

            expect(result.restrictions).toEqual([
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
              const result = CheckLicenceMatchesPresenter(filters, session)

              expect(result.restrictions).toEqual([
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
