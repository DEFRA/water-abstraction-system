'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventModel = require('../../../app/models/event.model.js')

// Things to stub
const FetchNoticeService = require('../../../app/services/notices/fetch-notice.service.js')

// Thing under test
const ViewService = require('../../../app/services/notices/view.service.js')

describe('Notices - View Notice service', () => {
  const fetchResults = {
    event: EventModel.fromJson({
      id: 'a40dcb94-cb01-4fce-9a46-94b49eca2058',
      referenceCode: 'RREM-RD2KF4',
      issuer: 'test.user@defra.gov.uk',
      createdAt: new Date('2025-02-21T14:52:18.000Z'),
      status: 'sent',
      subtype: 'returnReminder'
    }),
    results: [
      {
        recipient_name: 'Big Farm Co Ltd',
        message_type: 'letter',
        personalisation: {
          address_line_1: 'Big Farm Co Ltd',
          address_line_2: 'Big Farm',
          address_line_3: 'Windy road',
          address_line_4: 'Buttercup meadow',
          address_line_5: 'Buttercup Village',
          postcode: 'TT1 1TT'
        },
        status: 'completed',
        licences: "['AT/TST/MONTHLY/02']",
        recipient: 'n/a'
      }
    ]
  }

  // The presenter tests cover the different variations of what can be displayed
  const expectedResultCommon = {
    activeNavBar: 'manage',
    createdBy: 'test.user@defra.gov.uk',
    reference: 'RREM-RD2KF4',
    dateCreated: '21 February 2025',
    status: 'sent',
    notices: [
      {
        messageType: 'letter',
        status: 'completed',
        licenceRefs: "['AT/TST/MONTHLY/02']",
        recipient: ['Big Farm Co Ltd', 'Big Farm', 'Windy road', 'Buttercup meadow', 'Buttercup Village', 'TT1 1TT']
      }
    ],
    numberOfRecipients: 1,
    numberShowing: 1,
    pagination: { numberOfPages: 1 },
    pageNumbers: 'Showing all notifications',
    pageTitle: 'Returns reminders'
  }

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid id, returnInvitation type and no page number', () => {
    beforeEach(() => {
      fetchResults.event.subtype = 'returnInvitation'
      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults)
    })

    it('returns page data for the view', async () => {
      const result = await ViewService.go('a40dcb94-cb01-4fce-9a46-94b49eca2058')

      expect(result).to.equal({ ...expectedResultCommon, pageTitle: 'Notifications' })
    })
  })

  describe('when called with a valid id, returnReminder type and no page number', () => {
    beforeEach(() => {
      fetchResults.event.subtype = 'returnReminder'
      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults)
    })

    it('returns page data for the view', async () => {
      const result = await ViewService.go('a40dcb94-cb01-4fce-9a46-94b49eca2058')

      expect(result).to.equal({ ...expectedResultCommon, pageTitle: 'Returns reminders' })
    })
  })

  describe('when called with a valid id, adHocReminder type and page 1', () => {
    beforeEach(() => {
      fetchResults.event.subtype = 'adHocReminder'
      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults, 1)
    })

    it('returns page data for the view', async () => {
      const result = await ViewService.go('a40dcb94-cb01-4fce-9a46-94b49eca2058')

      expect(result).to.equal({ ...expectedResultCommon, pageTitle: 'Ad-hoc notice' })
    })
  })

  describe('when called with a valid id, waterAbstractionAlerts type and page 1', () => {
    beforeEach(() => {
      fetchResults.event.subtype = 'waterAbstractionAlerts'
      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults, 1)
    })

    it('returns page data for the view', async () => {
      const result = await ViewService.go('a40dcb94-cb01-4fce-9a46-94b49eca2058')

      expect(result).to.equal({ ...expectedResultCommon, pageTitle: 'Water abstraction alert' })
    })
  })

  describe('when called with a valid id, undefinded subtype and page 1', () => {
    beforeEach(() => {
      fetchResults.event.subtype = undefined
      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults, 1)
    })

    it('returns page data for the view', async () => {
      const result = await ViewService.go('a40dcb94-cb01-4fce-9a46-94b49eca2058')

      expect(result).to.equal({ ...expectedResultCommon, pageTitle: 'Notifications' })
    })
  })

  describe('when called with a valid id and the second page', () => {
    beforeEach(() => {
      fetchResults.event.subtype = 'returnReminder'
      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults)
      const emptyObjects = Array.from({ length: 25 }, () => {
        return {}
      })
      fetchResults.results.unshift(...emptyObjects)
    })

    it('returns page data for the view', async () => {
      const result = await ViewService.go('a40dcb94-cb01-4fce-9a46-94b49eca2058', '2')

      expect(result).to.equal({
        ...expectedResultCommon,
        numberOfRecipients: 26,
        numberShowing: 25,
        pagination: {
          numberOfPages: 2,
          component: {
            previous: { href: '/system/notices/a40dcb94-cb01-4fce-9a46-94b49eca2058?page=1' },
            items: [
              {
                number: 1,
                visuallyHiddenText: 'Page 1',
                href: '/system/notices/a40dcb94-cb01-4fce-9a46-94b49eca2058',
                current: false
              },
              {
                number: 2,
                visuallyHiddenText: 'Page 2',
                href: '/system/notices/a40dcb94-cb01-4fce-9a46-94b49eca2058?page=2',
                current: true
              }
            ]
          }
        },
        pageNumbers: 'Showing page 2 of 2 notifications'
      })
    })
  })

  describe('when called with an id that returns no results', () => {
    beforeEach(() => {
      Sinon.stub(FetchNoticeService, 'go').resolves(undefined)
    })

    it('returns bare minimum page data for the view', async () => {
      const result = await ViewService.go('a40dcb94-cb01-4fce-9a46-94b49eca2057', 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        pageTitle: 'Notifications'
      })
    })
  })
})
