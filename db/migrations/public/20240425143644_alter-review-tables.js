'use strict'

exports.up = async function (knex) {
  await knex.schema.alterTable('review_charge_references', (table) => {
    table.decimal('amended_aggregate', null, null).defaultTo(1)
    table.decimal('charge_adjustment', null, null).defaultTo(1)
    table.decimal('amended_charge_adjustment', null, null).defaultTo(1)
    table.decimal('abatement_agreement', null, null).defaultTo(1)
    table.boolean('winter_discount')
    table.boolean('two_part_tariff_agreement')
    table.boolean('canal_and_river_trust_agreement')
  })

  await knex.schema.alterTable('review_charge_elements', (table) => {
    table.renameColumn('calculated', 'amended_allocated')
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('review_charge_references', (table) => {
    table.dropColumn('amended_aggregate')
    table.dropColumn('charge_adjustment')
    table.dropColumn('amended_charge_adjustment')
    table.dropColumn('winter_discount')
    table.dropColumn('abatement_agreement')
    table.dropColumn('two_part_tariff_agreement')
    table.dropColumn('canal_and_river_trust_agreement')
  })

  await knex.schema.alterTable('review_charge_elements', (table) => {
    table.renameColumn('amended_allocated', 'calculated')
  })
}
