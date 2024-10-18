'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchExistingLicenceDetailsService = require('../../../../app/services/licences/supplementary/fetch-existing-licence-details.service.js')
const PersistSupplementaryBillingFlagsService = require('../../../../app/services/licences/supplementary/persist-supplementary-billing-flags.service.js')

// Thing under test
const ProcessImportedLicenceService = require('../../../../app/services/licences/supplementary/process-imported-licence.service.js')

describe('Process Imported Licence Service', () => {
  let clock
  let testDate
  let PersistSupplementaryBillingFlagsServiceStub

  beforeEach(() => {
    testDate = new Date('2024-04-01')
    clock = Sinon.useFakeTimers(testDate)
    PersistSupplementaryBillingFlagsServiceStub = Sinon.stub(PersistSupplementaryBillingFlagsService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when given a valid licenceId', () => {
    let licence
    let importedLicence

    beforeEach(async () => {
      licence = '16b9f590-a231-4a38-b69b-7dde3ff907f2'

      importedLicence = {
        expiredDate: null,
        lapsedDate: null,
        revokedDate: null
      }
    })

    describe('and an imported licence', () => {
      describe('with null expired date and pre sroc charge versions', () => {
        beforeEach(() => {
          Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_preSrocLicence(licence.id))
        })

        it('flags the licence for pre sroc supplementary billing', async () => {
          await ProcessImportedLicenceService.go(importedLicence, licence.id)

          expect(PersistSupplementaryBillingFlagsServiceStub.called).to.be.true()
          expect(PersistSupplementaryBillingFlagsServiceStub.calledWith(
            [],
            true,
            false,
            licence.id
          )).to.be.true()
        })
      })

      describe('with pre-sroc expired date and pre-sroc charge versions', () => {
        beforeEach(() => {
          importedLicence.expiredDate = new Date('2020-04-01')
          Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_flaggedPreSrocLicence(licence.id))
        })

        it('flags the licence for pre sroc supplementary billing', async () => {
          await ProcessImportedLicenceService.go(importedLicence, licence.id)

          expect(PersistSupplementaryBillingFlagsServiceStub.called).to.be.true()
          expect(PersistSupplementaryBillingFlagsServiceStub.calledWith(
            [],
            true,
            false,
            licence.id
          )).to.be.true()
        })
      })

      describe('with pre-sroc expired date and two-part tariff charge versions', () => {
        beforeEach(() => {
          importedLicence.expiredDate = new Date('2020-04-01')
          Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_preSrocTwoPartTariffLicence(licence.id))
        })

        it('flags the licence for sroc supplementary billing', async () => {
          await ProcessImportedLicenceService.go(importedLicence, licence.id)

          expect(PersistSupplementaryBillingFlagsServiceStub.called).to.be.true()
          expect(PersistSupplementaryBillingFlagsServiceStub.calledWith(
            [2023, 2024, 2025],
            false,
            true,
            licence.id
          )).to.be.true()
        })
      })

      describe('with null lapsed date and sroc charge versions', () => {
        beforeEach(() => {
          Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_srocLicence(licence.id, '2024-04-01'))
        })

        it('flags the licence for sroc supplementary billing', async () => {
          await ProcessImportedLicenceService.go(importedLicence, licence.id)

          expect(PersistSupplementaryBillingFlagsServiceStub.called).to.be.true()
          expect(PersistSupplementaryBillingFlagsServiceStub.calledWith(
            [],
            false,
            true,
            licence.id
          )).to.be.true()
        })
      })

      describe('with sroc lapsed date and sroc charge versions', () => {
        beforeEach(() => {
          importedLicence.lapsedDate = new Date('2024-04-01')
          Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_srocLicence(licence.id, null))
        })

        it('flags the licence for sroc supplementary billing', async () => {
          await ProcessImportedLicenceService.go(importedLicence, licence.id)

          expect(PersistSupplementaryBillingFlagsServiceStub.called).to.be.true()
          expect(PersistSupplementaryBillingFlagsServiceStub.calledWith(
            [],
            false,
            true,
            licence.id
          )).to.be.true()
        })
      })

      describe('with null revoked date and two-part tariff charge versions', () => {
        beforeEach(() => {
          Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_srocTwoPartTariffLicence(licence.id, '2024-04-01'))
        })

        it('flags the licence for sroc supplementary billing', async () => {
          await ProcessImportedLicenceService.go(importedLicence, licence.id)

          expect(PersistSupplementaryBillingFlagsServiceStub.called).to.be.true()
          expect(PersistSupplementaryBillingFlagsServiceStub.calledWith(
            [2025],
            false,
            true,
            licence.id
          )).to.be.true()
        })
      })

      describe('with sroc revoked date and two-part tariff charge versions', () => {
        beforeEach(() => {
          importedLicence.revokedDate = new Date('2024-04-01')
          Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_srocTwoPartTariffLicence(licence.id, null))
        })

        it('flags the licence for sroc supplementary billing', async () => {
          await ProcessImportedLicenceService.go(importedLicence, licence.id)

          expect(PersistSupplementaryBillingFlagsServiceStub.called).to.be.true()
          expect(PersistSupplementaryBillingFlagsServiceStub.calledWith(
            [2025],
            false,
            true,
            licence.id
          )).to.be.true()
        })
      })

      describe('with a revoked date thats set in the future', () => {
        beforeEach(() => {
          importedLicence.revokedDate = new Date('2025-04-01')
          Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_futureRevokedDate())
        })

        it('should not flag any supplementary billing', async () => {
          await ProcessImportedLicenceService.go(importedLicence, licence.id)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.false()
        })
      })
    })
  })
})

function _flaggedPreSrocLicence (id) {
  return {
    id,
    expired_date: null,
    lapsed_date: null,
    revoked_date: null,
    flagged_for_presroc: true,
    flagged_for_sroc: false,
    pre_sroc_charge_versions: true,
    sroc_charge_versions: false,
    two_part_tariff_charge_versions: false
  }
}

function _futureRevokedDate () {
  return {
    expired_date: null,
    lapsed_date: null,
    revoked_date: new Date('2024-04-01')
  }
}

function _preSrocLicence (id) {
  return {
    id,
    expired_date: new Date('2021-04-01'),
    lapsed_date: null,
    revoked_date: null,
    flagged_for_presroc: false,
    flagged_for_sroc: false,
    pre_sroc_charge_versions: true,
    sroc_charge_versions: false,
    two_part_tariff_charge_versions: false
  }
}

function _preSrocTwoPartTariffLicence (id) {
  return {
    id,
    expired_date: null,
    lapsed_date: null,
    revoked_date: null,
    flagged_for_presroc: false,
    flagged_for_sroc: false,
    pre_sroc_charge_versions: false,
    sroc_charge_versions: true,
    two_part_tariff_charge_versions: true
  }
}

function _srocLicence (id, date) {
  return {
    id,
    expired_date: null,
    lapsed_date: date ? new Date(date) : null,
    revoked_date: null,
    flagged_for_presroc: false,
    flagged_for_sroc: false,
    pre_sroc_charge_versions: false,
    sroc_charge_versions: true,
    two_part_tariff_charge_versions: false
  }
}

function _srocTwoPartTariffLicence (id, date) {
  return {
    id,
    expired_date: null,
    lapsed_date: null,
    revoked_date: date ? new Date(date) : null,
    flagged_for_presroc: false,
    flagged_for_sroc: false,
    pre_sroc_charge_versions: false,
    sroc_charge_versions: true,
    two_part_tariff_charge_versions: true
  }
}
