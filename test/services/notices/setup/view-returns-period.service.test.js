'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ReturnsPeriodService = require('../../../../app/services/notices/setup/view-returns-period.service.js')

describe('Notices - Setup - View Returns Period service', () => {
  let clock
  let referenceCode
  let session
  let sessionData

  beforeAll(async () => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    sessionData = { referenceCode, noticeType: 'invitations' }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    const testDate = new Date('2024-12-01')

    clock = Sinon.useFakeTimers(testDate)
  })

  afterAll(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when provided no params', () => {
    it('correctly presents the data', async () => {
      const result = await ReturnsPeriodService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        pageTitle: 'Select the returns periods for the invitations',
        returnsPeriod: [
          {
            checked: false,
            hint: {
              text: 'Due date 28 January 2025'
            },
            text: 'Quarterly 1 October 2024 to 31 December 2024',
            value: 'quarterThree'
          },
          {
            checked: false,
            hint: {
              text: 'Due date 28 April 2025'
            },
            text: 'Quarterly 1 January 2025 to 31 March 2025',
            value: 'quarterFour'
          }
        ]
      })
    })
  })
})
