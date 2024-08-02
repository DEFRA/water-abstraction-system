'use strict'

const { db } = require('../db.js')

const Regions = require('./data/regions.js')
const RegionModel = require('../../app/models/region.model.js')

async function seed () {
  for (const region of Regions.data) {
    const exists = await _exists(region)

    if (exists) {
      await _update(region)
    } else {
      await _insert(region)
    }
  }
}

async function _applyTestFlag (region, id) {
  if (region.name !== 'Test') {
    return null
  }

  return db('regions').withSchema('water').update('isTest', true).where('regionId', id)
}

async function _exists (region) {
  const { chargeRegionId, naldRegionId } = region

  const result = await RegionModel.query()
    .select('id')
    .where('chargeRegionId', chargeRegionId)
    .andWhere('naldRegionId', naldRegionId)
    .limit(1)
    .first()

  return !!result
}

async function _insert (region) {
  const result = await RegionModel.query().insert(region)

  return _applyTestFlag(region, result.id)
}

async function _update (region) {
  const { chargeRegionId, displayName, naldRegionId, name } = region

  return RegionModel.query()
    .patch({ displayName, name })
    .where('chargeRegionId', chargeRegionId)
    .andWhere('naldRegionId', naldRegionId)
}

module.exports = {
  seed
}
