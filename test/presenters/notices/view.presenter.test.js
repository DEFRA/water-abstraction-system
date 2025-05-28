'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewPresenter = require('../../../app/presenters/notices/view.presenter.js')

describe('Notices - View Notice presenter', () => {
  const notices = [
    {
      messageType: 'letter',
      messageRef: 'returns_reminder_returns_to_letter',
      event: {
        referenceCode: 'PRTF-VPV3J9',
        issuer: 'test@wrls.gov.uk',
        createdAt: new Date('2025-02-21T14:52:18.000Z'),
        status: 'completed'
      },
      licences: ['AT/TST/MONTHLY/02'],
      personalisation: {
        address_line_1: 'Big Farm Co Ltd',
        address_line_2: 'Big Farm',
        address_line_3: 'Windy road',
        address_line_4: 'Buttercup meadow',
        address_line_5: 'Buttercup Village',
        postcode: 'TT1 1TT'
      },
      recipient: 'n/a',
      status: 'completed'
    },
    {
      messageType: 'letter',
      messageRef: 'returns_reminder_returns_to_letter',
      event: {
        referenceCode: 'PRTF-VPV3J9',
        issuer: 'test@wrls.gov.uk',
        createdAt: new Date('2025-02-21T14:52:18.000Z'),
        status: 'completed'
      },
      licences: ['AT/TST/MONTHLY/02'],
      recipient: 'test@wrls.gov.uk',
      status: 'completed'
    },
    {
      messageType: 'letter',
      messageRef: 'returns_reminder_returns_to_letter',
      event: {
        referenceCode: 'PRTF-VPV3J9',
        issuer: 'test@wrls.gov.uk',
        createdAt: new Date('2025-02-21T14:52:18.000Z'),
        status: 'completed'
      },
      licences: ['AT/TST/MONTHLY/02'],
      personalisation: {
        address_line_1: 'The Farm Co Ltd',
        address_line_2: 'Big Farm',
        address_line_3: 'Windy road',
        address_line_4: 'Buttercup meadow',
        address_line_5: 'Buttercup Village',
        postcode: 'TT1 1TT'
      },
      recipient: null,
      status: 'completed'
    }
  ]

  it('correctly presents the dataw', () => {
    const result = ViewPresenter.go(notices)

    expect(result).to.equal({
      createdBy: 'test@wrls.gov.uk',
      dateCreated: '21 February 2025',
      reference: 'PRTF-VPV3J9',
      notices: [
        {
          recipient: ['Big Farm Co Ltd', 'Big Farm', 'Windy road', 'Buttercup meadow', 'Buttercup Village', 'TT1 1TT'],
          licenceRefs: ['AT/TST/MONTHLY/02'],
          messageType: 'letter',
          status: 'completed'
        },
        {
          recipient: 'test@wrls.gov.uk',
          licenceRefs: ['AT/TST/MONTHLY/02'],
          messageType: 'letter',
          status: 'completed'
        },
        {
          recipient: ['The Farm Co Ltd', 'Big Farm', 'Windy road', 'Buttercup meadow', 'Buttercup Village', 'TT1 1TT'],
          licenceRefs: ['AT/TST/MONTHLY/02'],
          messageType: 'letter',
          status: 'completed'
        }
      ],
      status: 'completed'
    })
  })
})
