'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: changeReasons } = require('./data/change-reasons.js')
const ChangeReasonModel = require('../../app/models/change-reason.model.js')

async function seed() {
  for (const changeReason of changeReasons) {
    const exists = await _exists(changeReason)

    if (exists) {
      await _update(changeReason)
    } else {
      await _insert(changeReason)
    }
  }
}

async function _exists(changeReason) {
  const { description, type } = changeReason

  const result = await ChangeReasonModel.query()
    .select('id')
    .where('description', description)
    .where('type', type)
    .limit(1)
    .first()

  return !!result
}

async function _insert(changeReason) {
  // NOTE: The table does not auto populate the created and updated at fields, but does define them as not nullable!
  return ChangeReasonModel.query().insert({
    ...changeReason,
    createdAt: timestampForPostgres(),
    updatedAt: timestampForPostgres()
  })
}

async function _update(changeReason) {
  const { description, enabledForNewChargeVersions, triggersMinimumCharge, type } = changeReason

  return ChangeReasonModel.query()
    .patch({ enabledForNewChargeVersions, triggersMinimumCharge, updatedAt: timestampForPostgres() })
    .where('description', description)
    .where('type', type)
}

module.exports = {
  seed
}
