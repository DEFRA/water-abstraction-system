'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const DetermineRelevantLicenceVersionService = require('../../../../app/services/return-versions/setup/determine-relevant-licence-version.service.js')

// Thing under test
const SubmitStartDateService = require('../../../../app/services/return-versions/setup/submit-start-date.service.js')

describe('Return Versions - Setup - Submit Start Date service', () => {
  let payload
  let relevantLicenceVersion
  let session
  let yarStub

  beforeEach(async () => {
    session = await SessionHelper.add()

    session.checkPageVisited = false
    session.licence = {
      id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
      currentVersionStartDate: '2023-01-01',
      endDate: null,
      licenceRef: '01/ABC',
      licenceHolder: 'Turbo Kid',
      returnVersions: [
        {
          id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
          startDate: '2023-01-01',
          reason: null,
          modLogs: []
        }
      ],
      startDate: '2019-04-01',
      waterUndertaker: false
    }
    session.journey = 'returns-required'
    session.requirements = [{}]

    await session.$update()

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and it is the first time visiting the page', () => {
        beforeEach(() => {
          // NOTE: Default to the user selected "licence start date", but override this for "another start date" tests
          payload = {
            'start-date-options': 'licenceStartDate'
          }

          relevantLicenceVersion = {
            copyableReturnVersions: session.licence.returnVersions,
            endDate: null,
            id: 'c0e59520-3164-43ac-8f64-e1d38dfb90c4',
            startDate: new Date('2023-01-01')
          }
          Sinon.stub(DetermineRelevantLicenceVersionService, 'go').resolves(relevantLicenceVersion)
        })

        it('returns a result that tells the controller to redirect to the next page in the journey', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result).to.equal({ checkPageVisited: false, journey: 'returns-required' })
        })

        describe('where the user selected "licence start date"', () => {
          beforeEach(async () => {
            payload = {
              'start-date-options': 'licenceStartDate'
            }
          })

          it('saves the submitted date details and the relevant licence version', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            const refreshedSession = await session.$query()

            expect(refreshedSession.startDateOptions).to.equal('licenceStartDate')
            expect(refreshedSession.startDateDay).not.to.exist()
            expect(refreshedSession.startDateMonth).not.to.exist()
            expect(refreshedSession.startDateYear).not.to.exist()
            expect(new Date(refreshedSession.returnVersionStartDate)).to.equal(new Date('2023-01-01'))

            expect(refreshedSession.licenceVersion).to.equal({
              copyableReturnVersions: relevantLicenceVersion.copyableReturnVersions,
              endDate: relevantLicenceVersion.endDate,
              id: relevantLicenceVersion.id,
              startDate: '2023-01-01T00:00:00.000Z'
            })
          })
        })

        describe('and the user selected "another start date"', () => {
          beforeEach(async () => {
            payload = {
              'start-date-options': 'anotherStartDate',
              'start-date-day': '26',
              'start-date-month': '11',
              'start-date-year': '2023'
            }
          })

          it('saves the submitted date details and the relevant licence version', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            const refreshedSession = await session.$query()

            expect(refreshedSession.startDateOptions).to.equal('anotherStartDate')
            expect(refreshedSession.startDateDay).to.equal('26')
            expect(refreshedSession.startDateMonth).to.equal('11')
            expect(refreshedSession.startDateYear).to.equal('2023')
            expect(new Date(refreshedSession.returnVersionStartDate)).to.equal(new Date('2023-11-26'))

            expect(refreshedSession.licenceVersion).to.equal({
              copyableReturnVersions: relevantLicenceVersion.copyableReturnVersions,
              endDate: relevantLicenceVersion.endDate,
              id: relevantLicenceVersion.id,
              startDate: '2023-01-01T00:00:00.000Z'
            })
          })
        })

        describe('and when the licence is a water company', () => {
          beforeEach(async () => {
            session.licence.waterUndertaker = true

            await session.$update()
          })

          describe('and the selected start date is before 1 April 2025', () => {
            it('does not set the "quarterly returns" flag in the session', async () => {
              await SubmitStartDateService.go(session.id, payload, yarStub)

              const refreshedSession = await session.$query()

              expect(refreshedSession.quarterlyReturns).not.to.exist()
            })
          })

          describe('and the selected start date is on or after 1 April 2025', () => {
            beforeEach(() => {
              payload = {
                'start-date-options': 'anotherStartDate',
                'start-date-day': '01',
                'start-date-month': '04',
                'start-date-year': '2025'
              }
            })

            it('sets the "quarterly returns" flag to "true" in the session', async () => {
              await SubmitStartDateService.go(session.id, payload, yarStub)

              const refreshedSession = await session.$query()

              expect(refreshedSession.quarterlyReturns).to.be.true()
            })
          })
        })

        describe('and when the licence is not a water company', () => {
          it('does not set the "quarterly returns" flag in the session', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            const refreshedSession = await session.$query()

            expect(refreshedSession.quarterlyReturns).not.to.exist()
          })
        })
      })

      describe('and the page has been visited previously (we are coming from the "check" page)', () => {
        beforeEach(async () => {
          relevantLicenceVersion = {
            copyableReturnVersions: session.licence.returnVersions,
            endDate: null,
            id: 'c0e59520-3164-43ac-8f64-e1d38dfb90c4',
            startDate: new Date('2023-01-01')
          }

          session.checkPageVisited = true
          session.licenceVersion = relevantLicenceVersion
          session.returnVersionStartDate = new Date('2023-01-01')
          session.requirements = [{ index: 1, name: 'foo' }]
          session.method = 'existing'

          await session.$update()
        })

        describe('and the start date is not changed (user just clicks continue)', () => {
          beforeEach(() => {
            payload = {
              'start-date-options': 'licenceStartDate'
            }
            Sinon.stub(DetermineRelevantLicenceVersionService, 'go').resolves(relevantLicenceVersion)
          })

          it('returns a result that tells the controller to redirect back to the "check" page', async () => {
            const result = await SubmitStartDateService.go(session.id, payload, yarStub)

            expect(result).to.equal({
              checkPageVisited: true,
              journey: 'returns-required'
            })
          })

          it('sets the notification message title to "Updated" and the text to "Return version updated" ', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            const [flashType, notification] = yarStub.flash.args[0]

            expect(flashType).to.equal('notification')
            expect(notification).to.equal({ title: 'Updated', text: 'Return version updated' })
          })

          it('does not change the relevant licence version for the session', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            const refreshedSession = await session.$query()

            expect(refreshedSession.licenceVersion).to.equal({
              copyableReturnVersions: relevantLicenceVersion.copyableReturnVersions,
              endDate: relevantLicenceVersion.endDate,
              id: relevantLicenceVersion.id,
              startDate: '2023-01-01T00:00:00.000Z'
            })
          })
        })

        describe('and the start date is changed but the same relevant licence version is found', () => {
          beforeEach(() => {
            payload = {
              'start-date-options': 'anotherStartDate',
              'start-date-day': '01',
              'start-date-month': '04',
              'start-date-year': '2024'
            }

            Sinon.stub(DetermineRelevantLicenceVersionService, 'go').resolves(relevantLicenceVersion)
          })

          it('returns a result that tells the controller to redirect back to the "check" page', async () => {
            const result = await SubmitStartDateService.go(session.id, payload, yarStub)

            expect(result).to.equal({
              checkPageVisited: true,
              journey: 'returns-required'
            })
          })

          it('sets the notification message title to "Updated" and the text to "Return version updated" ', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            const [flashType, notification] = yarStub.flash.args[0]

            expect(flashType).to.equal('notification')
            expect(notification).to.equal({ title: 'Updated', text: 'Return version updated' })
          })

          it('does not change the relevant licence version for the session', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            const refreshedSession = await session.$query()

            expect(refreshedSession.licenceVersion).to.equal({
              copyableReturnVersions: relevantLicenceVersion.copyableReturnVersions,
              endDate: relevantLicenceVersion.endDate,
              id: relevantLicenceVersion.id,
              startDate: '2023-01-01T00:00:00.000Z'
            })
          })
        })

        describe('and the start date is changed to one which causes a different relevant licence version to be found', () => {
          let newRelevantLicenceVersion

          beforeEach(() => {
            newRelevantLicenceVersion = {
              copyableReturnVersions: [],
              endDate: new Date('2022-12-31'),
              id: '11d8af4a-3273-4001-adc1-74b7851f7102',
              startDate: new Date('2020-04-01')
            }

            payload = {
              'start-date-options': 'anotherStartDate',
              'start-date-day': '01',
              'start-date-month': '04',
              'start-date-year': '2021'
            }

            Sinon.stub(DetermineRelevantLicenceVersionService, 'go').resolves(newRelevantLicenceVersion)
          })

          it('returns a result that tells the controller to redirect to the next page in the journey', async () => {
            const result = await SubmitStartDateService.go(session.id, payload, yarStub)

            expect(result).to.equal({ checkPageVisited: false, journey: 'returns-required' })
          })

          it('does not set the notification message', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            expect(yarStub.flash.called).to.be.false()
          })

          it('updates the relevant licence version for the session and resets the session', async () => {
            await SubmitStartDateService.go(session.id, payload, yarStub)

            const refreshedSession = await session.$query()

            expect(refreshedSession.licenceVersion).to.equal({
              copyableReturnVersions: [],
              endDate: '2022-12-31T00:00:00.000Z',
              id: newRelevantLicenceVersion.id,
              startDate: '2020-04-01T00:00:00.000Z'
            })

            expect(refreshedSession.method).not.to.exist()
            expect(refreshedSession.checkPageVisited).to.be.false()
            expect(refreshedSession.requirements).to.equal([{}])
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}

        Sinon.stub(FeatureFlagsConfig, 'enableSystemLicenceView').value(true)
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStartDateService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            pageTitle: 'Select the start date for the requirements for returns',
            pageTitleCaption: 'Licence 01/ABC',
            anotherStartDateDay: null,
            anotherStartDateMonth: null,
            anotherStartDateYear: null,
            backLink: '/system/licences/8b7f78ba-f3ad-4cb6-a058-78abc4d1383d/set-up',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            licenceVersionStartDate: '1 January 2023',
            startDateOption: null
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            message: 'Select the start date for the requirements for returns',
            radioFormElement: { text: 'Select the start date for the requirements for returns' },
            dateInputFormElement: null
          })
        })
      })

      describe('because the user has selected another start date and entered invalid data', () => {
        beforeEach(async () => {
          payload = {
            'start-date-options': 'anotherStartDate',
            'start-date-day': 'a',
            'start-date-month': 'b',
            'start-date-year': 'c'
          }
        })

        it('includes an error for the date input element', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            message: 'Enter a real start date',
            radioFormElement: null,
            dateInputFormElement: { text: 'Enter a real start date' }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitStartDateService.go(session.id, payload, yarStub)

          expect(result.anotherStartDateDay).to.equal('a')
          expect(result.anotherStartDateMonth).to.equal('b')
          expect(result.anotherStartDateYear).to.equal('c')
          expect(result.startDateOption).to.equal('anotherStartDate')
        })
      })
    })
  })
})
