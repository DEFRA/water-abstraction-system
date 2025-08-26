'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotifyUpdatePresenter = require('../../../../app/presenters/notices/setup/notify-update.presenter.js')

describe('Notices - Setup - Notify Update presenter', () => {
  let notifyResult

  beforeEach(() => {
    notifyResult = {
      succeeded: true,
      response: {
        statusCode: 200,
        body: {
          content: {
            body: 'Dear licence holder,\r\n',
            from_email: 'environment.agency.water.resources.licensing.service@notifications.service.gov.uk',
            one_click_unsubscribe_url: null,
            subject: 'Submit your water abstraction returns by 28th April 2025'
          },
          id: 'a8023182-5cb3-4ee3-b777-2fb82cde7fc5',
          reference: 'RINV-H1EZR5',
          scheduled_for: null,
          template: {
            id: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
            uri: 'https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
            version: 40
          },
          uri: 'https://api.notifications.service.gov.uk/v2/notifications/a8023182-5cb3-4ee3-b777-2fb82cde7fc5'
        }
      }
    }
  })

  it('correctly returns notify result', () => {
    const result = NotifyUpdatePresenter.go(notifyResult)

    expect(result).to.equal({
      notifyId: 'a8023182-5cb3-4ee3-b777-2fb82cde7fc5',
      notifyStatus: 'created',
      plaintext: 'Dear licence holder,\r\n',
      status: 'pending'
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      notifyResult = {
        succeeded: false,
        response: {
          statusCode: 400,
          body: {
            errors: [
              {
                error: 'BadRequestError',
                message: 'Missing personalisation: returnDueDate'
              }
            ],
            status_code: 400
          }
        }
      }
    })

    it('correctly returns notify data with the error', () => {
      const result = NotifyUpdatePresenter.go(notifyResult)

      expect(result).to.equal({
        notifyError:
          '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"BadRequestError","message":"Missing personalisation: returnDueDate"}]}',
        status: 'error'
      })
    })
  })
})
