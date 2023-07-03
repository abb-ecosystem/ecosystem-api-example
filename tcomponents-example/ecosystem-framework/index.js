import API from './api/index.js';
import * as TComponents from './t-components/index.js';

function loadScript(path, callback) {
  var loaded = document.querySelector(`script[src~="${path}"]`);
  if (loaded) {
    if (typeof callback === 'function') callback();
    return;
  }
  var script = document.createElement('script');
  script.src = path;
  if (typeof callback === 'function') script.onload = callback;
  document.head.appendChild(script);
}
// loading RWS
const rwsPaths = ['rws-api/omnicore-app.js', 'rws-api/omnicore-rws.js'];
rwsPaths.forEach((path) => {
  loadScript(path);
});

// loading fp-components
loadScript('fp-components/fp-components-common.js', () => {
  const fpPaths = [
    'fp-components/fp-components-button-a.js',
    'fp-components/fp-components-checkbox-a.js',
    // 'fp-components/fp-components-contextmenu-a.js',
    'fp-components/fp-components-digital-a.js',
    'fp-components/fp-components-dropdown-a.js',
    // 'fp-components/fp-components-foldin-a.js',
    'fp-components/fp-components-hamburgermenu-a.js',
    'fp-components/fp-components-input-a.js',
    // 'fp-components/fp-components-levelmeter-a.js',
    // 'fp-components/fp-components-linechart-a.js',
    'fp-components/fp-components-menu-a.js',
    // 'fp-components/fp-components-piechart-a.js',
    'fp-components/fp-components-popup-a.js',
    'fp-components/fp-components-radio-a.js',
    // 'fp-components/fp-components-slider-a.js',
    'fp-components/fp-components-switch-a.js',
    'fp-components/fp-components-tabcontainer-a.js',
    // 'fp-components/fp-components-toggle-a.js',
  ];

  fpPaths.forEach((path) => {
    loadScript(path);
  });
});

export { API, TComponents };
