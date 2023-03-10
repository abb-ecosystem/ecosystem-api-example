import Hamburger from '../../components/hamburger.js';
import Procedure from './procedures.js';
import Variable from './variables.js';
import SettingsView from './settingsView.js';

import { imgVar, imgProc, imgSettings } from '../../constants/images.js';
import { moduleName, modulePath } from '../../constants/common.js';

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
      settingsView: new SettingsView(
        this.settingsViewElement,
        moduleName,
        'esNumParts',
        'esNumRows',
        'esNumCols',
        'esCurrentPart',
        'esSim'
      ),
      procedure: new Procedure(this.procElement, moduleName),
      variable: new Variable(this.varElement, moduleName),
    };
  }

  onRender() {
    // this.backgroundColor('#EBEBEB')
    this.container.classList.add('tc-container');

    this.hamburger = new Hamburger(this.find('#hamburger-container'), 'RAPID', true);
    this.hamburger.addView('MachineTending', this.settingsViewElement, imgSettings, true);
    this.hamburger.addView('Variables', this.varElement, imgVar, false);
    this.hamburger.addView('Procedures', this.procElement, imgProc, false);
    this.hamburger.render();

    // console.log('😎😎😎 - RapidView finished rendering...');
  }

  markup() {
    return `

      <div id="hamburger-container" class="tc-container"></div>
      <div id="settings-view-container"></div>
      <div id="variable-container"></div>
      <div id="procedure-container" class="tc-container"></div>
        
    `;
  }
}
