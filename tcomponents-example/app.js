
import RapidView from './views/rapid/rapid.js';
import TrayView from './views/motion/trayView.js';
import IoView from './views/ios/ios.js';
import TComponentsView from './views/tComponentsView.js';
import About from './views/about.js';

import { moduleName, modulePath, configPath, configName } from './constants/common.js';

const path = window.location.pathname.split('/');
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
          ['This module is required for this WebApp.', 'Do you want to load the module?'],
          this.cbConfirmLoadModule.bind(this)
        );
      }

      const signalFound = await API.SIGNAL.search({ name: 'di_is_gripper_closed' }, true);
      if (signalFound.length === 0) {
        this.error = true;
        TComponents.Popup_A.confirm(
          `Required signals not yet loaded on the controller`,
          ['Youl can load a demo singal configuration.', 'A system restart will be executed.', 'Do you want to proceed?'],
          this.cbConfirmLoadConfiguration.bind(this)
        );
      }
    } catch (e) {
      this.error = true;
      TComponents.Popup_A.error(e, 'Error during start-up');
    }
  }

  mapComponents() {
    if (this.error) return {};

    const rapidView = new RapidView(null);
    const tComponents = new TComponentsView(null);
    const trayView = new TrayView(this.find('#motion-view'), {
      name: 'Tray Configuration',
      module: moduleName,
      tray1: 'esTray01',
      tray2: 'esTray02',
      tray3: 'esTray03',
      tray4: 'esTray04',
      trayGrip: 'esTrayGrip',
      trayApproach: 'esTrayApproach',
      trayExit: 'esTrayExit',
    });
    const ioView = new IoView(null);
    const about = new About(null);

    /**
     * TAB CONTAINER
     */
    const tabContainer = new TComponents.TabContainer_A(this.find('#tab-container'), {
      // hiddenTabs: true,
      views: [
        { name: 'RAPID', content: rapidView },
        { name: 'Motion', content: trayView },
        { name: 'Digital IOs', content: ioView },
        { name: 'TComponents', content: tComponents },
        { name: 'About', content: about },
      ],
      onPlus: () => {
        const el = document.createElement('div');
        el.innerHTML = 'Hello world!';
        console.log('TabContainer onPlus: ', el);
        tabContainer.addTab({ name: 'new tab', content: el });
        // tabContainer.render();
      },
      plusEnabled: true,
      options: { async: false },
    });

    return {
      rapidView,
      tComponents,
      trayView,
      ioView,
      about,
      tabContainer,
    };
  }

  async onRender() {
    if (this.error) return;
    this.container.classList.add('tc-container');
  }

  markup() {
    return /*html*/ `
    <div class="box-grow">
      <div id="tab-container" class="tc-container"></div>
    </div>
    `;
  }

  async cbConfirmLoadModule(action) {
    try {
      if (action === 'ok') {
        let url = `${modulePath}/${moduleName}.sysx`;
        const replace = true;
        await API.RAPID.loadModule(url, replace);
      }
    } catch (e) {
      console.error(e);
    }
    TComponents.Popup_A.info('Please restart the WebApp...');

    // await this.render();
  }

  async cbConfirmLoadConfiguration(action) {
    if (action === 'ok') {
      let url = `${configPath}/${configName}.cfg`;
      const action = 'replace';
      try {
        await API.CONFIG.loadConfiguration(url, action);
        await API.sleep(2000);
        await API.CONTROLLER.restart();
      } catch (e) {
        TComponents.Popup_A.danger('Failed to restart controller', [e.message, e.description]);
      }
    }
  }
}
