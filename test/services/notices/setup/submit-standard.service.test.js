'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitStandardService = require('../../../../app/services/notices/setup/submit-standard.service.js')

describe('Standard Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {}
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitStandardService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal(session)
    })

    it('continues the journey', async () => {
      const result = await SubmitStandardService.go(session.id, payload)

      expect(result).to.equal({
        backLink: {
          href: '/system/notices',
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#noticeType',
              text: 'Select a notice type'
            }
          ],
          noticeType: {
            text: 'Select a notice type'
          }
        },
        pageTitle: 'Select a notice type',
        radioOptions: [
          {
            text: 'Invitations',
            value: 'invitations'
          },
          {
            text: 'Reminders',
            value: 'reminders'
          }
        ]
      })
    })
  })

  describe('when validation fails', () => {
    it('returns page data for the view, with errors', async () => {
      const result = await SubmitStandardService.go(session.id, payload)

      expect(result).to.equal({
        backLink: {
          href: '/system/notices',
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#noticeType',
              text: 'Select a notice type'
            }
          ],
          noticeType: {
            text: 'Select a notice type'
          }
        },
        pageTitle: 'Select a notice type',
        radioOptions: [
          {
            text: 'Invitations',
            value: 'invitations'
          },
          {
            text: 'Reminders',
            value: 'reminders'
          }
        ]
      })
    })
  })
})
