import { db } from '../db.js'

import RegionModel from '../../app/models/region.model.js'
import { data as regions } from './data/regions.js'
import { timestampForPostgres } from '../../app/lib/general.lib.js'

import ServerConfig from '../../config/server.config.js'

/**
 * Seed the regions reference data
 *
 * Water.regions does not have a composite key constraint for chargeRegionId and naldRegionId.
 *
 * We do not want multiple occurrences of the column pair chargeRegionId and naldRegionId.
 *
 * We manually check if the combination exits already and update / insert accordingly.
 *
 */
export default async function seed() {
  for (const region of regions) {
    const exists = await _exists(region)

    if (exists) {
      await _update(region)
    } else {
      await _insert(region)
    }
  }
}

async function _applyTestFlag(region, id) {
  if (region.name !== 'Test') {
    return null
  }

  return db('regions').withSchema('water').update('isTest', true).where('regionId', id)
}

async function _exists(region) {
  const { chargeRegionId, naldRegionId } = region

  const result = await RegionModel.query()
    .select('id')
    .where('chargeRegionId', chargeRegionId)
    .andWhere('naldRegionId', naldRegionId)
    .limit(1)
    .first()

  return !!result
}

async function _insert(region) {
  // The Bill Run & Test regions are only intended to be seeded in our non-production environments
  if ((region.name === 'Bill Run' || region.name === 'Test') && ServerConfig.environment === 'production') {
    return
  }

  const result = await RegionModel.query().insert(region)

  return _applyTestFlag(region, result.id)
}

async function _update(region) {
  const { chargeRegionId, displayName, naldRegionId, name } = region

  return RegionModel.query()
    .patch({ displayName, name, updatedAt: timestampForPostgres() })
    .where('chargeRegionId', chargeRegionId)
    .andWhere('naldRegionId', naldRegionId)
}
