// Test helpers
import * as NoticesFixture from '../../support/fixtures/notices.fixture.js'

// Things to stub
import * as FetchNoticesService from '../../../app/services/notices/fetch-notices.service.js'
import YarStub from '../../support/stubs/yar.stub.js'

// Thing under test
import SubmitIndexNoticesService from '../../../app/services/notices/submit-index-notices.service.js'

describe('Notices - Submit Index Notices service', () => {
  let auth
  let notice
  let payload
  let results
  let yarStub

  beforeEach(async () => {
    auth = {
      credentials: { scope: ['bulk_return_notifications', 'returns'] }
    }

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexNoticesService(payload, yarStub, auth)

        expect(result).toEqual({})
      })

      it('clears the "noticesFilter" object from the session', async () => {
        await SubmitIndexNoticesService(payload, yarStub, auth)

        expect(yarStub.clear).toHaveBeenCalled()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexNoticesService(payload, yarStub, auth)

        expect(result).toEqual({})
      })

      it('saves a default "noticesFilter" object in the session', async () => {
        await SubmitIndexNoticesService(payload, yarStub, auth)

        const setArgs = yarStub.set.mock.calls[0]

        expect(setArgs[0]).toEqual('noticesFilter')
        expect(setArgs[1]).toEqual({
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
          statuses: [],
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
          const result = await SubmitIndexNoticesService(payload, yarStub, auth)

          expect(result).toEqual({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexNoticesService(payload, yarStub, auth)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('noticesFilter')
          expect(setArgs[1]).toEqual({
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
            statuses: [],
            toDate: '2024-03-31'
          })
        })
      })

      describe('including a single notice type selected', () => {
        beforeEach(() => {
          payload.noticeTypes = 'stop'
        })

        it('returns a result that tells the controller to redirect to the index page', async () => {
          const result = await SubmitIndexNoticesService(payload, yarStub, auth)

          expect(result).toEqual({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexNoticesService(payload, yarStub, auth)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('noticesFilter')
          expect(setArgs[1]).toEqual({
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
            statuses: [],
            toDate: '2024-03-31'
          })
        })
      })

      describe('including a multiple notice types selected', () => {
        beforeEach(() => {
          payload.noticeTypes = ['resume', 'stop']
        })

        it('returns a result that tells the controller to redirect to the index page', async () => {
          const result = await SubmitIndexNoticesService(payload, yarStub, auth)

          expect(result).toEqual({})
        })

        it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
          await SubmitIndexNoticesService(payload, yarStub, auth)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('noticesFilter')
          expect(setArgs[1]).toEqual({
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
            statuses: [],
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
          sentBy: 'admin-internal@wrls.gov.uk'
        }

        results = NoticesFixture.mapToFetchNoticesResult([NoticesFixture.alertStop()])
        notice = results[0]
      })

      describe('and the results are paginated', () => {
        beforeEach(() => {
          vi.spyOn(FetchNoticesService, 'default').mockResolvedValue({ results, total: 70 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexNoticesService(payload, yarStub, auth, '2')

          expect(result).toEqual({
            activeNavBar: 'notices',
            error: {
              errorList: [{ href: '#fromDate', text: 'Enter a valid from date' }],
              fromDate: { text: 'Enter a valid from date' }
            },
            filters: {
              noticeTypes: [],
              fromDate: '-04-01',
              openFilter: true,
              reference: null,
              sentBy: 'admin-internal@wrls.gov.uk',
              sentFromDay: payload.sentFromDay,
              sentFromMonth: payload.sentFromMonth,
              sentFromYear: null,
              sentToDay: null,
              sentToMonth: null,
              sentToYear: null,
              statuses: [],
              toDate: undefined
            },
            helperText: 'Create a returns invitation, reminder or paper return notice',
            links: {
              adhoc: {
                href: '/system/notices/setup/adhoc',
                text: 'Create an ad-hoc notice'
              },
              notice: {
                href: '/system/notices/setup/standard',
                text: 'Create a standard notice'
              }
            },
            notices: [
              {
                createdDate: '25 March 2025',
                link: `/system/notices/${notice.id}`,
                recipients: notice.recipientCount,
                reference: notice.referenceCode,
                sentBy: 'admin-internal@wrls.gov.uk',
                status: 'sent',
                type: 'Stop alert'
              }
            ],
            pageSubHeading: 'View a notice',
            pageTitle: 'Notices',
            pagination: {
              component: {
                items: [
                  {
                    current: false,
                    href: '/system/notices?page=1',
                    number: 1,
                    visuallyHiddenText: 'Page 1'
                  },
                  {
                    current: true,
                    href: '/system/notices?page=2',
                    number: 2,
                    visuallyHiddenText: 'Page 2'
                  },
                  {
                    current: false,
                    href: '/system/notices?page=3',
                    number: 3,
                    visuallyHiddenText: 'Page 3'
                  }
                ],
                next: {
                  href: '/system/notices?page=3'
                },
                previous: {
                  href: '/system/notices?page=1'
                }
              },
              currentPageNumber: 2,
              numberOfPages: 3,
              showingMessage: 'Showing 1 of 70 notices'
            }
          })
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          vi.spyOn(FetchNoticesService, 'default').mockResolvedValue({ results, total: 1 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexNoticesService(payload, yarStub, auth)

          expect(result).toEqual({
            activeNavBar: 'notices',
            error: {
              errorList: [{ href: '#fromDate', text: 'Enter a valid from date' }],
              fromDate: { text: 'Enter a valid from date' }
            },
            filters: {
              noticeTypes: [],
              fromDate: '-04-01',
              openFilter: true,
              reference: null,
              sentBy: 'admin-internal@wrls.gov.uk',
              sentFromDay: payload.sentFromDay,
              sentFromMonth: payload.sentFromMonth,
              sentFromYear: null,
              sentToDay: null,
              sentToMonth: null,
              sentToYear: null,
              statuses: [],
              toDate: undefined
            },
            helperText: 'Create a returns invitation, reminder or paper return notice',
            links: {
              adhoc: {
                href: '/system/notices/setup/adhoc',
                text: 'Create an ad-hoc notice'
              },
              notice: {
                href: '/system/notices/setup/standard',
                text: 'Create a standard notice'
              }
            },
            notices: [
              {
                createdDate: '25 March 2025',
                link: `/system/notices/${notice.id}`,
                recipients: notice.recipientCount,
                reference: notice.referenceCode,
                sentBy: 'admin-internal@wrls.gov.uk',
                status: 'sent',
                type: 'Stop alert'
              }
            ],
            pageSubHeading: 'View a notice',
            pageTitle: 'Notices',
            pagination: {
              currentPageNumber: 1,
              numberOfPages: 1,
              showingMessage: 'Showing all 1 notices'
            }
          })
        })
      })
    })
  })
})
