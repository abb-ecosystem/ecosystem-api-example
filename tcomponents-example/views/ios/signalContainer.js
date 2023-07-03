/**
 * @typedef SignalContainerProps
 * @prop {API.SIGNAL.Signal[] | string[]} [signals] Function to be called when button is pressed
 */

/**
 * @class SignalContainer
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {SignalContainerProps} [props]
 * @example
 */
export default class SignalContainer extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);
    this._errorMessage = 'No signals found 😆!';
    this._message = '';
    Array.isArray(this._props.signals)
      ? (this._signalsData = this._props.signals)
      : (this._signalsData = [this._props.signals]);
  }

  defaultProps() {
    this.noCheck = ['signals'];
    return { signals: [] };
  }

  async onInit() {
    this._signalsData.forEach(async (s) => {
      try {
        if (typeof s === 'string') s = await API.SIGNAL.getSignal(s);
      } catch (e) {
        this.error = true;
        TComponents.Popup_A.danger('Signal Container', [e.message, e.description]);
      }
    });
  }

  mapComponents() {
    const children = this._signalsData.map(
      (signal) =>
        new TComponents.SignalView_A(null, {
          signal,
          control: true,
          edit: true,
        })
    );
    return {
      signalContainer: new TComponents.Container_A(this.find('.tc-signal-container'), {
        children,
        box: true,
      }),
    };
  }

  onRender() {
    // this.child.signalContainer.css(/*css*/ `
    // border: 1px solid #ccc;
    // border-radius: 10px;
    // padding: 10px;`);
    // this.child.signalContainer.cssBox();
    // this.child.signalContainer.cssItem('signal-red');
  }

  markup(self) {
    return /*html*/ `
      <div class="tc-row">
        <div class="tc-col-1 ">
          <div class="tc-signal-container"></div>
      </div>
      `;
  }

  updateSignalAttributes(attr) {
    const signal = this.child.signalContainer.child.children.find((signalview) => {
      return signalview.name === attr.Name;
    });
    signal && signal.updateAttributes(attr);
  }

  getEditButtons() {
    const editButtons = [];
    this.child.signalContainer.child.children.forEach((signal) => {
      editButtons.push(signal.getEditButton());
    });
    return editButtons;
  }
}

SignalContainer.loadCssClassFromString(/*css*/ `
.signal-red {
  background-color: #da8181;
}
`);
