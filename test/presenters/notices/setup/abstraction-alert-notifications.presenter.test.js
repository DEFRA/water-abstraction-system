'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../fixtures/abstraction-alert-session-data.fixture.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const AbstractionAlertsNotificationsPresenter = require('../../../../app/presenters/notices/setup/abstraction-alerts-notifications.presenter.js')

describe('Notices - Setup - Abstraction alert notifications presenter', () => {
  const eventId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'
  const referenceCode = 'TEST-123'

  let clock
  let recipients
  let session
  let testRecipients

  beforeEach(() => {
    recipients = RecipientsFixture.alertsRecipients()

    testRecipients = [...Object.values(recipients)]

    const abstractionAlertSessionData = AbstractionAlertSessionData.get()

    const relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
      recipients.primaryUser.licence_refs,
      recipients.licenceHolder.licence_refs,
      recipients.additionalContact.licence_refs
    ])

    session = {
      ...abstractionAlertSessionData,
      alertEmailAddress: 'luke.skywalker@rebelmail.test',
      alertType: 'warning',
      journey: 'abstraction-alerts',
      referenceCode,
      relevantLicenceMonitoringStations
    }

    clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
    const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

    expect(result).to.equal([
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        reference: 'TEST-123',
        templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
        licences: `["${recipients.primaryUser.licence_refs}"]`,
        messageType: 'email',
        messageRef: 'water_abstraction_alert_reduce_warning_email',
        personalisation: {
          condition_text: '',
          flow_or_level: 'level',
          issuer_email_address: 'luke.skywalker@rebelmail.test',
          licence_ref: recipients.primaryUser.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm',
          threshold_value: 1000
        },

        recipient: 'primary.user@important.com'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        reference: 'TEST-123',
        templateId: '27499bbd-e854-4f13-884e-30e0894526b6',
        licences: `["${recipients.licenceHolder.licence_refs}"]`,
        messageType: 'letter',
        messageRef: 'water_abstraction_alert_stop_warning',
        personalisation: {
          name: 'Mr H J Licence holder',
          address_line_1: '1',
          address_line_2: 'Privet Drive',
          address_line_3: 'Little Whinging',
          address_line_4: 'Surrey',
          address_line_5: 'WD25 7LR',
          // common personalisation
          condition_text: 'Effect of restriction: I have a bad feeling about this',
          flow_or_level: 'flow',
          issuer_email_address: 'luke.skywalker@rebelmail.test',
          licence_ref: recipients.licenceHolder.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm3/s',
          threshold_value: 100
        }
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        reference: 'TEST-123',
        templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
        licences: `["${recipients.additionalContact.licence_refs}"]`,
        messageType: 'email',
        messageRef: 'water_abstraction_alert_stop_warning_email',
        personalisation: {
          condition_text: '',
          flow_or_level: 'level',
          issuer_email_address: 'luke.skywalker@rebelmail.test',
          licence_ref: recipients.additionalContact.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm',
          threshold_value: 100
        },
        recipient: 'additional.contact@important.com'
      }
    ])
  })

  describe('when a licence has more than one licence monitoring stations to send alerts to', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
        recipients.primaryUser.licence_refs,
        recipients.primaryUser.licence_refs
      ])
    })

    it('correctly transform the recipients (and associated licence monitoring stations) into notifications for the same recipient', () => {
      const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result).to.equal([
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
          licences: `["${recipients.primaryUser.licence_refs}"]`,
          messageType: 'email',
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          personalisation: {
            condition_text: '',
            flow_or_level: 'level',
            issuer_email_address: 'luke.skywalker@rebelmail.test',
            licence_ref: recipients.primaryUser.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm',
            threshold_value: 1000
          },
          recipient: 'primary.user@important.com'
        },
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          licences: `["${recipients.primaryUser.licence_refs}"]`,
          messageRef: 'water_abstraction_alert_stop_warning_email',
          messageType: 'email',
          personalisation: {
            condition_text: 'Effect of restriction: I have a bad feeling about this',
            flow_or_level: 'flow',
            issuer_email_address: 'luke.skywalker@rebelmail.test',
            licence_ref: recipients.primaryUser.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm3/s',
            threshold_value: 100
          },
          recipient: 'primary.user@important.com',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f'
        }
      ])
    })
  })

  describe('when a "additional contact" has abstraction alerts', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
        recipients.additionalContact.licence_refs
      ])

      testRecipients[0].licence_refs = recipients.additionalContact.licence_refs
    })

    it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
      const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result).to.equal([
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
          licences: `["${recipients.additionalContact.licence_refs}"]`,
          messageType: 'email',
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          personalisation: {
            condition_text: '',
            flow_or_level: 'level',
            issuer_email_address: 'luke.skywalker@rebelmail.test',
            licence_ref: recipients.additionalContact.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm',
            threshold_value: 1000
          },
          recipient: 'additional.contact@important.com'
        }
      ])
    })
  })

  describe('when a "primaryUser" has abstraction alerts', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
        recipients.primaryUser.licence_refs
      ])

      testRecipients[0].licence_refs = recipients.licenceHolder.licence_refs
    })

    it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
      const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result).to.equal([
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
          licences: `["${recipients.primaryUser.licence_refs}"]`,
          messageType: 'email',
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          personalisation: {
            condition_text: '',
            flow_or_level: 'level',
            issuer_email_address: 'luke.skywalker@rebelmail.test',
            licence_ref: recipients.primaryUser.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm',
            threshold_value: 1000
          },
          recipient: 'primary.user@important.com'
        }
      ])
    })
  })

  describe('when a "licenceHolder" has abstraction alerts', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
        recipients.licenceHolder.licence_refs
      ])
    })

    it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
      const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result).to.equal([
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: '27499bbd-e854-4f13-884e-30e0894526b6',
          licences: `["${recipients.licenceHolder.licence_refs}"]`,
          messageType: 'letter',
          messageRef: 'water_abstraction_alert_reduce_warning',
          personalisation: {
            name: 'Mr H J Licence holder',
            address_line_1: '1',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            // common personalisation
            condition_text: '',
            flow_or_level: 'level',
            issuer_email_address: 'luke.skywalker@rebelmail.test',
            licence_ref: recipients.licenceHolder.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm',
            threshold_value: 1000
          }
        }
      ])
    })
  })

  describe('the "personalisation" object', () => {
    beforeEach(() => {
      testRecipients[0].licence_refs = recipients.licenceHolder.licence_refs
    })

    it('correctly sets the "personalisation" object', () => {
      const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result.personalisation).to.equal({
        condition_text: '',
        flow_or_level: 'level',
        issuer_email_address: 'luke.skywalker@rebelmail.test',
        licence_ref: recipients.primaryUser.licence_refs,
        monitoring_station_name: 'Death star',
        source: '* Source of supply: Meridian Trench',
        threshold_unit: 'm',
        threshold_value: 1000
      })
    })

    describe('when the "notes"', () => {
      describe('has a value', () => {
        it('correctly sets "condition_text"', () => {
          const [, result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

          expect(result.personalisation.condition_text).to.equal(
            'Effect of restriction: I have a bad feeling about this'
          )
        })
      })

      describe('is null', () => {
        it('correctly defaults the "condition_text"', () => {
          const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

          expect(result.personalisation.condition_text).to.equal('')
        })
      })
    })

    describe('when the "source"', () => {
      describe('has a value', () => {
        it('correctly sets "source"', () => {
          const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

          expect(result.personalisation.source).to.equal('* Source of supply: Meridian Trench')
        })
      })

      describe('is an empty string ""', () => {
        beforeEach(() => {
          session.monitoringStationRiverName = ''
        })

        it('correctly defaults the "source"', () => {
          const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

          expect(result.personalisation.source).to.equal('')
        })
      })

      describe('is null', () => {
        beforeEach(() => {
          session.monitoringStationRiverName = null
        })

        it('correctly defaults the "source"', () => {
          const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

          expect(result.personalisation.source).to.equal('')
        })
      })
    })
  })

  describe('the "messageRef"', () => {
    describe('when the alert type', () => {
      describe('and "restrictionType" ', () => {
        describe('are not set', () => {
          beforeEach(() => {
            _setupAlertAndRestrictionTypeData(session, recipients, false, '')

            session.alertType = ''
          })

          it('correctly sets the default message ref', () => {
            const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

            expect(result.messageRef).to.equal('water_abstraction_alert')
          })
        })
      })
      describe('is "resume"', () => {
        beforeEach(() => {
          session.alertType = 'resume'
        })

        describe('and the notification ', () => {
          describe('is an email', () => {
            beforeEach(() => {
              _setupAlertAndRestrictionTypeData(session, recipients, true)
            })

            it('correctly sets the message ref', () => {
              const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

              expect(result.messageRef).to.equal('water_abstraction_alert_resume_email')
            })

            describe('is a letter', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients)
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.messageRef).to.equal('water_abstraction_alert_resume')
              })
            })
          })
        })
      })

      describe('is "reduce"', () => {
        beforeEach(() => {
          session.alertType = 'reduce'
        })

        describe('and the "restrictionType" is "stop_or_reduce"', () => {
          describe('and the notification ', () => {
            describe('is an email', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients, true, 'stop_or_reduce')
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.messageRef).to.equal('water_abstraction_alert_reduce_or_stop_email')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'stop_or_reduce')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.messageRef).to.equal('water_abstraction_alert_reduce_or_stop')
                })
              })
            })
          })
        })

        describe('and the "restrictionType" is not "stop_or_reduce"', () => {
          describe('and the notification ', () => {
            describe('is an email', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients, true, 'reduce')
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.messageRef).to.equal('water_abstraction_alert_reduce_email')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'reduce')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.messageRef).to.equal('water_abstraction_alert_reduce')
                })
              })
            })
          })
        })
      })

      describe('is "stop"', () => {
        beforeEach(() => {
          session.alertType = 'stop'
        })

        describe('and the notification ', () => {
          describe('is an email', () => {
            beforeEach(() => {
              _setupAlertAndRestrictionTypeData(session, recipients, true)
            })

            it('correctly sets the message ref', () => {
              const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

              expect(result.messageRef).to.equal('water_abstraction_alert_stop_email')
            })

            describe('is a letter', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients)
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.messageRef).to.equal('water_abstraction_alert_stop')
              })
            })
          })
        })
      })

      describe('is "warning"', () => {
        beforeEach(() => {
          session.alertType = 'warning'
        })

        describe('and the "restrictionType" is "reduce"', () => {
          describe('and the notification ', () => {
            describe('is an email', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients, true, 'reduce')
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.messageRef).to.equal('water_abstraction_alert_reduce_warning_email')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'reduce')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.messageRef).to.equal('water_abstraction_alert_reduce_warning')
                })
              })
            })
          })
        })

        describe('and the "restrictionType" is "stop_or_reduce"', () => {
          describe('and the notification ', () => {
            describe('is an email', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients, true, 'stop_or_reduce')
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.messageRef).to.equal('water_abstraction_alert_reduce_or_stop_warning_email')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'stop_or_reduce')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.messageRef).to.equal('water_abstraction_alert_reduce_or_stop_warning')
                })
              })
            })
          })
        })

        describe('and the "restrictionType" is "stop"', () => {
          describe('and the notification ', () => {
            describe('is an email', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients, true, 'stop')
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.messageRef).to.equal('water_abstraction_alert_stop_warning_email')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'stop')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.messageRef).to.equal('water_abstraction_alert_stop_warning')
                })
              })
            })
          })
        })
      })
    })
  })
})

/**
 * The primary user is an email, the licence holder is a letter
 *
 * @private
 */
function _setupAlertAndRestrictionTypeData(session, recipients, email = false, restrictionType = 'stop') {
  if (email) {
    session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
      recipients.primaryUser.licence_refs
    ])
  } else {
    session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
      recipients.licenceHolder.licence_refs
    ])
  }

  session.relevantLicenceMonitoringStations[0].restrictionType = restrictionType
}
