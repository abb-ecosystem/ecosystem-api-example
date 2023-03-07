// import TComponents from './t-components/index.js';
import RapidView from "./views/rapid/rapid.js";
import TrayView from "./views/motion/trayView.js";
import IoView from "./views/ios/ios.js";
import TComponentsView from "./views/tComponentsView.js";
import About from "./views/about.js";

import {
  moduleName,
  modulePath,
  configPath,
  configName,
} from "./constants/common.js";

const path = window.location.pathname.split("/");
const dir = path[path.length - 2];

export default class App extends TComponents.Component_A {
  constructor(parent) {
    super(parent, { options: { async: false } });
  }

  async onInit() {
    try {
      const task = await API.RAPID.getTask();
      const modules = await task.searchModules();
      const moduleFound = modules.some((module) => module.name === moduleName);
      if (!moduleFound) {
        this.error = true;
        TComponents.Popup_A.confirm(
          `${moduleName} module not yet loaded on the controller`,
          [
            "This module is required for this WebApp.",
            "Do you want to load the module?",
          ],
          this.cbConfirmLoadModule.bind(this)
        );
      }

      const signalFound = await API.SIGNAL.search(
        { name: "di_is_gripper_closed" },
        true
      );
      if (signalFound.length === 0) {
        this.error = true;
        TComponents.Popup_A.confirm(
          `Required signals not yet loaded on the controller`,
          [
            "Youl can load a demo singal configuration.",
            "A system restart will be executed.",
            "Do you want to proceed?",
          ],
          this.cbConfirmLoadConfiguration.bind(this)
        );
      }
    } catch (e) {
      this.error = true;
      TComponents.Popup_A.error(e, "Error during start-up");
    }
  }

  mapComponents() {
    return this.error
      ? {}
      : {
          /**
           * RAPID TAB
           */
          rapidView: new RapidView(this.find("#rapid-view")),
          /**
           * TComponents
           */
          tComponents: new TComponentsView(this.find("#tc-view")),
          /**
           * MOTION TAB
           */
          trayView: new TrayView(
            this.find("#motion-view"),
            "Tray Configuration",
            moduleName,
            "esTray01",
            "esTray02",
            "esTray03",
            "esTray04",
            "esTrayGrip",
            "esTrayApproach",
            "esTrayExit"
          ),
          /**
           * DIGITAL IO TAB
           */
          ioView: new IoView(this.find("#io-view")),
          /**
           * About
           */
          about: new About(this.find("#about-view")),
        };
  }

  async onRender() {
    if (this.error) return;
    this.container.classList.add("tc-container");

    /**
     * TAB CONTAINER
     */
    const tabContainer = new FPComponents.Tabcontainer_A();
    tabContainer.addTab("RAPID", "rapid-view");
    tabContainer.addTab("Motion", "motion-view");
    tabContainer.addTab("Digital IOs", "io-view");
    tabContainer.addTab("TComponents", "tc-view");
    tabContainer.addTab("About", "about-view");
    tabContainer.attachToId("tab-container");

    // console.log('😎😎😎😎😎 - App finished rendering...');
  }

  markup() {
    return `
    <div class="box-grow">
      <div id="tab-container" class="tc-container"></div>
      <div id="rapid-view"></div>
      <div id="motion-view"></div>
      <div id="io-view"></div>
      <div id="tc-view"></div>
      <div id="about-view"></div>
    </div>
    `;
  }

  async cbConfirmLoadModule(action) {
    try {
      if (action === "ok") {
        let url = `${modulePath}/${moduleName}.sysx`;
        const replace = true;
        await API.RAPID.loadModule(url, replace);
      }
    } catch (e) {
      console.error(e);
    }
    TComponents.Popup_A.info("Please restart the WebApp...");

    // await this.render();
  }

  async cbConfirmLoadConfiguration(action) {
    if (action === "ok") {
      let url = `${configPath}/${configName}.cfg`;
      console.log("💥", url);
      const action = "replace";
      try {
        await API.CONFIG.loadConfiguration(url, action);
        await API.sleep(2000);
        await API.CONTROLLER.restart();
      } catch (e) {
        TComponents.Popup_A.danger("Failed to restart controller", [
          e.message,
          e.description,
        ]);
      }
    }
  }
}
