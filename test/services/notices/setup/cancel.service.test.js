'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const CancelService = require('../../../../app/services/notices/setup/cancel.service.js')

describe('Notices - Setup - Cancel service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { licenceRef: '01/111', referenceCode: generateReferenceCode() } })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CancelService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        pageTitle: 'You are about to cancel this notice',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        summaryList: {
          text: 'Licence number',
          value: '01/111'
        }
      })
    })
  })
})
