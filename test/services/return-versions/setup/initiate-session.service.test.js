'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../../support/seeders/licence-holder.seeder.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const ModLogHelper = require('../../../support/helpers/mod-log.helper.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/return-versions/setup/initiate-session.service.js')

describe('Return Versions Setup - Initiate Session service', () => {
  let journey
  let licence
  let licenceRef
  let modLog
  let returnVersionId

  beforeEach(async () => {
    // Create the licence record with an 'end' date so we can confirm the session gets populated with the licence's
    // 'ends' information
    licenceRef = generateLicenceRef()
    licence = await LicenceHelper.add({ expiredDate: new Date('2024-08-10'), licenceRef })
  })

  describe('when called', () => {
    describe('and the licence exists', () => {
      beforeEach(async () => {
        journey = 'returns-required'

        // Create two licence versions so we can test the service only gets the 'current' version
        await LicenceVersionHelper.add({
          licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
        })
        await LicenceVersionHelper.add({
          licenceId: licence.id, startDate: new Date('2022-05-01')
        })

        // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
        await LicenceHolderSeeder.seed(licence.licenceRef)
      })

      it('creates a new session record containing details of the licence', async () => {
        const result = await InitiateSessionService.go(licence.id, journey)

        const { data } = result

        expect(data).to.equal({
          checkPageVisited: false,
          licence: {
            id: licence.id,
            currentVersionStartDate: new Date('2022-05-01'),
            endDate: new Date('2024-08-10'),
            licenceRef,
            licenceHolder: 'Licence Holder Ltd',
            returnVersions: [],
            startDate: new Date('2022-01-01'),
            waterUndertaker: false
          },
          multipleUpload: false,
          journey: 'returns-required',
          requirements: [{}]
        }, { skip: ['id'] })
      })

      describe('and has return versions with return requirements to copy from', () => {
        beforeEach(async () => {
          const returnVersion = await ReturnVersionHelper.add({
            licenceId: licence.id, startDate: new Date('2022-05-01')
          })

          returnVersionId = returnVersion.id

          modLog = await ModLogHelper.add({ reasonDescription: 'Record Loaded During Migration', returnVersionId })
          await ReturnRequirementHelper.add({ returnVersionId })
        })

        it('includes details of the return versions in the session record created', async () => {
          const result = await InitiateSessionService.go(licence.id, journey)

          const { returnVersions } = result.data.licence

          expect(returnVersions).to.equal([{
            id: returnVersionId,
            reason: 'new-licence',
            startDate: new Date('2022-05-01'),
            modLogs: [{ id: modLog.id, reasonDescription: modLog.reasonDescription }]
          }])
        })
      })

      describe('and has return versions but they are not "current" (so cannot be copied from)', () => {
        beforeEach(async () => {
          const returnVersion = await ReturnVersionHelper.add({
            licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
          })

          returnVersionId = returnVersion.id

          await ReturnRequirementHelper.add({ returnVersionId })
        })

        it('does not contain any return version details in the session record created', async () => {
          const result = await InitiateSessionService.go(licence.id, journey)

          const { returnVersions } = result.data.licence

          expect(returnVersions).to.be.empty()
        })
      })

      describe('and has return versions but they do not have requirements (so cannot be copied from)', () => {
        beforeEach(async () => {
          await ReturnVersionHelper.add({
            licenceId: licence.id, reason: 'returns-exception', startDate: new Date('2021-10-11'), status: 'current'
          })
        })

        it('does not contain any return version details in the session record created', async () => {
          const result = await InitiateSessionService.go(licence.id, journey)

          const { returnVersions } = result.data.licence

          expect(returnVersions).to.be.empty()
        })
      })

      describe('and has no return versions (so nothing to copy from)', () => {
        it('does not contain any return version details in the session record created', async () => {
          const result = await InitiateSessionService.go(licence.id, journey)

          const { returnVersions } = result.data.licence

          expect(returnVersions).to.be.empty()
        })
      })
    })

    describe('but the licence does not exist', () => {
      it('throws a Boom not found error', async () => {
        const error = await expect(InitiateSessionService.go('e456e538-4d55-4552-84f7-6a7636eb1945', 'journey')).to.reject()

        expect(error.isBoom).to.be.true()
        expect(error.data).to.equal({ id: 'e456e538-4d55-4552-84f7-6a7636eb1945' })

        const { statusCode, error: errorType, message } = error.output.payload

        expect(statusCode).to.equal(404)
        expect(errorType).to.equal('Not Found')
        expect(message).to.equal('Licence for new return requirement not found')
      })
    })
  })
})
