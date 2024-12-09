'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/determine-blocking-bill-run.service.js')
const DetermineFinancialYearEndService = require('../../../../app/services/bill-runs/setup/determine-financial-year-end.service.js')

// Thing under test
const ExistsService = require('../../../../app/services/bill-runs/setup/exists.service.js')

describe('Bill Runs Setup Exists service', () => {
  let currentFinancialEndYear
  let setupSession
  let region

  beforeEach(async () => {
    region = RegionHelper.select()

    const { endDate } = determineCurrentFinancialYear()

    currentFinancialEndYear = endDate.getFullYear()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user is intending to create a two-part tariff bill run', () => {
      beforeEach(() => {
        setupSession = {
          type: 'two_part_tariff',
          region: region.id,
          year: '2022',
          season: 'summer'
        }

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(2022)
      })

      describe('and no matching bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
        })

        it('returns an object with an empty "matches", and "toFinancialYearEnding" is as selected', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding } = result

          expect(matches).to.be.empty()
          expect(toFinancialYearEnding).to.equal(2022)
        })
      })

      describe('and a matching bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
            {
              id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1',
              batchType: 'two_part_tariff',
              billRunNumber: 12345,
              createdAt: new Date('2022-05-01'),
              region,
              scheme: 'alcs',
              status: 'sent',
              summer: true,
              toFinancialYearEnding: 2022
            }
          ])
        })

        it('returns an object with "matches" set, and "toFinancialYearEnding" is as selected', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding } = result

          expect(matches[0].id).to.equal('dfbbc7ac-b15b-483a-afcf-a7c01ac377d1')
          expect(toFinancialYearEnding).to.equal(2022)
        })
      })
    })

    describe('and the user is intending to create an annual bill run', () => {
      beforeEach(() => {
        // NOTE: Just to prove the service can handle it, we imagine the user went down the route of a 2PT bill run,
        // then changed their mind and went back and selected supplementary. Year and season are now irrelevant and
        // leaving them in confirms this.
        setupSession = {
          type: 'annual',
          region,
          year: '2022',
          season: 'summer'
        }

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(currentFinancialEndYear)
      })

      describe('and no matching bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
        })

        it('returns an object with an empty "matches", and "toFinancialYearEnding" is the current financial year end', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding } = result

          expect(matches).to.be.empty()
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
        })
      })

      describe('and a matching bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
            {
              id: '5612815f-9f67-4ac1-b697-d9ab7789274c',
              batchType: 'annual',
              billRunNumber: 12345,
              createdAt: new Date('2023-05-01'),
              region,
              scheme: 'sroc',
              status: 'sent',
              summer: false,
              toFinancialYearEnding: 2024
            }
          ])
        })

        it('returns an object with "matches" set, and "toFinancialYearEnding" is the current financial year end', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding } = result

          expect(matches[0].id).to.equal('5612815f-9f67-4ac1-b697-d9ab7789274c')
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
        })
      })
    })

    describe('and the user is intending to create a supplementary bill run', () => {
      beforeEach(() => {
        // NOTE: Just to prove the service can handle it, we imagine the user went down the route of a 2PT bill run,
        // then changed their mind and went back and selected supplementary. Year and season are now irrelevant and
        // leaving them in confirms this.
        setupSession = {
          type: 'supplementary',
          region: region.id,
          year: '2022',
          season: 'summer'
        }

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(currentFinancialEndYear)
      })

      describe('and no matching bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
        })

        it('returns an object with an empty "matches", and "toFinancialYearEnding" is the current financial year end', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding } = result

          expect(matches).to.be.empty()
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
        })
      })

      describe('and one matching bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
            {
              id: '7b8a518b-ee0c-4c12-acfe-3b99f99d4c53',
              batchType: 'supplementary',
              billRunNumber: 12345,
              createdAt: new Date('2023-05-01'),
              region,
              scheme: 'sroc',
              status: 'ready',
              summer: false,
              toFinancialYearEnding: 2024
            }
          ])
        })

        it('returns an object with "matches" set, and "toFinancialYearEnding" is the current financial year end', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding } = result

          expect(matches[0].id).to.equal('7b8a518b-ee0c-4c12-acfe-3b99f99d4c53')
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
        })
      })

      describe('and two matching bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
            {
              id: '7b8a518b-ee0c-4c12-acfe-3b99f99d4c53',
              batchType: 'supplementary',
              billRunNumber: 12345,
              createdAt: new Date('2023-05-01'),
              region,
              scheme: 'sroc',
              status: 'ready',
              summer: false,
              toFinancialYearEnding: 2024
            },
            {
              id: '5be625b3-a954-465d-8ab8-cde1b2f052ce',
              batchType: 'supplementary',
              billRunNumber: 12345,
              createdAt: new Date('2023-05-01'),
              region,
              scheme: 'presroc',
              status: 'ready',
              summer: false,
              toFinancialYearEnding: 2024
            }
          ])
        })

        it('returns an object with "matches" set, and "toFinancialYearEnding" is the current financial year end', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding } = result

          expect(['7b8a518b-ee0c-4c12-acfe-3b99f99d4c53', '5be625b3-a954-465d-8ab8-cde1b2f052ce']).includes(
            matches[0].id
          )
          expect(['7b8a518b-ee0c-4c12-acfe-3b99f99d4c53', '5be625b3-a954-465d-8ab8-cde1b2f052ce']).includes(
            matches[1].id
          )
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
        })
      })
    })
  })
})
