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
      // settingsView: new SettingsView(
      //   this.settingsViewElement,
      //   moduleName,
      //   'esNumParts',
      //   'esNumRows',
      //   'esNumCols',
      //   'esCurrentPart',
      //   'esSim'
      // ),
      // procedure: new Procedure(this.procElement),
      // variable: new Variable(this.varElement, moduleName),

      hamburger: new TComponents.Hamburger_A(this.find('#hamburger-container'), {
        title: 'RAPID',
        alwaysVisible: true,
        views: [
          {
            name: 'MachineTending',
            content: new SettingsView(
              null,
              moduleName,
              'esNumParts',
              'esNumRows',
              'esNumCols',
              'esCurrentPart',
              'esSim'
            ),
            image: imgSettings,
            active: true,
          },
          { name: 'Variables', content: new Variable(null, moduleName), image: imgVar },
          { name: 'Procedures', content: new Procedure(null), image: imgProc },
        ],

        // hamburger: new TComponents.Hamburger_A(this.find('#hamburger-container'), {
        //   title: 'RAPID',
        //   alwaysVisible: true,
        //   views: [
        //     {
        //       name: 'MachineTending',
        //       content: this.settingsViewElement,
        //       image: imgSettings,
        //       active: true,
        //     },
        //     { name: 'Variables', content: this.varElement, image: imgVar },
        //     { name: 'Procedures', content: this.procElement, image: imgProc },
        //   ],

        onChange: (oldView, newView) => {
          //console.log('😬', `old: ${oldView}`, `new: ${newView}`);
        },
        options: { async: false },
      }),
    };
  }

  onRender() {
    // this.backgroundColor('#EBEBEB')
    this.container.classList.add('tc-container');

    // setTimeout(() => {
    //   let activeView = this.child.hamburger.activeView;
    //   console.log('😯', activeView);
    //   this.child.hamburger.activeView = 'Variables';

    //   console.log('🙄', this.child.hamburger.viewList);
    // }, 2000);
  }

  markup() {
    return /*html*/ `
      <div id="hamburger-container" class="tc-container"></div>
      <!--
      <div id="settings-view-container">Settings view</div>
      <div id="variable-container">Variable view</div>
      <div id="procedure-container" class="tc-container">Procedure view</div>
      -->
    `;
  }
}
