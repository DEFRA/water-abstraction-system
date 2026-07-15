// Test helpers
import { generateUUID } from '../../../app/lib/general.lib.js'
import { generateUserId } from '../../support/helpers/user.helper.js'
import { licenceEnds } from '../../support/fixtures/licence.fixture.js'

// Thing under test
import ViewLicencePresenter from '../../../app/presenters/monitoring-stations/view-licence.presenter.js'

describe('Monitoring Stations - View Licence presenter', () => {
  let auth
  let licence
  let licenceMonitoringStations
  let monitoringStation

  beforeEach(() => {
    auth = {
      credentials: {
        scope: ['billing', 'hof_notifications', 'manage_gauging_station_licence_links']
      }
    }

    licence = licenceEnds()

    licenceMonitoringStations = [
      {
        createdAt: new Date('2025-08-07T13:49:42.953Z'),
        id: generateUUID(),
        latestNotification: null,
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 500,
        licenceVersionPurposeCondition: null,
        user: {
          id: generateUserId(),
          username: 'environment.officer@wrls.gov.uk'
        }
      },
      {
        createdAt: new Date('2025-08-06T13:49:42.951Z'),
        id: generateUUID(),
        restrictionType: 'stop',
        latestNotification: {
          addressLine1: null,
          createdAt: '2025-08-26T21:22:05',
          id: generateUUID(),
          messageType: 'email',
          recipient: 'carol.shaw@atari.com',
          sendingAlertType: 'resume'
        },
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        licenceVersionPurposeCondition: {
          externalId: '9:99305:1:1234',
          id: generateUUID(),
          notes: 'This is the effect of restriction',
          licenceVersionPurpose: {
            id: generateUUID(),
            licenceVersion: {
              id: generateUUID(),
              status: 'current'
            }
          },
          licenceVersionPurposeConditionType: {
            id: generateUUID(),
            displayTitle: 'Rates m3 per day'
          }
        },
        user: {
          id: generateUserId(),
          username: 'environment.officer@wrls.gov.uk'
        }
      }
    ]
    monitoringStation = { id: generateUUID(), label: 'Hades', riverName: 'The River Styx' }
  })

  it('correctly presents the data', () => {
    const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

    expect(result).toEqual({
      backLink: {
        href: `/system/monitoring-stations/${monitoringStation.id}`,
        text: 'Go back to monitoring station'
      },
      lastAlertSentForLicence: 'Resume email on 26 August 2025 sent to carol.shaw@atari.com',
      licenceTags: [
        {
          actions: {
            items: [
              {
                href: `/system/licence-monitoring-station/${licenceMonitoringStations[0].id}/remove`,
                text: 'Remove tag',
                visuallyHiddenText: 'Remove Reduce tag Created on 7 August 2025 by environment.officer@wrls.gov.uk'
              }
            ]
          },
          created: 'Created on 7 August 2025 by environment.officer@wrls.gov.uk',
          displaySupersededWarning: false,
          effectOfRestriction: null,
          lastAlertSent: '',
          licenceMonitoringStationId: licenceMonitoringStations[0].id,
          linkedCondition: 'Not linked to a condition',
          tag: 'Reduce tag',
          threshold: '500m3/s',
          type: 'Reduce'
        },
        {
          actions: {
            items: [
              {
                href: `/system/licence-monitoring-station/${licenceMonitoringStations[1].id}/remove`,
                text: 'Remove tag',
                visuallyHiddenText: 'Remove Stop tag Created on 6 August 2025 by environment.officer@wrls.gov.uk'
              }
            ]
          },
          created: 'Created on 6 August 2025 by environment.officer@wrls.gov.uk',
          displaySupersededWarning: false,
          effectOfRestriction: 'This is the effect of restriction',
          lastAlertSent: 'Resume email on 26 August 2025 sent to carol.shaw@atari.com',
          licenceMonitoringStationId: licenceMonitoringStations[1].id,
          linkedCondition: 'Rates m3 per day, NALD ID 1234',
          tag: 'Stop tag',
          threshold: '100m3/s',
          type: 'Stop'
        }
      ],
      pageTitle: `Details for ${licence.licenceRef}`,
      pageTitleCaption: 'The River Styx at Hades',
      warning: null
    })
  })

  describe('the "lastAlertSentForLicence" property', () => {
    describe('when none of the licence monitoring stations is linked to an alert', () => {
      beforeEach(() => {
        licenceMonitoringStations[1].latestNotification = null
      })

      it('returns null', () => {
        const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

        expect(result.lastAlertSentForLicence).toBeNull()
      })
    })

    describe('when just one licence monitoring stations is linked to an alert', () => {
      it('returns that records alert details', () => {
        const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

        expect(result.lastAlertSentForLicence).toEqual('Resume email on 26 August 2025 sent to carol.shaw@atari.com')
      })
    })

    describe('when multiple licence monitoring stations are linked to an alert', () => {
      beforeEach(() => {
        licenceMonitoringStations[0].latestNotification = {
          addressLine1: 'Dr Watson',
          createdAt: '2025-08-25T21:22:05',
          id: '5f506edd-9a5f-47a3-afe7-0c54f9e3b231',
          messageType: 'letter',
          recipient: null,
          sendingAlertType: 'warning'
        }
      })

      it('returns the details of the most recent alert', () => {
        const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

        expect(result.lastAlertSentForLicence).toEqual('Resume email on 26 August 2025 sent to carol.shaw@atari.com')
      })
    })
  })

  describe('the "licenceTags" property', () => {
    describe('the "actions" property', () => {
      describe('when the user has permissions to remove tags', () => {
        it('returns an "items" object need by the govukSummaryList to display a link to the remove page', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[0].actions).toEqual({
            items: [
              {
                href: `/system/licence-monitoring-station/${licenceMonitoringStations[0].id}/remove`,
                text: 'Remove tag',
                visuallyHiddenText: 'Remove Reduce tag Created on 7 August 2025 by environment.officer@wrls.gov.uk'
              }
            ]
          })
          expect(result.licenceTags[1].actions).toEqual({
            items: [
              {
                href: `/system/licence-monitoring-station/${licenceMonitoringStations[1].id}/remove`,
                text: 'Remove tag',
                visuallyHiddenText: 'Remove Stop tag Created on 6 August 2025 by environment.officer@wrls.gov.uk'
              }
            ]
          })
        })
      })

      describe('when the user does not have permissions to remove tags', () => {
        beforeEach(() => {
          auth.credentials.scope = ['billing', 'hof_notifications']
        })

        it('returns null', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[0].actions).toBeNull()
          expect(result.licenceTags[1].actions).toBeNull()
        })
      })
    })

    describe('the "created" property', () => {
      describe('when the user that created the licence monitoring station is known', () => {
        it('returns when it was created and who by', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[0].created).toEqual('Created on 7 August 2025 by environment.officer@wrls.gov.uk')
          expect(result.licenceTags[1].created).toEqual('Created on 6 August 2025 by environment.officer@wrls.gov.uk')
        })
      })

      describe('when the user that created the licence monitoring station is not known', () => {
        beforeEach(() => {
          licenceMonitoringStations[0].user = null
          licenceMonitoringStations[1].user = null
        })

        it('returns just when it was created', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[0].created).toEqual('Created on 7 August 2025')
          expect(result.licenceTags[1].created).toEqual('Created on 6 August 2025')
        })
      })
    })

    describe('the "displaySupersededWarning" property', () => {
      describe('when the licence monitoring station is linked via its condition to a superseded licence version', () => {
        beforeEach(() => {
          licenceMonitoringStations[1].licenceVersionPurposeCondition.licenceVersionPurpose.licenceVersion.status =
            'superseded'
        })

        it('returns true (display the warning)', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[1].displaySupersededWarning).toBe(true)
        })
      })

      describe('when the licence monitoring station is linked via its condition to a current licence version', () => {
        it('returns false (do not display the warning)', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[1].displaySupersededWarning).toBe(false)
        })
      })

      describe('when the licence monitoring station is not linked to a condition', () => {
        it('returns false (do not display the warning)', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[1].displaySupersededWarning).toBe(false)
        })
      })
    })

    describe('the "effectOfRestriction" property', () => {
      describe('when the licence monitoring station is linked to a condition with notes', () => {
        it('returns the notes', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[1].effectOfRestriction).toEqual('This is the effect of restriction')
        })
      })

      describe('when the licence monitoring station is linked to a condition without notes', () => {
        beforeEach(() => {
          licenceMonitoringStations[1].licenceVersionPurposeCondition.notes = null
        })

        it('returns null', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[1].effectOfRestriction).toBeNull()
        })
      })

      describe('when the licence monitoring station is not linked to a condition', () => {
        it('returns null', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[0].effectOfRestriction).toBeNull()
        })
      })
    })

    describe('the "lastAlertSent" property', () => {
      describe('when there is only one licence monitoring station', () => {
        beforeEach(() => {
          licenceMonitoringStations = [licenceMonitoringStations[1]]
        })

        it('returns null (we are already showing it in the "lastAlertSentForLicence" property)', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[0].lastAlertSent).toBeNull()
          expect(result.lastAlertSentForLicence).toEqual('Resume email on 26 August 2025 sent to carol.shaw@atari.com')
        })
      })

      describe('when multiple licence monitoring stations', () => {
        describe('when a licence monitoring station has a latest notification', () => {
          describe('and it was an email', () => {
            it('returns the details of the alert', () => {
              const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

              expect(result.licenceTags[1].lastAlertSent).toEqual(
                'Resume email on 26 August 2025 sent to carol.shaw@atari.com'
              )
            })
          })

          describe('and it was a letter', () => {
            beforeEach(() => {
              licenceMonitoringStations[1].latestNotification.addressLine1 = 'Sherlock Holmes'
              licenceMonitoringStations[1].latestNotification.messageType = 'letter'
              licenceMonitoringStations[1].latestNotification.recipient = null
            })

            it('returns the details of the alert', () => {
              const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

              expect(result.licenceTags[1].lastAlertSent).toEqual(
                'Resume letter on 26 August 2025 sent to Sherlock Holmes'
              )
            })
          })
        })

        describe('when licence monitoring station does not have a latest notification', () => {
          it('returns an empty string (indicates show row in the view but leave empty)', () => {
            const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

            expect(result.licenceTags[0].lastAlertSent).toEqual('')
          })
        })
      })
    })

    describe('the "linkedCondition" property', () => {
      describe('when the licence monitoring station is linked to a condition', () => {
        it('returns the details of the condition', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[1].linkedCondition).toEqual('Rates m3 per day, NALD ID 1234')
        })
      })

      describe('when the licence monitoring station is not linked to a condition', () => {
        it('returns "Not linked to a condition"', () => {
          const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

          expect(result.licenceTags[0].linkedCondition).toEqual('Not linked to a condition')
        })
      })
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when the monitoring station has a river name recorded', () => {
      it('returns both the station and river name', () => {
        const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

        expect(result.pageTitleCaption).toEqual('The River Styx at Hades')
      })
    })

    describe('when the monitoring station does not have a river name recorded', () => {
      beforeEach(() => {
        monitoringStation.riverName = null
      })

      it('returns just the station name', () => {
        const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

        expect(result.pageTitleCaption).toEqual('Hades')
      })
    })
  })

  describe('the "warning" property', () => {
    describe('when the licence has ended', () => {
      beforeEach(() => {
        licence = licenceEnds(new Date('2000-01-01'))
      })

      it('returns the warning', () => {
        const result = ViewLicencePresenter(licence, licenceMonitoringStations, monitoringStation, auth)

        expect(result.warning).toEqual({
          iconFallbackText: 'Warning',
          text: 'This licence expired on 1 January 2000'
        })
      })
    })
  })
})
