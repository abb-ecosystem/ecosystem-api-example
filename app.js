/**
 *
 */
const T_COMPONENTS_EXAMPLE_VERSION = '1.0.2';

const path = window.location.pathname.split('/');
const dir = path[path.length - 2];

const moduleName = 'Ecosystem_BASE';
const modulePath = `HOME/WebApps/${dir ? dir : 'EcosystemApi'}/rapid`;
const configName = 'EIO_ECOSYSTEM_GUIDE';
const configPath = `HOME/WebApps/${dir ? dir : 'EcosystemApi'}/config`;

// const imgMod = 'assets/img/brackets-round-fill.svg';
const imgVar = 'assets/img/wrench.png';
const imgProc = 'assets/img/abb_tray_input.png';
const imgSettings = 'assets/img/ABB_picto_40x40_gear.png';

class App {
  constructor() {
    this.init();
  }

  async init() {
    const task = await API.RAPID.getTask();
    const modules = await task.searchModules();
    const moduleFound = modules.some((module) => module.name === moduleName);
    if (!moduleFound) {
      TComponents.Popup_A.confirm(
        `${moduleName} module not yet loaded on the controller`,
        ['This module is required for this WebApp.', 'Do you want to load the module?'],
        this.cbConfirmLoadModule.bind(this)
      );
    }

    if (moduleFound) this.render();
  }

  async render() {
    /**
     * RAPID TAB
     */
    // document.querySelector('#rapid-view').style.backgroundColor = '#EBEBEB';

    const swElement = document.querySelector('#settings-view-container');
    const varElement = document.querySelector('#variable-container');
    const procElement = document.querySelector('#procedure-container');

    const settingsView = await new SettingsView(
      swElement,
      moduleName,
      'esNumParts',
      'esNumRows',
      'esNumCols',
      'esCurrentPart',
      'esSim'
    ).render();

    const procedure = await new Procedure(procElement, moduleName).render();
    const variable = await new Variable(varElement, moduleName).render();

    /**
     * MOTION TAB
     */

    const traySetup = new TrayView(
      document.querySelector('.tray-setup'),
      'Tray Configuration',
      moduleName,
      'esTray01',
      'esTray02',
      'esTray03',
      'esTray04',
      'esTrayGrip',
      'esTrayApproach',
      'esTrayExit'
    );

    traySetup.render();
    document.querySelector('#motion-view').style.backgroundColor = '#EBEBEB';
    traySetup.cssContainer(true);

    /**
     * DIGITAL IO TAB
     */
    document.querySelector('#io-view').style.backgroundColor = '#EBEBEB';

    const signalExamples = new SignalExamples(document.querySelector('.signal-components'));
    signalExamples.cssContainer(true);
    signalExamples.render();

    const signalConfig = new SignalConfigurator(document.querySelector('.signal-configurator'));
    signalConfig.cssContainer(true);
    signalConfig.render();

    /**
     * TComponents
     */
    const tComponents = new TComponentsView(document.querySelector('#tc-view'));
    tComponents.render();

    /**
     * HAMBURGER CONTAINER
     */
    const hamburger = new Hamburger(document.querySelector('#hamburger-container'), 'RAPID', true);
    hamburger.addView('Settings View', swElement, imgSettings, true);
    hamburger.addView('Variables', varElement, imgVar, false);
    hamburger.addView('Procedures', procElement, imgProc, false);
    await hamburger.render();

    /**
     * TAB CONTAINER
     */
    const tabContainer = new FPComponents.Tabcontainer_A();
    tabContainer.addTab('RAPID', 'rapid-view');
    tabContainer.addTab('Motion', 'motion-view');
    tabContainer.addTab('Digital IOs', 'io-view');
    tabContainer.addTab('TComponents', 'tc-view');
    tabContainer.addTab('About', 'about-view');
    tabContainer.attachToId('tab-container');
  }

  async cbConfirmLoadModule(action) {
    if (action === 'ok') {
      let url = `${modulePath}/${moduleName}.sysx`;
      const replace = true;
      await API.RAPID.loadModule(url, replace);
    }
    this.render();
  }
}
