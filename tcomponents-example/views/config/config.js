import CrossConnection from './crossConnection.js';
import LogicSignal from './logicSignal.js';

export default class ConfigView extends TComponents.Component_A {
  constructor(container) {
    super(container);
  }

  mapComponents() {
    return {
      crossCons: new CrossConnection(this.find('.cross-connections-container')),
      virtualSignal: new LogicSignal(this.find('.logic-signals-container')),
    };
  }

  markup() {
    return /*html*/ `
    <div class="row">
      <div class="cols-2">     
          <div class="cross-connections-container"></div>
      </div>
      <div class="cols-2">
        <div class="logic-signals-container "></div>
      </div>
    </div>
    `;
  }
}
