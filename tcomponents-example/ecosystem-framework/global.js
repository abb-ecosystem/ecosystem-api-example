import { API, TComponents } from './index.js';

((root) => {
  console.log('✔', 'Ecosystem-Framework: Loading API and TComponents...');
  root.API = API;
  root.TComponents = TComponents;
})(self !== undefined ? self : this);

export { API, TComponents };
