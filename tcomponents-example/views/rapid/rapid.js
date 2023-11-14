import Procedure from './procedures.js';
import Variable from './variables.js';
import SettingsView from './settingsView.js';

import { imgVar, imgProc, imgSettings } from '../../constants/images.js';
import { moduleName } from '../../constants/common.js';

export default class RapidView extends TComponents.Component_A {
  constructor(parent) {
    super(parent, { options: { async: false } });
    // super(parent);
  }

  mapComponents() {
    this.varElement = this.find('#variable-container');
    this.procElement = this.find('#procedure-container');
    this.settingsViewElement = this.find('#settings-view-container');

    return {
      hamburger: new TComponents.Hamburger_A(this.find('#hamburger-container'), {
        title: 'RAPID',
        alwaysVisible: true,
        views: [
          {
            name: 'MachineTending',
            content: new SettingsView(null, moduleName, 'esNumParts', 'esNumRows', 'esNumCols', 'esCurrentPart', 'esSim'),
            image: imgSettings,
            active: true,
          },
          { name: 'Variables', content: new Variable(null, { module: moduleName }), image: imgVar },
          { name: 'Procedures', content: new Procedure(null), image: imgProc },
        ],
        onChange: (oldView, newView) => {
          //console.log('😬', `old: ${oldView}`, `new: ${newView}`);
        },
        options: { async: false },
      }),
    };
  }

  onRender() {
    this.container.classList.add('tc-container');
  }

  markup() {
    return /*html*/ `
      <div id="hamburger-container" class="tc-container"></div>
    `;
  }
}
