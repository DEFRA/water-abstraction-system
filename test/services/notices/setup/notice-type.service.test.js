'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const NoticeTypeService = require('../../../../app/services/notices/setup/notice-type.service.js')

describe('Notice Type Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await NoticeTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: {
          href: `/system/notices/setup/${session.id}/licence`,
          text: 'Back'
        },
        options: [
          {
            checked: false,
            text: 'Returns invitation',
            value: 'invitations'
          },
          {
            checked: false,
            text: 'Paper return',
            value: 'returnForms'
          }
        ],
        pageTitle: 'Select the notice type'
      })
    })
  })
})
