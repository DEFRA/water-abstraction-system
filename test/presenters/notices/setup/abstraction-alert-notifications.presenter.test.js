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
  let licenceMonitoringStations
  let recipients
  let session
  let testRecipients

  beforeEach(() => {
    recipients = RecipientsFixture.alertsRecipients()

    testRecipients = [...Object.values(recipients)]

    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    const abstractionAlertSessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    const relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations(
      [
        recipients.primaryUser.licence_refs,
        recipients.licenceHolder.licence_refs,
        recipients.additionalContact.licence_refs
      ],
      licenceMonitoringStations
    )

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
        licences: `["${recipients.primaryUser.licence_refs}"]`,
        messageType: 'email',
        messageRef: 'water_abstraction_alert_reduce_warning_email',
        personalisation: {
          alertType: 'warning',
          licenceMonitoringStationId: licenceMonitoringStations.one.id,
          condition_text: '',
          flow_or_level: 'level',
          issuer_email_address: 'luke.skywalker@rebelmail.test',
          licence_ref: recipients.primaryUser.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm',
          threshold_value: 1000
        },
        recipient: 'primary.user@important.com',
        reference: 'TEST-123',
        templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        licences: `["${recipients.licenceHolder.licence_refs}"]`,
        messageRef: 'water_abstraction_alert_stop_warning',
        messageType: 'letter',
        personalisation: {
          alertType: 'warning',
          licenceMonitoringStationId: licenceMonitoringStations.two.id,
          name: 'Mr H J Licence holder',
          address_line_1: 'Mr H J Licence holder',
          address_line_2: '1',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          // common personalisation
          condition_text: 'Effect of restriction: I have a bad feeling about this',
          flow_or_level: 'flow',
          issuer_email_address: 'luke.skywalker@rebelmail.test',
          licence_ref: recipients.licenceHolder.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm3/s',
          threshold_value: 100
        },
        reference: 'TEST-123',
        templateId: '7ab10c86-2c23-4376-8c72-9419e7f982bb'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        licences: `["${recipients.additionalContact.licence_refs}"]`,
        messageRef: 'water_abstraction_alert_stop_warning_email',
        messageType: 'email',
        personalisation: {
          alertType: 'warning',
          licenceMonitoringStationId: licenceMonitoringStations.three.id,
          condition_text: '',
          flow_or_level: 'level',
          issuer_email_address: 'luke.skywalker@rebelmail.test',
          licence_ref: recipients.additionalContact.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm',
          threshold_value: 100
        },
        recipient: 'additional.contact@important.com',
        reference: 'TEST-123',
        templateId: 'a51ace39-3224-4c18-bbb8-c803a6da9a21'
      }
    ])
  })

  describe('when a licence has more than one licence monitoring stations to send alerts to', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations(
        [recipients.primaryUser.licence_refs, recipients.primaryUser.licence_refs],
        { one: licenceMonitoringStations.one, two: licenceMonitoringStations.two }
      )
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
            alertType: 'warning',
            licenceMonitoringStationId: licenceMonitoringStations.one.id,
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
            alertType: 'warning',
            licenceMonitoringStationId: licenceMonitoringStations.two.id,
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
          templateId: 'a51ace39-3224-4c18-bbb8-c803a6da9a21'
        }
      ])
    })
  })

  describe('when a "recipient" has multiple licence refs', () => {
    beforeEach(() => {
      testRecipients = [
        { ...recipients.additionalContact, licence_refs: `${recipients.additionalContact.licence_refs},12/345` }
      ]
    })

    it('correctly transform the recipients (and associated licence monitoring stations) into notifications for the same recipient', () => {
      const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result).to.equal([
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: 'a51ace39-3224-4c18-bbb8-c803a6da9a21',
          licences: `["${recipients.additionalContact.licence_refs}"]`,
          messageType: 'email',
          messageRef: 'water_abstraction_alert_stop_warning_email',
          personalisation: {
            alertType: 'warning',
            licenceMonitoringStationId: licenceMonitoringStations.three.id,
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
  })

  describe('when a "additional contact" has abstraction alerts', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations(
        [recipients.additionalContact.licence_refs],
        { one: licenceMonitoringStations.one }
      )

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
            alertType: 'warning',
            licenceMonitoringStationId: licenceMonitoringStations.one.id,
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
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations(
        [recipients.primaryUser.licence_refs],
        { one: licenceMonitoringStations.one }
      )

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
            alertType: 'warning',
            licenceMonitoringStationId: licenceMonitoringStations.one.id,
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
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations(
        [recipients.licenceHolder.licence_refs],
        { one: licenceMonitoringStations.one }
      )
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
            address_line_1: 'Mr H J Licence holder',
            address_line_2: '1',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            // common personalisation
            alertType: 'warning',
            licenceMonitoringStationId: licenceMonitoringStations.one.id,
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
        alertType: 'warning',
        licenceMonitoringStationId: licenceMonitoringStations.one.id,
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

  describe('the "templateId"', () => {
    describe('when the alert type', () => {
      describe('and "restrictionType" ', () => {
        describe('are not set', () => {
          beforeEach(() => {
            _setupAlertAndRestrictionTypeData(session, recipients, false, '')

            session.alertType = ''
          })

          it('correctly sets the default message ref', () => {
            const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

            expect(result.templateId).to.equal(null)
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

              expect(result.templateId).to.equal('5eae5e5b-4f9a-4e2e-8d1e-c8d083533fbf')
            })

            describe('is a letter', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients)
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.templateId).to.equal('ba6b11ad-41fc-4054-87eb-7e9a168ceec2')
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

                expect(result.templateId).to.equal('4ebf29e1-f819-4d88-b7e4-ee47df302b9a')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'stop_or_reduce')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.templateId).to.equal('2d81eaa7-0c34-463b-8ac2-5ff37d5bd800')
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

                expect(result.templateId).to.equal('d94bf110-b173-4f77-8e9a-cf7b4f95dc00')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'reduce')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.templateId).to.equal('fafe7d77-7710-46c8-b870-3b5c1e3816d2')
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

              expect(result.templateId).to.equal('d7468ba1-ac65-42c4-9785-8998f9c34e01')
            })

            describe('is a letter', () => {
              beforeEach(() => {
                _setupAlertAndRestrictionTypeData(session, recipients)
              })

              it('correctly sets the message ref', () => {
                const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                expect(result.templateId).to.equal('c2635893-0dd7-4fff-a152-774707e2175e')
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

                expect(result.templateId).to.equal('6ec7265d-8ebb-4217-a62b-9bf0216f8c9f')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'reduce')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.templateId).to.equal('27499bbd-e854-4f13-884e-30e0894526b6')
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

                expect(result.templateId).to.equal('bf32327a-f170-4854-8abb-3068aee9cdec')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'stop_or_reduce')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.templateId).to.equal('8c77274f-6a61-46a5-82d8-66863320d608')
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

                expect(result.templateId).to.equal('a51ace39-3224-4c18-bbb8-c803a6da9a21')
              })

              describe('is a letter', () => {
                beforeEach(() => {
                  _setupAlertAndRestrictionTypeData(session, recipients, false, 'stop')
                })

                it('correctly sets the message ref', () => {
                  const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

                  expect(result.templateId).to.equal('7ab10c86-2c23-4376-8c72-9419e7f982bb')
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
