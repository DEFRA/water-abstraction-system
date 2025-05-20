'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')

// Things to stub
const FetchNoticesService = require('../../../app/services/notices/fetch-notices.service.js')

// Thing under test
const SubmitIndexService = require('../../../app/services/notices/submit-index.service.js')

describe('Notices - Submit Index service', () => {
  let notice
  let payload
  let yarStub

  beforeEach(async () => {
    yarStub = {
      clear: Sinon.stub().returns(),
      get: Sinon.stub(),
      set: Sinon.stub().returns()
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('clears the "noticesFilter" object from the session', async () => {
        await SubmitIndexService.go(payload, yarStub)

        expect(yarStub.clear.called).to.be.true()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('saves a default "noticesFilter" object in the session', async () => {
        await SubmitIndexService.go(payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal('noticesFilter')
        expect(setArgs[1]).to.equal({
          noticeTypes: [],
          fromDate: undefined,
          sentBy: null,
          sentFromDay: null,
          sentFromMonth: null,
          sentFromYear: null,
          sentToDay: null,
          sentToMonth: null,
          sentToYear: null,
          toDate: undefined
        })
      })
    })

    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          sentBy: 'carol.shaw@wrls.gov.uk',
          sentFromDay: '1',
          sentFromMonth: '4',
          sentFromYear: '2023',
          sentToDay: '31',
          sentToMonth: '3',
          sentToYear: '2024'
        }
      })

      describe('but no notice types included', () => {
        it('returns a result that tells the controller to redirect to the index page', async () => {
          const result = await SubmitIndexService.go(payload, yarStub)

          expect(result).to.equal({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('noticesFilter')
          expect(setArgs[1]).to.equal({
            noticeTypes: [],
            fromDate: '2023-04-01',
            sentBy: payload.sentBy,
            sentFromDay: payload.sentFromDay,
            sentFromMonth: payload.sentFromMonth,
            sentFromYear: payload.sentFromYear,
            sentToDay: payload.sentToDay,
            sentToMonth: payload.sentToMonth,
            sentToYear: payload.sentToYear,
            toDate: '2024-03-31'
          })
        })
      })

      describe('including a single notice type selected', () => {
        beforeEach(() => {
          payload.noticeTypes = 'stop'
        })

        it('returns a result that tells the controller to redirect to the index page', async () => {
          const result = await SubmitIndexService.go(payload, yarStub)

          expect(result).to.equal({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('noticesFilter')
          expect(setArgs[1]).to.equal({
            noticeTypes: ['stop'],
            fromDate: '2023-04-01',
            sentBy: payload.sentBy,
            sentFromDay: payload.sentFromDay,
            sentFromMonth: payload.sentFromMonth,
            sentFromYear: payload.sentFromYear,
            sentToDay: payload.sentToDay,
            sentToMonth: payload.sentToMonth,
            sentToYear: payload.sentToYear,
            toDate: '2024-03-31'
          })
        })
      })

      describe('including a multiple notice types selected', () => {
        beforeEach(() => {
          payload.noticeTypes = ['resume', 'stop']
        })

        it('returns a result that tells the controller to redirect to the index page', async () => {
          const result = await SubmitIndexService.go(payload, yarStub)

          expect(result).to.equal({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('noticesFilter')
          expect(setArgs[1]).to.equal({
            noticeTypes: payload.noticeTypes,
            fromDate: '2023-04-01',
            sentBy: payload.sentBy,
            sentFromDay: payload.sentFromDay,
            sentFromMonth: payload.sentFromMonth,
            sentFromYear: payload.sentFromYear,
            sentToDay: payload.sentToDay,
            sentToMonth: payload.sentToMonth,
            sentToYear: payload.sentToYear,
            toDate: '2024-03-31'
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {
          sentFromDay: '1',
          sentFromMonth: '4'
        }

        yarStub.get.returns({ sentBy: 'billing.data@wrls.gov.uk' })

        notice = NoticesFixture.alertStop()
      })

      describe('and the results are paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchNoticesService, 'go').resolves({ results: [notice], total: 70 })
        })

        it('extracts the previously saved filters', async () => {
          await SubmitIndexService.go(payload, yarStub)

          expect(yarStub.get.called).to.be.true()
          expect(yarStub.set.called).to.be.false()
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexService.go(payload, yarStub, '2')

          expect(result).to.equal(
            {
              activeNavBar: 'manage',
              error: {
                errorList: [{ href: '#fromDate', text: 'Enter a valid from date' }],
                fromDate: { message: 'Enter a valid from date' }
              },
              filters: {
                noticeTypes: [],
                fromDate: '-04-01',
                openFilter: true,
                sentBy: 'billing.data@wrls.gov.uk',
                sentFromDay: payload.sentFromDay,
                sentFromMonth: payload.sentFromMonth,
                toDate: undefined
              },
              notices: [
                {
                  createdDate: '25 March 2025',
                  link: `/notifications/report/${notice.id}`,
                  recipients: notice.recipientCount,
                  sentBy: 'billing.data@wrls.gov.uk',
                  status: 'sent',
                  type: 'Stop - Water abstraction alert'
                }
              ],
              numberOfNoticesDisplayed: 1,
              totalNumberOfNotices: '70',
              pageTitle: 'Notices (page 2 of 3)'
            },
            { skip: ['pagination'] }
          )
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchNoticesService, 'go').resolves({ results: [notice], total: 1 })
        })

        it('extracts the previously saved filters', async () => {
          await SubmitIndexService.go(payload, yarStub)

          expect(yarStub.get.called).to.be.true()
          expect(yarStub.set.called).to.be.false()
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexService.go(payload, yarStub)

          expect(result).to.equal(
            {
              activeNavBar: 'manage',
              error: {
                errorList: [{ href: '#fromDate', text: 'Enter a valid from date' }],
                fromDate: { message: 'Enter a valid from date' }
              },
              filters: {
                noticeTypes: [],
                fromDate: '-04-01',
                openFilter: true,
                sentBy: 'billing.data@wrls.gov.uk',
                sentFromDay: payload.sentFromDay,
                sentFromMonth: payload.sentFromMonth,
                toDate: undefined
              },
              notices: [
                {
                  createdDate: '25 March 2025',
                  link: `/notifications/report/${notice.id}`,
                  recipients: notice.recipientCount,
                  sentBy: 'billing.data@wrls.gov.uk',
                  status: 'sent',
                  type: 'Stop - Water abstraction alert'
                }
              ],
              numberOfNoticesDisplayed: 1,
              totalNumberOfNotices: '1',
              pageTitle: 'Notices'
            },
            { skip: ['pagination'] }
          )
        })
      })
    })
  })

  // describe('when called with a clear in the payload', () => {
  //   it('clears them from yar', async () => {
  //     payload = {
  //       clearFilters: 'reset'
  //     }
  //     await SubmitIndexService.go(payload, yarStub)

  //     expect(yarStub.clear.called).to.be.true()
  //     expect(yarStub.set.called).to.be.false()
  //   })
  // })

  // describe('when called with a valid payload', () => {
  //   it('saves the submitted payload into yar', async () => {
  //     payload = {
  //       filterNotificationTypes: [
  //         'legacy-notifications',
  //         'returns-paper-form',
  //         'returns-reminders',
  //         'returns-invitation',
  //         'water-abstraction-alert-resume',
  //         'water-abstraction-alert-stop',
  //         'water-abstraction-alert-reduce',
  //         'water-abstraction-alert-warning'
  //       ],
  //       sentBy: 'test@test.com',
  //       'sent-from-day': '1',
  //       'sent-from-month': '1',
  //       'sent-from-year': '2025',
  //       'sent-to-day': '31',
  //       'sent-to-month': '12',
  //       'sent-to-year': '2025'
  //     }
  //     await SubmitIndexService.go(payload, yarStub)

  //     expect(yarStub.clear.called).to.be.false()
  //     expect(yarStub.set.called).to.be.true()
  //     expect(yarStub.set.args[0][1]).to.equal({
  //       filterNotificationTypes: [
  //         'legacy-notifications',
  //         'returns-paper-form',
  //         'returns-reminders',
  //         'returns-invitation',
  //         'water-abstraction-alert-resume',
  //         'water-abstraction-alert-stop',
  //         'water-abstraction-alert-reduce',
  //         'water-abstraction-alert-warning'
  //       ],
  //       sentBy: 'test@test.com',
  //       sentFromDay: '1',
  //       sentFromMonth: '1',
  //       sentFromYear: '2025',
  //       sentToDay: '31',
  //       sentToMonth: '12',
  //       sentToYear: '2025'
  //     })
  //   })
  // })

  // describe('when called with an empty valid payload', () => {
  //   it('saves the submitted payload into yar', async () => {
  //     payload = {}

  //     await SubmitIndexService.go(payload, yarStub)

  //     expect(yarStub.clear.called).to.be.false()
  //     expect(yarStub.set.called).to.be.true()
  //     expect(yarStub.set.args[0][1]).to.equal({
  //       filterNotificationTypes: undefined,
  //       sentBy: undefined,
  //       sentFromDay: null,
  //       sentFromMonth: null,
  //       sentFromYear: null,
  //       sentToDay: null,
  //       sentToMonth: null,
  //       sentToYear: null
  //     })
  //   })
  // })
})
