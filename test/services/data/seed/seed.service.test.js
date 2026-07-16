// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import { db } from '../../../../db/db.js'

// Thing under test
import SeedService from '../../../../app/services/data/seed/seed.service.js'

describe('Seed service', () => {
  let knexRunStub

  beforeEach(async () => {
    knexRunStub = vi.fn().mockResolvedValue()

    vi.spyOn(db, 'seed', 'get').mockReturnValue({ run: knexRunStub })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the knex instance we configure to run the seed process', async () => {
    await SeedService()

    expect(knexRunStub).toHaveBeenCalled()
  })
})
