import { imgToggle } from '../../constants/images.js';

export default class SignalComponents extends TComponents.Component_A {
  constructor(parent, props) {
    super(parent, props);

    this.initPropsDep(['signal']);
  }

  defaultProps() {
    return {
      signal: '',
    };
  }

  async onInit() {
    if (!this._props.signal) {
      this.error = true;
      return;
    }
    try {
      this._signal = typeof this._props.signal === 'string' ? await API.SIGNAL.getSignal(this._props.signal) : this._props.signal;
    } catch (e) {
      this.error = true;
      TComponents.Popup_A.error(e, 'SignalComponents');
    }
  }

  mapComponents() {
    const components = {};
    if (this._signal) {
      components['signalIndicator'] = new TComponents.SignalIndicator_A(this.find('.signal-indicator'), {
        signal: this._signal,
        label: this._signal.name,
      });
      components['toggleButton'] = new TComponents.Button_A(this.find('.toggle-btn'), {
        onClick: async (value) => {
          let v = await this._signal.getValue();
          !v ? this._signal.setValue(1) : this._signal.setValue(0);
        },
        text: 'Toggle',
        icon: imgToggle,
      });
      components['switch'] = new TComponents.SwitchSignal_A(this.find('.switch-button'), {
        signal: this._signal,
      });
    }
    return components;
  }

  onRender() {
    this.backgroundColor('white');
  }

  markup() {
    return /*html*/ `
    <div class="tc-container">
      <div class="signal-indicator tc-item"></div>
      <div class="toggle-btn tc-item"></div>
      <div class="switch-button tc-item"></div>
    </div>
    `;
  }

  set signal(signal) {
    this.setProps({ signal });
  }
}
