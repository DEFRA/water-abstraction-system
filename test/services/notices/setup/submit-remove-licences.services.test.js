'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchLicenceRefsWithDueReturnsService = require('../../../../app/services/notices/setup/fetch-licence-refs-with-due-returns.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitRemoveLicencesService = require('../../../../app/services/notices/setup/submit-remove-licences.service.js')

describe('Notices - Setup - Submit Remove Licences service', () => {
  let fetchLicenceRefsWithDueReturnsStub
  let licenceRefWithDueReturns
  let payload
  let referenceCode
  let session
  let sessionData

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    sessionData = {
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

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    licenceRefWithDueReturns = generateLicenceRef()

    fetchLicenceRefsWithDueReturnsStub = Sinon.stub(FetchLicenceRefsWithDueReturnsService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when submitting licences to remove ', () => {
    describe('is successful', () => {
      beforeEach(() => {
        payload = { removeLicences: licenceRefWithDueReturns }

        fetchLicenceRefsWithDueReturnsStub.resolves([licenceRefWithDueReturns])
      })

      it('saves the submitted value', async () => {
        await SubmitRemoveLicencesService.go(session.id, payload)

        expect(session.removeLicences).to.equal(licenceRefWithDueReturns)
        expect(session.$update.called).to.be.true()
      })

      it('returns the redirect route', async () => {
        const result = await SubmitRemoveLicencesService.go(session.id, payload)

        expect(result).to.equal({
          redirect: `${session.id}/check`
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(() => {
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
