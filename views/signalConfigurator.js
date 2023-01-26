class SignalConfigurator extends TComponents.Component_A {
  constructor(parent) {
    super(parent);
  }

  async onInit() {
    this._devices = await API.DEVICE.searchEthernetIPDevices();

    this._deviceSelected = this._devices[0];
    this._filter = {
      device: this._deviceSelected,
    };

    this.diSignals = await API.SIGNAL.searchByType('DI', this._deviceSelected);
    this.doSignals = await API.SIGNAL.searchByType('DO', this._deviceSelected);
  }

  mapComponents() {
    const editSignal = new TComponents.SignalEdit_A(this.find('.edit-window'));
    return {
      inputSignalContainer: new SignalContainer(
        this.find('#signal-container-input'),
        this.diSignals
      ),
      outputSignalContainer: new SignalContainer(
        this.find('#signal-container-output'),
        this.doSignals
      ),
      deviceSelector: new TComponents.SelectorEthernetIPDevices_A(
        this.find('.device-dropdown'),
        this._deviceSelected,
        'Select a device:'
      ),
      editSignal: editSignal,
      modalWindow: new TComponents.ModalWindow_A(this.find('.modal-window'), editSignal),
      btnReboot: new TComponents.ButtonReboot_A(this.find('.reboot-view'), true),
    };
  }

  onRender() {
    this.backgroundColor('white');
    this.child.deviceSelector.onSelection(this.cbDeviceSelector.bind(this));
    this.child.editSignal.onUpdate(this.updateSignalAttr.bind(this));
    this.child.modalWindow.triggerElements(this.child.inputSignalContainer.getEditButtons());
    this.child.modalWindow.triggerElements(this.child.outputSignalContainer.getEditButtons());

    this.child.btnReboot.hide();
  }

  markup() {
    return `
      <div class="tc-container">
        <div class="tc-row">
          <div class="tc-cols-1 tc-infobox">
            <div>
              <p>Signal Configurator</p>
            </div>
            <div class="device-dropdown"></div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-cols-2 tc-infobox">
            <div><p>Inputs</p></div>
            <div id="signal-container-input"></div>
          </div>
          <div class="tc-cols-2 tc-infobox">
            <div><p>Outputs</p></div>
            <div id="signal-container-output"></div>
          </div>
        </div>
        <div class="tc-row">
          <div class="reboot-view"></div>
        </div>
      </div>
      <div class="edit-window"></div>
      <div class="modal-window"></div>
      `;
  }

  async cbDeviceSelector(selected) {
    this._deviceSelected = selected;
    this._filter = {
      device: this._deviceSelected,
    };
    this.diSignals = await API.SIGNAL.searchByType('DI', this._deviceSelected);
    this.doSignals = await API.SIGNAL.searchByType('DO', this._deviceSelected);
    this.render();
  }

  async updateSignalAttr(attr) {
    const signal = await API.SIGNAL.searchByName(attr.Name);
    await signal.setAttr(attr);
    signal.type === 'DI'
      ? this.child.inputSignalContainer.updateSignalAttributes(attr)
      : this.child.outputSignalContainer.updateSignalAttributes(attr);

    let rebootRequired = await API.SIGNAL.isAnySignalModified();

    rebootRequired ? this.child.btnReboot.show() : this.child.btnReboot.hide();
    this.child.modalWindow.toggleWindow();
  }
}
