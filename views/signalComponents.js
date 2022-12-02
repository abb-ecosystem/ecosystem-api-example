const ToggleImg = 'assets/img/arrows-clockwise-fill.svg';

class SignalComponents extends TComponents.Component_A {
  constructor(container, signal = '') {
    super(container);
    this._signal = signal;
  }

  async onInit() {
    try {
      if (typeof this._signal === 'string') this._signal = await API.SIGNAL.getSignal(this._signal);
    } catch (e) {
      // silently ignore
    }
  }

  mapComponents() {
    const components = {};
    if (this._signal) {
      components['signalIndicator'] = new TComponents.SignalIndicator_A(
        this.find('.signal-indicator'),
        this._signal,
        this._signal.name
      );
      components['toggleButton'] = new TComponents.Button_A(
        this.find('.toggle-btn'),
        async (value) => {
          let v = await this._signal.getValue();
          !v ? this._signal.setValue(1) : this._signal.setValue(0);
        },
        'Toggle',
        ToggleImg
      );
      components['switch'] = new TComponents.SignalSwitch_A(
        this.find('.switch-button'),
        this._signal,
        ''
      );
    }
    return components;
  }

  onRender() {
    this.backgroundColor('white');
  }

  markup() {
    return `
    <div class="tc-container">
      <div class="signal-indicator tc-item"></div>
      <div class="toggle-btn tc-item"></div>
      <div class="switch-button tc-item"></div>
    </div>
    `;
  }

  set signal(name) {
    (async () => {
      try {
        this._signal = await API.SIGNAL.getSignal(name);
      } catch (e) {
        this._signal = undefined;
      }
      this.render();
    })();
  }
}
