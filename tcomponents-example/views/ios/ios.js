import SignalExamples from './signalExamples.js';
import SignalConfigurator from './signalConfigurator.js';

export default class IoView extends TComponents.Component_A {
  /**
   * @brief Called when an instance of this component is created.
   *
   * @param {HTMLElement} parent - DOM element in which this component is to be inserted
   */
  constructor(parent) {
    super(parent);
  }

  async onInit() {}

  mapComponents() {
    return {
      signalExamples: new SignalExamples(this.find('.io-signal-example')),
      signalConfig: new SignalConfigurator(this.find('.io-signal-configurator')),
    };
  }

  onRender() {
    this.backgroundColor('#EBEBEB');
    this.child.signalExamples.cssBox(true);
    this.child.signalConfig.cssBox(true);
    // console.log('😎😎😎 - IoView finished rendering...');
  }

  markup() {
    return /*html*/ `
      <div class="tc-container">
        <div class="io-signal-configurator"></div>
        <div class="io-signal-example"></div>
      </div>
    `;
  }
}
