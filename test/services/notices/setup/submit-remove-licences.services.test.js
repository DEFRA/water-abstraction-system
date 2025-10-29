'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FetchReturnsDueService = require('../../../../app/services/notices/setup/fetch-returns-due.service.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const SubmitRemoveLicencesService = require('../../../../app/services/notices/setup/submit-remove-licences.service.js')

describe('Notices - Setup - Submit Remove licences service', () => {
  let fetchReturnsDueServiceStub
  let payload
  let referenceCode
  let session
  let validLicences

  beforeEach(async () => {
    referenceCode = generateReferenceCode()

    session = await SessionHelper.add({
      data: {
        returnsPeriod: 'allYear',
        referenceCode,
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: '2024-04-28',
          endDate: '2024-03-31',
          summer: false,
          startDate: '2023-04-01'
        }
      }
    })

    validLicences = [{ licenceRef: '1234' }]

    fetchReturnsDueServiceStub = Sinon.stub(FetchReturnsDueService, 'go')
  })

  afterEach(() => {
    fetchReturnsDueServiceStub.restore()
  })

  describe('when submitting licences to remove ', () => {
    describe('is successful', () => {
      beforeEach(async () => {
        payload = { removeLicences: '1234' }

        fetchReturnsDueServiceStub.resolves(validLicences)
      })

      it('saves the submitted value', async () => {
        await SubmitRemoveLicencesService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removeLicences).to.equal('1234')
      })

      it('returns the redirect route', async () => {
        const result = await SubmitRemoveLicencesService.go(session.id, payload)

        expect(result).to.equal({
          redirect: `${session.id}/check`
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(async () => {
        payload = { removeLicences: '789' }

        validLicences = []

        fetchReturnsDueServiceStub.resolves([validLicences])
      })

      it('correctly presents the data with the error', async () => {
        const result = await SubmitRemoveLicencesService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/check`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#removeLicences',
                text: 'There are no returns due for licence 789'
              }
            ],
            removeLicences: {
              text: 'There are no returns due for licence 789'
            }
          },
          hint: 'Separate the licences numbers with a comma or new line.',
          removeLicences: '789',
          pageTitleCaption: `Notice ${referenceCode}`,
          pageTitle: 'Enter the licence numbers to remove from the mailing list'
        })
      })
    })
  })
})
