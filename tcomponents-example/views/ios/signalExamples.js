import SignalComponents from './signalComponents.js';

import { configPath, configName } from '../../constants/common.js';

export default class SignalExamples extends TComponents.Component_A {
  constructor(parent) {
    super(parent);

    this._deviceSelected = '';
    this._signalSelected = '';
    this._filter = {};
  }

  async onInit() {
    try {
      const devices = await API.DEVICE.searchEthernetIPDevices();
      this._deviceSelected = devices[0];
      this._filter = { device: this._deviceSelected };
      const signals = await API.SIGNAL.search(this._filter, true);
      this._signalSelected = signals[0];
      this._signal = await API.SIGNAL.getSignal(this._signalSelected);
    } catch (e) {
      this.error = true;
      TComponents.Popup_A.danger('SignalExamples', [e.message, e.description]);
    }
  }

  mapComponents() {
    return {
      deviceSelector: new TComponents.SelectorEthernetIPDevices_A(this.find('.device-dropdown'), {
        selected: this._deviceSelected,
        label: 'Select a device:',
      }),
      signalSelector: new TComponents.SelectorSignals_A(this.find('.signal-dropdown'), {
        filter: this._filter,
        selected: this._signalSelected,
        label: 'Select a signal:',
      }),
      btnLoad: new TComponents.Button_A(this.find('.load-btn'), {
        onClick: this.cbLoadConfig.bind(this),
        text: 'Load example configuration',
      }),
      signalComponents: new SignalComponents(this.find('.signal-components'), {
        signal: this._signalSelected,
      }),
    };
  }

  onRender() {
    this.backgroundColor('white');
    this.child.deviceSelector.onSelection(this.cbDeviceSelector.bind(this));
    this.child.signalSelector.onSelection(this.cbSignalSelector.bind(this));
  }

  markup() {
    return /*html*/ `
    <div class="signal-example-view">
      <div class="tc-row">
        <div class="tc-cols-1 tc-infobox">
          <div>
            <p>Digital IOs</p>
          </div>
        </div>
      </div>
      <div class="tc-row">
        <div class="flex-row justify-start">
          <div class="tc-item">
            <div class="device-dropdown tc-item dd-container"></div>
            <div class="signal-dropdown tc-item dd-container"></div>
            <div class="load-btn tc-item"></div>
          </div>
          <div class="signal-components"></div>
        </div>
      </div>
    </div>
    `;
  }

  async cbDeviceSelector(selected) {
    if (this._deviceSelected === selected) return;
    this._deviceSelected = selected;
    this._filter = {
      device: selected,
    };

    await this.child.signalSelector.updateSearch(this._filter);
    const items = this.child.signalSelector.items;

    if (this.child.signalSelector.selected) this._signal = await API.SIGNAL.getSignal(this.child.signalSelector.selected);
    this._signalSelected = this.child.signalSelector.selected;
    this.child.signalComponents.signal = this._signalSelected;
  }

  async cbSignalSelector(selected) {
    this._signalSelected = selected;
    this.child.signalComponents.signal = selected;
  }

  cbLoadConfig() {
    TComponents.Popup_A.confirm(
      `IO System Configuration`,
      ['A system restart will be executed to load the configuration.', 'Do you want to proceed?'],
      this.cbConfirmLoadConfiguration.bind(this)
    );
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

SignalExamples.loadCssClassFromString(/*css*/ `

.signal-example-view {
  min-height: 320px;
}

.dd-container{
  min-height: 100px;
  min-width: 300px;
}
  `);
