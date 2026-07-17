// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'

// Thing under test
import ViewMarkForSupplementaryBillingService from '../../../../app/services/licences/supplementary/view-mark-for-supplementary-billing.service.js'

describe('Licences - View Mark For Supplementary Billing Service', () => {
  let licence
  let testDate

  beforeEach(async () => {
    testDate = new Date('2024-04-01')
    vi.useFakeTimers({ now: testDate })

    licence = await LicenceHelper.add()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns page data for the view', async () => {
    const result = await ViewMarkForSupplementaryBillingService(licence.id)

    expect(result).toEqual({
      backLink: {
        href: `/system/licences/${licence.id}/set-up`,
        text: 'Back'
      },
      financialYears: [
        { text: '2024 to 2025', value: 2025, attributes: { 'data-test': 'sroc-years-2025' } },
        { text: '2023 to 2024', value: 2024, attributes: { 'data-test': 'sroc-years-2024' } },
        { text: '2022 to 2023', value: 2023, attributes: { 'data-test': 'sroc-years-2023' } },
        {
          text: 'Before 2022',
          value: 'preSroc',
          hint: { text: 'Old charge scheme' },
          attributes: { 'data-test': 'pre-sroc-years' }
        }
      ],
      pageTitle: 'Select which years you need to recalculate bills for',
      pageTitleCaption: `Licence ${licence.licenceRef}`
    })
  })
})
