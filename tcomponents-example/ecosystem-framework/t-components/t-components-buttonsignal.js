import { imgToggle, imgPulse } from './img/images.js';
import { Component_A, SignalIndicator_A, Button_A, SwitchSignal_A, Popup_A } from './index.js';

export class ButtonSignal_A extends Component_A {
  constructor(parent, props) {
    super(parent, props);

    this.initPropsDep(['signal']);
  }

  defaultProps() {
    return {
      signal: '',
      showIndicator: false,
      pulseInMiliSec: 0,
      text: '',
    };
  }

  async onInit() {
    if (!this._props.signal) {
      this.error = true;
      return;
    }
    try {
      this._signal =
        typeof this._props.signal === 'string' ? await API.SIGNAL.getSignal(this._props.signal) : this._props.signal;
    } catch (e) {
      this.error = true;
      console.error(e);
      Popup_A.error(e, 'ButtonSignal_A');
    }
  }

  mapComponents() {
    return {
      signalIndicator: this._props.showIndicator
        ? new SignalIndicator_A(this.find('.signal-indicator'), {
            signal: this._signal,
          })
        : null,
      toggleButton: new Button_A(this.find('.toggle-btn'), {
        onClick: this.cbOnClick.bind(this),
        icon: this._props.pulseInMiliSec > 0 ? imgPulse : imgToggle,
        text: this._props.text,
      }),
    };
  }

  onRender() {
    super.onRender();
  }

  markup() {
    return /*html*/ `

      <div class="flex-row justify-stretch">
      <div class="toggle-btn tc-item"></div>
        ${Component_A.mIf(this._props.showIndicator, /*html*/ `<div class="signal-indicator tc-item"></div>`)}
      </div>

    `;
  }
  async cbOnClick(value) {
    try {
      if (!this._signal) throw new Error('Signal not initialized');
      let v = await this._signal.getValue();
      if (this._props.pulseInMiliSec) {
        this._signal.setValue(1);
        await API.sleep(this._props.pulseInMiliSec);
        this._signal.setValue(0);
      } else {
        this._signal.setValue(v ? 0 : 1);
      }
      this.trigger('click', v);
    } catch (error) {
      Popup_A.error(error, 'ButtonSignal_A');
    }
  }

  set signal(signal) {
    this.setProps({ signal });
  }
}
