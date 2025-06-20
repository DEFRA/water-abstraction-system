'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../../support/helpers/licence.helper.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')

// Thing under test
const SubmitAdHocLicenceService = require('../../../../../app/services/notices/setup/ad-hoc/submit-ad-hoc-licence.service.js')
const Sinon = require('sinon')

describe('Notices - Setup - Submit Ad Hoc Licence service', () => {
  let clock
  let payload
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: {} })

    clock = Sinon.useFakeTimers(new Date('2020-06-06'))
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      before(async () => {
        await LicenceHelper.add({ licenceRef: '01/111' })
        await ReturnLogHelper.add({ licenceRef: '01/111' })

        payload = {
          licenceRef: '01/111'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAdHocLicenceService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRef).to.equal('01/111')
      })

      it('saves the "determinedReturnsPeriod" with the "dueDate" set 28 days from "today"', async () => {
        await SubmitAdHocLicenceService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.determinedReturnsPeriod).to.equal({
          dueDate: '2020-07-04T00:00:00.000Z',
          endDate: '2021-03-31T00:00:00.000Z',
          name: 'allYear',
          startDate: '2020-04-01T00:00:00.000Z',
          summer: 'false'
        })
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitAdHocLicenceService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not inputted anything', () => {
        before(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitAdHocLicenceService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'manage',
            licenceRef: null,
            error: {
              text: 'Enter a licence number'
            },
            pageTitle: 'Enter a licence number'
          })
        })
      })

      describe('because the user has entered a licence that does not exist', () => {
        before(() => {
          payload = {
            licenceRef: '1111'
          }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitAdHocLicenceService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'manage',
            licenceRef: '1111',
            error: {
              text: 'Enter a valid licence number'
            },
            pageTitle: 'Enter a licence number'
          })
        })
      })

      describe('because the user has entered a licence that has no due returns', () => {
        before(async () => {
          await LicenceHelper.add({ licenceRef: '01/145' })

          payload = {
            licenceRef: '01/145'
          }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitAdHocLicenceService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'manage',
            error: {
              text: 'There are no returns due for licence 01/145'
            },
            licenceRef: '01/145',
            pageTitle: 'Enter a licence number'
          })
        })
      })
    })
  })
})
