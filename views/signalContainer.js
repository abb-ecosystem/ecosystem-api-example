import TComponents from '../t-components/index.js';

export default class SignalContainer extends TComponents.Component_A {
  constructor(parent, signals) {
    super(parent);
    this._parentElement = parent;
    this._errorMessage = 'No signals found 😆!';
    this._message = '';
    Array.isArray(signals) ? (this._signalsData = signals) : (this._signalsData = [signals]);
    this.signalComponents = [];
  }

  async onInit() {
    this._signalsData.forEach(async (s) => {
      try {
        if (typeof s === 'string') s = await API.SIGNAL.getSignal(s);
        else if (!s || (typeof s === 'object' && s.constructor.name !== 'Signal'))
          throw new Error(
            'API.SIGNALS.Signal instance or signal name expected but not detected...'
          );
      } catch (e) {
        TComponents.Popup_A.danger('Signal Container', [e.message, e.description]);
      }
    });
  }

  mapComponents() {
    this._signals = this.all('.tc-signal-data');
    this._signals.forEach((signal) => {
      const s = new TComponents.SignalView_A(signal, {
        signal: this._signalsData[signal.dataset.index],
        control: true,
        edit: true,
      });
      this.signalComponents.push(s);
    });
    return { signalComponents: this.signalComponents };
  }

  onRender() {}

  renderSignals() {
    return this._signalsData
      .map((signal, index) => {
        return this.renderSignal(index);
      })
      .join('');
  }

  renderSignal(i) {
    let signal_markup;

    if (this._signals) {
      const signal = this._signals.find((signal) => Number(signal.dataset.index) === i);
      signal_markup = `<div class="tc-signal-data" data-ref="${signal.dataset.ref}" data-index="${i}"></div>`;
    } else {
      signal_markup = `
        <div class="tc-signal-data" data-index="${i}"></div>
      `;
    }
    return signal_markup;
  }

  markup(self) {
    return `
      <div class="tc-row">
        <div class="tc-col-1">
            ${self.renderSignals()}
         </div>
      </div>
      `;
  }

  set signals(signals) {
    signals.forEach((signal, idx) => {
      this.child.signalComponents[idx].value = signal;
    });
  }

  updateSignalAttributes(attr) {
    const signal = this.child.signalComponents.find((signalview) => {
      return signalview.name === attr.Name;
    });
    signal && signal.updateAttributes(attr);
  }

  getEditButtons() {
    const editButtons = [];
    if (this.child.signalComponents.length === 0) return editButtons;

    this.child.signalComponents.forEach((signal) => {
      editButtons.push(signal.getEditButton());
    });
    return editButtons;
  }
}
