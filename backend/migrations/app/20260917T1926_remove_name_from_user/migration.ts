#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0b0fbef559866099d2b618f551f010bfedbd0f3c65523b6c1d3bc4cc5238cad5/contract';
import startContract from '../../snapshots/0b0fbef559866099d2b618f551f010bfedbd0f3c65523b6c1d3bc4cc5238cad5/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b238e96c104de772f0df7fce6fabba552eaa926081a09ba4fec5aeb1a439dc53/contract';
import endContract from '../../snapshots/b238e96c104de772f0df7fce6fabba552eaa926081a09ba4fec5aeb1a439dc53/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.dropColumn({ schema: 'public', table: 'user', column: 'name' })];
  }
}

MigrationCLI.run(import.meta.url, M);
