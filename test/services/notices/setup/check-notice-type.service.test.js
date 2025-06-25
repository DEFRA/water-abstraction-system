'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const CheckNoticeTypeService = require('../../../../app/services/notices/setup/check-notice-type.service.js')

describe('Notices - Setup - Check Notice Type Service', () => {
  let licenceRef
  let session
  let sessionData

  beforeEach(async () => {
    licenceRef = generateLicenceRef()
    sessionData = { licenceRef, noticeType: 'invitations' }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckNoticeTypeService.go(session.id)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/notice-type`,
        continueButton: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Continue to check recipients'
        },
        pageTitle: 'Check the notice type',
        summaryList: [
          {
            key: {
              text: 'Licence number'
            },
            value: {
              text: licenceRef
            }
          },
          {
            key: {
              text: 'Returns notice type'
            },
            value: {
              text: 'Standard returns invitation'
            }
          }
        ]
      })
    })
  })
})
