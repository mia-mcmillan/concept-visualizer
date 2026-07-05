import { build as buildCycle } from "./cycle.js";
import { build as buildProcess } from "./process.js";
import { build as buildNetwork } from "./network.js";
import { build as buildHierarchy } from "./hierarchy.js";
import { build as buildGrowth } from "./growth.js";
import { build as buildBalance } from "./balance.js";
import { build as buildOrbit } from "./orbit.js";
import { build as buildTransformation } from "./transformation.js";
import { build as buildLayers } from "./layers.js";
import { build as buildWave } from "./wave.js";
import { build as buildConnection } from "./connection.js";
import { build as buildAbstract } from "./abstract.js";

export const SCENE_BUILDERS = {
  cycle: buildCycle,
  process: buildProcess,
  network: buildNetwork,
  hierarchy: buildHierarchy,
  growth: buildGrowth,
  balance: buildBalance,
  orbit: buildOrbit,
  transformation: buildTransformation,
  layers: buildLayers,
  wave: buildWave,
  connection: buildConnection,
  abstract: buildAbstract,
};
