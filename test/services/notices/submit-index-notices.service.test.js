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
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchNoticesService = require('../../../app/services/notices/fetch-notices.service.js')

// Thing under test
const SubmitIndexNoticesService = require('../../../app/services/notices/submit-index-notices.service.js')

describe('Notices - Submit Index Notices service', () => {
  let notice
  let payload
  let yarStub

  beforeEach(async () => {
    Sinon.stub(FeatureFlagsConfig, 'enableSystemNoticeView').value(true)

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
        const result = await SubmitIndexNoticesService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('clears the "noticesFilter" object from the session', async () => {
        await SubmitIndexNoticesService.go(payload, yarStub)

        expect(yarStub.clear.called).to.be.true()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexNoticesService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('saves a default "noticesFilter" object in the session', async () => {
        await SubmitIndexNoticesService.go(payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal('noticesFilter')
        expect(setArgs[1]).to.equal({
          noticeTypes: [],
          fromDate: undefined,
          reference: null,
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
          reference: 'WAA-BZZDWX',
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
          const result = await SubmitIndexNoticesService.go(payload, yarStub)

          expect(result).to.equal({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexNoticesService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('noticesFilter')
          expect(setArgs[1]).to.equal({
            noticeTypes: [],
            fromDate: '2023-04-01',
            reference: payload.reference,
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
          const result = await SubmitIndexNoticesService.go(payload, yarStub)

          expect(result).to.equal({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexNoticesService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('noticesFilter')
          expect(setArgs[1]).to.equal({
            noticeTypes: ['stop'],
            fromDate: '2023-04-01',
            reference: payload.reference,
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
          const result = await SubmitIndexNoticesService.go(payload, yarStub)

          expect(result).to.equal({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexNoticesService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('noticesFilter')
          expect(setArgs[1]).to.equal({
            noticeTypes: payload.noticeTypes,
            fromDate: '2023-04-01',
            reference: payload.reference,
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
          sentFromMonth: '4',
          sentBy: 'billing.data@wrls.gov.uk'
        }

        notice = NoticesFixture.alertStop()
      })

      describe('and the results are paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchNoticesService, 'go').resolves({ results: [notice], total: 70 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexNoticesService.go(payload, yarStub, '2')

          expect(result).to.equal(
            {
              activeNavBar: 'manage',
              error: {
                errorList: [{ href: '#fromDate', text: 'Enter a valid from date' }],
                fromDate: { text: 'Enter a valid from date' }
              },
              filters: {
                noticeTypes: [],
                fromDate: '-04-01',
                openFilter: true,
                reference: null,
                sentBy: 'billing.data@wrls.gov.uk',
                sentFromDay: payload.sentFromDay,
                sentFromMonth: payload.sentFromMonth,
                sentFromYear: null,
                sentToDay: null,
                sentToMonth: null,
                sentToYear: null,
                toDate: undefined
              },
              notices: [
                {
                  createdDate: '25 March 2025',
                  link: `/system/notices/${notice.id}`,
                  recipients: notice.recipientCount,
                  reference: notice.referenceCode,
                  sentBy: 'billing.data@wrls.gov.uk',
                  status: 'sent',
                  type: 'Stop alert'
                }
              ],
              pageTitle: 'Notices (page 2 of 3)',
              tableCaption: 'Showing 1 of 70 notices'
            },
            { skip: ['pagination'] }
          )
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchNoticesService, 'go').resolves({ results: [notice], total: 1 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexNoticesService.go(payload, yarStub)

          expect(result).to.equal(
            {
              activeNavBar: 'manage',
              error: {
                errorList: [{ href: '#fromDate', text: 'Enter a valid from date' }],
                fromDate: { text: 'Enter a valid from date' }
              },
              filters: {
                noticeTypes: [],
                fromDate: '-04-01',
                openFilter: true,
                reference: null,
                sentBy: 'billing.data@wrls.gov.uk',
                sentFromDay: payload.sentFromDay,
                sentFromMonth: payload.sentFromMonth,
                sentFromYear: null,
                sentToDay: null,
                sentToMonth: null,
                sentToYear: null,
                toDate: undefined
              },
              notices: [
                {
                  createdDate: '25 March 2025',
                  link: `/system/notices/${notice.id}`,
                  recipients: notice.recipientCount,
                  reference: notice.referenceCode,
                  sentBy: 'billing.data@wrls.gov.uk',
                  status: 'sent',
                  type: 'Stop alert'
                }
              ],
              pageTitle: 'Notices',
              tableCaption: 'Showing all 1 notices'
            },
            { skip: ['pagination'] }
          )
        })
      })
    })
  })
})
