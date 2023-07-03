import App from './app.js';

window.addEventListener('load', async function () {
  // RWS.setDebug(1, 0)
  fpComponentsEnableLog();

  // API.setVerbose(true);
  // TComponents.Popup_A.enabled = false;

  try {
    const app = new App(document.getElementById('root')).render();
  } catch (e) {
    console.error('Access to controller failed...');
  }
});
