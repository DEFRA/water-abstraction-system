'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { generateUUID } = require('../../app/lib/general.lib.js')
const {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate
} = require('../../app/lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../app/models/return-cycle.model.js')

async function seed() {
  let year = 1959

  let determinationDate

  do {
    determinationDate = new Date(`${year}-04-01`)

    const summerReturnCycle = _generateReturnCycle(true, determinationDate)
    const allYearReturnCycle = _generateReturnCycle(false, determinationDate)

    if (allYearReturnCycle.startDate === new Date('2019-04-01')) {
      allYearReturnCycle.dueDate = new Date('2020-10-16')
    }

    await _upsert(summerReturnCycle)
    await _upsert(allYearReturnCycle)

    year++
  } while (determinationDate < new Date())
}

function _generateReturnCycle(summer, determinationDate) {
  return {
    id: generateUUID(),
    startDate: determineCycleStartDate(summer, determinationDate),
    endDate: determineCycleEndDate(summer, determinationDate),
    dueDate: determineCycleDueDate(summer, determinationDate),
    summer,
    submittedInWrls: true
  }
}

async function _upsert(cycle) {
  return ReturnCycleModel.query()
    .insert({ ...cycle, createdAt: timestampForPostgres(), updatedAt: timestampForPostgres() })
    .onConflict(['startDate', 'endDate', 'summer'])
    .merge(['dueDate', 'submittedInWrls', 'updatedAt'])
}

module.exports = {
  seed
}
