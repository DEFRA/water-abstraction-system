'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Things we need to stub
const FetchLicenceRefsWithDueReturnsService = require('../../../../app/services/notices/setup/fetch-licence-refs-with-due-returns.service.js')

// Thing under test
const SubmitRemoveLicencesService = require('../../../../app/services/notices/setup/submit-remove-licences.service.js')

describe('Notices - Setup - Submit Remove Licences service', () => {
  let fetchLicenceRefsWithDueReturnsStub
  let payload
  let referenceCode
  let session
  let licenceRefWithDueReturns

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

    licenceRefWithDueReturns = generateLicenceRef()

    fetchLicenceRefsWithDueReturnsStub = Sinon.stub(FetchLicenceRefsWithDueReturnsService, 'go')
  })

  afterEach(() => {
    fetchLicenceRefsWithDueReturnsStub.restore()
  })

  describe('when submitting licences to remove ', () => {
    describe('is successful', () => {
      beforeEach(async () => {
        payload = { removeLicences: licenceRefWithDueReturns }

        fetchLicenceRefsWithDueReturnsStub.resolves([licenceRefWithDueReturns])
      })

      it('saves the submitted value', async () => {
        await SubmitRemoveLicencesService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removeLicences).to.equal(licenceRefWithDueReturns)
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

        licenceRefWithDueReturns = []

        fetchLicenceRefsWithDueReturnsStub.resolves([licenceRefWithDueReturns])
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
