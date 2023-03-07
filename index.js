import App from "./app.js";

/**
 * Start loading the app file. Put all of
 * your application logic in there.
 */

window.addEventListener("load", async function () {
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

  const app = new App(document.getElementById("root")).render();
});
