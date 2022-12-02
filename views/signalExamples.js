class SignalExamples extends TComponents.Component_A {
  constructor(container) {
    super(container);
  }

  async onInit() {
    try {
      const devices = await API.DEVICE.searchEthernetIPDevices();

      this._deviceSelected = '';
      this._filter = {
        // device: devices[0],
      };
      const signals = await API.SIGNAL.search(this._filter, true);

      this._signalSelected = '';
      this._signal = await API.SIGNAL.getSignal(signals[0]);
    } catch (e) {
      TComponents.Popup_A.danger('SignalComponents', [e.message, e.description]);
    }
  }

  mapComponents() {
    return {
      deviceSelector: new TComponents.SelectorEthernetIPDevices_A(
        this.find('.device-dropdown'),
        this._deviceSelected,
        'Select a device:'
      ),
      signalSelector: new TComponents.SelectorSignals_A(
        this.find('.signal-dropdown'),
        this._filter,
        this._signalSelected,
        'Select a signal:'
      ),
      btnLoad: new TComponents.Button_A(
        this.find('.load-btn'),
        this.cbLoadConfig.bind(this),
        'Load example configuration'
      ),
      signalComponents: new SignalComponents(this.find('.signal-components'), this._signalSelected),
    };
  }

  onRender() {
    this.backgroundColor('white');
    this.child.deviceSelector.onSelection(this.cbDeviceSelector.bind(this));
    this.child.signalSelector.onSelection(this.cbSignalSelector.bind(this));
  }

  markup() {
    return `
    <div class="tc-container">
      <div class="tc-row">
        <div class="tc-cols-1 tc-infobox">
          <div>
            <p>Digital IOs</p>
          </div>
        </div>
      </div>
      <div class="tc-row">
        <div class="tc-cols-2 tc-container-row ">
          <div>
            <div class="device-dropdown tc-item"></div>
            <div class="signal-dropdown tc-item"></div>
            <div class="load-btn tc-item"></div>
          </div>
          <div class="signal-components"></div>
        </div>
      </div>
    </div>
    `;
  }

  async cbDeviceSelector(selected) {
    this._deviceSelected = selected;
    this._filter = {
      device: selected,
    };

    await this.child.signalSelector.updateSearch(this._filter, false);
    if (this.child.signalSelector.selected)
      this._signal = await API.SIGNAL.getSignal(this.child.signalSelector.selected);
    this._signalSelected = this.child.signalSelector.selected;
    this.render();
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
        await API.loadConfiguration(url, action);
        await API.sleep(2000);
        await API.CONTROLLER.restart();
      } catch (e) {
        TComponents.Popup_A.danger('Failed to restart controller', [e.message, e.description]);
      }
    }
  }
}
