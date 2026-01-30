'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const FetchBillRunsService = require('../../../app/services/bill-runs/fetch-bill-runs.service.js')

// Thing under test
const SubmitIndexBillRunsService = require('../../../app/services/bill-runs/submit-index-bill-runs.service.js')

describe('Bill Runs - Submit Index Bill Runs service', () => {
  let payload
  let yarStub

  beforeEach(() => {
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
        const result = await SubmitIndexBillRunsService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('clears the "billRunsFilter" object from the session', async () => {
        await SubmitIndexBillRunsService.go(payload, yarStub)

        expect(yarStub.clear.called).to.be.true()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexBillRunsService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('saves a default "billRunsFilter" object in the session', async () => {
        await SubmitIndexBillRunsService.go(payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal('billRunsFilter')
        expect(setArgs[1]).to.equal({ yearCreated: undefined })
      })
    })

    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { yearCreated: '2025' }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexBillRunsService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('saves the state of the filters as the "billRunsFilter" object in the session', async () => {
        await SubmitIndexBillRunsService.go(payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal('billRunsFilter')
        expect(setArgs[1]).to.equal({ yearCreated: '2025' })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = { yearCreated: 'invalid-year' }
      })

      describe('and the results are paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchBillRunsService, 'go').resolves({
            results: _fetchedBillRuns(),
            total: 70
          })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexBillRunsService.go(payload, yarStub, '2')

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            error: {
              errorList: [{ href: '#yearCreated', text: 'The year created must be a number' }],
              yearCreated: { text: 'The year created must be a number' }
            },
            filters: { openFilter: true, yearCreated: 'invalid-year' },
            billRuns: [
              {
                id: '31fec553-f2de-40cf-a8d7-a5fb65f5761b',
                createdAt: '1 January 2024',
                link: '/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b',
                number: 1002,
                numberOfBills: 7,
                region: 'Avalon',
                scheme: 'sroc',
                status: 'ready',
                total: '£200.00',
                type: 'Supplementary'
              },
              {
                id: 'dfdde4c9-9a0e-440d-b297-7143903c6734',
                createdAt: '1 October 2023',
                link: '/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734',
                number: 1001,
                numberOfBills: 15,
                region: 'Albion',
                scheme: 'sroc',
                status: 'sent',
                total: '£300.00',
                type: 'Supplementary'
              }
            ],
            notification: null,
            pageSubHeading: 'View a bill run',
            pageTitle: 'Bill runs',
            pagination: {
              component: {
                items: [
                  {
                    current: false,
                    href: '/system/bill-runs?page=1',
                    number: 1,
                    visuallyHiddenText: 'Page 1'
                  },
                  {
                    current: true,
                    href: '/system/bill-runs?page=2',
                    number: 2,
                    visuallyHiddenText: 'Page 2'
                  },
                  {
                    current: false,
                    href: '/system/bill-runs?page=3',
                    number: 3,
                    visuallyHiddenText: 'Page 3'
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=3'
                },
                previous: {
                  href: '/system/bill-runs?page=1'
                }
              },
              numberOfPages: 3,
              showingMessage: 'Showing 2 of 70 bill runs'
            }
          })
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchBillRunsService, 'go').resolves({
            results: _fetchedBillRuns(),
            total: 2
          })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexBillRunsService.go(payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            error: {
              errorList: [{ href: '#yearCreated', text: 'The year created must be a number' }],
              yearCreated: { text: 'The year created must be a number' }
            },
            filters: { openFilter: true, yearCreated: 'invalid-year' },
            billRuns: [
              {
                id: '31fec553-f2de-40cf-a8d7-a5fb65f5761b',
                createdAt: '1 January 2024',
                link: '/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b',
                number: 1002,
                numberOfBills: 7,
                region: 'Avalon',
                scheme: 'sroc',
                status: 'ready',
                total: '£200.00',
                type: 'Supplementary'
              },
              {
                id: 'dfdde4c9-9a0e-440d-b297-7143903c6734',
                createdAt: '1 October 2023',
                link: '/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734',
                number: 1001,
                numberOfBills: 15,
                region: 'Albion',
                scheme: 'sroc',
                status: 'sent',
                total: '£300.00',
                type: 'Supplementary'
              }
            ],
            notification: null,
            pageSubHeading: 'View a bill run',
            pageTitle: 'Bill runs',
            pagination: {
              numberOfPages: 1,
              showingMessage: 'Showing all 2 bill runs'
            }
          })
        })
      })
    })
  })
})

function _fetchedBillRuns() {
  return [
    {
      id: '31fec553-f2de-40cf-a8d7-a5fb65f5761b',
      batchType: 'supplementary',
      billRunNumber: 1002,
      createdAt: new Date('2024-01-01'),
      netTotal: 20000,
      scheme: 'sroc',
      status: 'ready',
      summer: false,
      numberOfBills: 7,
      region: 'Avalon'
    },
    {
      id: 'dfdde4c9-9a0e-440d-b297-7143903c6734',
      batchType: 'supplementary',
      billRunNumber: 1001,
      createdAt: new Date('2023-10-01'),
      netTotal: 30000,
      scheme: 'sroc',
      status: 'sent',
      summer: false,
      numberOfBills: 15,
      region: 'Albion'
    }
  ]
}
