import API from './ecosystem-base.js';
import { factoryApiCfg } from './ecosystem-cfg.js';
import { factoryApiFile } from './ecosystem-file.js';
import { factoryApiMotion } from './ecosystem-motion.js';
import { factoryApiRapid } from './ecosystem-rapid.js';
import { factoryApiRws } from './ecosystem-rws.js';

if (typeof API.constructedCfg === 'undefined') {
  factoryApiCfg(API);
}

if (typeof API.constructedFile === 'undefined') {
  factoryApiFile(API);
}

if (typeof API.constructedMotion === 'undefined') {
  factoryApiMotion(API);
}

if (typeof API.constructedRapid === 'undefined') {
  factoryApiRapid(API);
}

if (typeof API.constructedRWS === 'undefined') {
  factoryApiRws(API);
}

export default API;
