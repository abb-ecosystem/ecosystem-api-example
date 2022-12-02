/**
 * Start loading the app file. Put all of
 * your application logic in there.
 */

/**
 * When using RequireJS, the script is loaded asynchronously.
 * In many cases, this means that the load event will happen before
 * the script runs, therefore when using  window.addEventListener('load',...
 * the code may be listening for an event that has already happened.
 */
window.addEventListener('load', async function () {
  // RWS.setDebug(1, 0)
  fpComponentsEnableLog();

  API.setVerbose(true);
  const locale = await API.CONTROLLER.getLanguage();
  console.log(`Current language: ${locale}`);

  let monitor = API.RAPID.monitorExecutionState((value) => {
    console.log(`monitorExecutionState : ${value}`);
  });
  API.CONTROLLER.monitorOperationMode((value) => {
    console.log(`monitorOperationMode : ${value}`);
  });
  API.CONTROLLER.monitorControllerState((value) => {
    console.log(`monitorControllerState : ${value}`);
  });

  document.querySelector('#about-api').textContent = API.ECOSYSTEM_LIB_VERSION;
  document.querySelector('#about-tcomponents').textContent = T_COMPONENTS_BASE_VERSION;
  document.querySelector('#about-tcomponents-example').textContent = T_COMPONENTS_EXAMPLE_VERSION;

  const app = new App();
  // const app = new Test(document.getElementById('test'));
});
