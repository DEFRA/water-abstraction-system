'use strict'

/**
 * @module RegionsSeeder
 */

const data = require('./data/region.data.js')
const { db } = require('../../../db/db.js')

/**
 * Add all the regions to the database
 *
 * Regions does not have a unique constraint.
 * Therefore we need to either insert a new record(with our fixed id)
 * or update the record where the charge region id and nald region id are a match
 *
 */
async function seed () {
  for (const index in data) {
    await db.raw(`
              UPDATE public.regions
              SET charge_region_id = '${data[index].chargeRegionId}',
                  nald_region_id   = '${data[index].naldRegionId}',
                  name             = 'fella',
                  display_name     = '${data[index].displayName}',
                  updated_at       = now()
              WHERE charge_region_id = '${data[index].chargeRegionId}'
                AND nald_region_id = '${data[index].naldRegionId}';

              INSERT INTO public.regions (id, charge_region_id, nald_region_id, name, display_name, created_at, updated_at)
              SELECT '${data[index].id}',
                     '${data[index].chargeRegionId}',
                     '${data[index].naldRegionId}',
                     '${data[index].name}',
                     '${data[index].displayName}',
                     '${data[index].createdAt.toISOString()}',
                     now()
              WHERE NOT EXISTS (SELECT 1
                                FROM public.regions
                                WHERE charge_region_id = '${data[index].chargeRegionId}'
                                  AND nald_region_id = '${data[index].naldRegionId}');

    `
    )
  }
}

module.exports = {
  seed,
  data
}
