import Module from './module.js';

import { moduleName, modulePath } from '../../constants/common.js';

export default class Procedure extends TComponents.Component_A {
  constructor(parent) {
    super(parent);
    this.checkboxIsSR = new FPComponents.Checkbox_A();
    this._isSR = false;
  }

  async onInit() {
    try {
      this.task = await API.RAPID.getTask();
      this.checkboxIsSR.onclick = this.cbIsSR.bind(this);
    } catch (e) {
      this.error = true;
    }

    this.checkboxIsSR.desc = 'run as service routine';
  }

  mapComponents() {
    return {
      module: new TComponents.LayoutInfobox_A(this.find('.module-container'), {
        title: 'Modules',
        content: { children: new Module(null, modulePath, moduleName) },
      }),
      modSelector: new TComponents.SelectorModules_A(this.find('.module-dropdown'), {
        isInUse: false,
        label: 'Select a module:',
        addNoSelection: true,
      }),
      procSelector: new TComponents.SelectorProcedures_A(this.find('.proc-dropdown'), {
        label: 'Select a procedure:',
        addNoSelection: true,
      }),
      btnProcedure: new TComponents.ButtonProcedure_A(this.find('.exe-btn'), {
        procedure: '',
        userLevel: this._isSR,
        text: 'Execute',
      }),
      selectCycleMode: new TComponents.SelectorAlias_A(this.find('.cycle-mode'), {
        // label: 'Cycle mode:',
        itemMap: [
          { item: 'once', alias: 'Single' },
          { item: 'forever', alias: 'Continous' },
          { item: 'as_is', alias: 'As is' },
        ],
      }),
      layout: new TComponents.LayoutInfobox_A(this.find('.procedure-container'), {
        title: 'Procedures',
        content: { children: this.find('.procedure-content') },
      }),
    };
  }

  async onRender() {
    this.child.modSelector.onSelection(this.cbOnSelectionModule.bind(this));
    this.child.procSelector.onSelection(this.cbOnSelectionProcedure.bind(this));
    this.child.selectCycleMode.onSelection(this.cbOnSelectionCycleMode.bind(this));
    this.checkboxIsSR.attachToElement(this.find('.cb-btn'));
  }

  markup() {
    return /*html*/ `
    <div class="tc-container">
        <div class="module-container"></div>
        <div class="procedure-container"></div>

        <div class="procedure-content">
          <p>Please select a procedure and press execute button to call it.</p>
          <h4>Procedures:</h4>
          <div class="flex-row items-center">
            <div class="module-dropdown tc-item dd-h-30 dd-w-40"></div>
            <div class="proc-dropdown tc-item dd-h-30 dd-w-40"></div>
            <div class="exe-btn tc-item mt-7"></div>
            <div class="cb-btn tc-item mt-7"></div>
            <div class="cycle-mode tc-item mt-7"></div>  
          </div>
        </div>

      </div>
    </div>
    `;
  }

  cbIsSR(checked) {
    this.child.btnProcedure.userLevel = checked;
  }

  async cbOnSelectionModule(selection) {
    await this.child.procSelector.updateSearch(selection);
    const cycleMode = this.child.selectCycleMode.selected;
    const procedure = this.child.procSelector.selected;
    this.child.btnProcedure.setProps({ procedure, cycleMode });
  }

  cbOnSelectionProcedure(selection) {
    this.child.btnProcedure.procedure = selection;
    const cycleMode = this.child.selectCycleMode.selected;
    console.log('cycleMode', cycleMode);

    this.child.btnProcedure.setProps({ procedure: selection, cycleMode });
  }

  cbOnSelectionCycleMode(selection) {
    this.child.btnProcedure.cycleMode = selection;
    this.child.btnProcedure.setProps({ cycleMode: selection });
  }
}
