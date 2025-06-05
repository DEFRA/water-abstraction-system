'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const EventModel = require('../../../app/models/event.model.js')

// Thing under test
const ViewPresenter = require('../../../app/presenters/notices/view.presenter.js')

describe('Notices - View Notice presenter', () => {
  const notices = {
    event: EventModel.fromJson({
      id: 'a40dcb94-cb01-4fce-9a46-94b49eca2057',
      referenceCode: 'PRTF-VPV3J9',
      issuer: 'test@wrls.gov.uk',
      createdAt: new Date('2025-02-21T14:52:18.000Z'),
      status: 'completed',
      subtype: 'return reminder'
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
      },
      {
        recipient_name: 'test@wrls.gov.uk',
        message_type: 'email',
        status: 'completed',
        licences: "['AT/TST/MONTHLY/02']",
        recipient: 'test@wrls.gov.uk'
      },
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
        recipient: null
      }
    ]
  }

  describe('when a notice exists', () => {
    it('correctly presents the data for display', () => {
      const result = ViewPresenter.go(notices, 1)

      expect(result).to.equal({
        createdBy: 'test@wrls.gov.uk',
        dateCreated: '21 February 2025',
        reference: 'PRTF-VPV3J9',
        notices: [
          {
            recipient: [
              'Big Farm Co Ltd',
              'Big Farm',
              'Windy road',
              'Buttercup meadow',
              'Buttercup Village',
              'TT1 1TT'
            ],
            licenceRefs: "['AT/TST/MONTHLY/02']",
            messageType: 'letter',
            status: 'completed'
          },
          {
            recipient: 'test@wrls.gov.uk',
            licenceRefs: "['AT/TST/MONTHLY/02']",
            messageType: 'email',
            status: 'completed'
          },
          {
            recipient: [
              'Big Farm Co Ltd',
              'Big Farm',
              'Windy road',
              'Buttercup meadow',
              'Buttercup Village',
              'TT1 1TT'
            ],
            licenceRefs: "['AT/TST/MONTHLY/02']",
            messageType: 'letter',
            status: 'completed'
          }
        ],
        status: 'completed'
      })
    })
  })

  describe('when a notice does not exist and has paginated results', () => {
    beforeEach(async () => {
      const emptyObjects = Array.from({ length: 25 }, () => {
        return {}
      })
      notices.results.unshift(...emptyObjects)
    })

    it('correctly presents the data for display', () => {
      const result = ViewPresenter.go(notices, 2)

      expect(result).to.equal({
        createdBy: 'test@wrls.gov.uk',
        dateCreated: '21 February 2025',
        reference: 'PRTF-VPV3J9',
        notices: [
          {
            recipient: [
              'Big Farm Co Ltd',
              'Big Farm',
              'Windy road',
              'Buttercup meadow',
              'Buttercup Village',
              'TT1 1TT'
            ],
            licenceRefs: "['AT/TST/MONTHLY/02']",
            messageType: 'letter',
            status: 'completed'
          },
          {
            recipient: 'test@wrls.gov.uk',
            licenceRefs: "['AT/TST/MONTHLY/02']",
            messageType: 'email',
            status: 'completed'
          },
          {
            recipient: [
              'Big Farm Co Ltd',
              'Big Farm',
              'Windy road',
              'Buttercup meadow',
              'Buttercup Village',
              'TT1 1TT'
            ],
            licenceRefs: "['AT/TST/MONTHLY/02']",
            messageType: 'letter',
            status: 'completed'
          }
        ],
        status: 'completed'
      })
    })
  })
})
