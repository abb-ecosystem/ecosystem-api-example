class TComponentsView extends TComponents.Component_A {
  constructor(parent, name = 'TComponents') {
    super(parent);
    this._name = name;
    this._module = 'Ecosystem_BASE';
    this._variable = 'esNumber';
    this._variableString = 'esString';
    this._variableBool = 'esBool';
    this._signal = 'di_is_gripper_closed';
  }

  async onInit() {
    // await API.sleep(2000);
  }

  mapComponents() {
    const editSignal = new TComponents.SignalEdit_A(this.find('.edit-signal'), this._signal);
    return {
      varInput: new TComponents.VarInput_A(
        this.find('.var-input-num'),
        this._module,
        this._variable,
        'VarInput_A'
      ),
      varInputString: new TComponents.VarInput_A(
        this.find('.var-input-string'),
        this._module,
        this._variableString,
        'VarInput_A (string)'
      ),
      varInputBool: new TComponents.VarInput_A(
        this.find('.var-input-bool'),
        this._module,
        this._variableBool,
        'VarInput_A (boolean)'
      ),
      varSwitch: new TComponents.VarSwitch_A(
        this.find('.var-switch-bool'),
        this._module,
        this._variableBool,
        'VarSwitch_A'
      ),
      varInd: new TComponents.VarIndicator_A(
        this.find('.var-ind'),
        this._module,
        this._variable,
        'VarIndicator_A'
      ),
      varIndString: new TComponents.VarIndicator_A(
        this.find('.var-ind-string'),
        this._module,
        this._variableString,
        'VarIndicator_A (string)'
      ),
      varIndBool: new TComponents.VarIndicator_A(
        this.find('.var-ind-bool'),
        this._module,
        this._variableBool,
        'VarIndicator_A (boolean)'
      ),
      varIncrDecrInd: new TComponents.VarIncrDecr_A(
        this.find('.var-incr-decr-readonly'),
        this._module,
        this._variable,
        true,
        5,
        'VarIncrDecr_A (readonly)'
      ),
      varIncrDecrInput: new TComponents.VarIncrDecr_A(
        this.find('.var-incr-decr-input'),
        this._module,
        this._variable,
        false,
        1,
        'VarIncrDecr_A'
      ),
      // dropDownMenu: new FPComponents.Dropdown_A(),
      btnRender: new TComponents.Button_A(
        this.find('.btn-render'),
        this.cbRender.bind(this),
        'Button_A - Render'
      ),
      varButton: new TComponents.VarButton_A(
        this.find('.btn-var'),
        this._module,
        this._variable,
        async function (value) {
          console.log(`VarButton_A : value = ${value}`);
          TComponents.Popup_A.message('I am a Message window', [
            `Variable ${this._varialbe} equals:`,
            '',
            value,
          ]);
          TComponents.Popup_A.info('I am a Information window', [
            `Variable ${this._varialbe} equals:`,
            '',
            value,
          ]);
          TComponents.Popup_A.warning('I am a Warning window', [
            `Variable ${this._varialbe} equals:`,
            '',
            value,
          ]);
          TComponents.Popup_A.danger('I am a Error window', [
            `Variable ${this._varialbe} equals:`,
            '',
            value,
          ]);
          TComponents.Popup_A.confirm('I am a Confirm window', [
            `Variable ${this._varialbe} equals:`,
            '',
            value,
          ]);
        },
        'VarButton_A'
      ),
      btnProcedure: new TComponents.ButtonProcedure_A(
        this.find('.btn-procedure'),
        'es_Procedure_01',
        true,
        'Execute procedure'
      ),
      teach: new TComponents.ButtonTeach_A(
        this.find('.btn-teach'),
        'esTarget02',
        'Ecosystem_BASE',
        'ButtonTeach_A'
      ),
      move: new TComponents.ButtonMoveTo_A(
        this.find('.btn-move'),
        'esTarget02',
        'Ecosystem_BASE',
        'ButtonMoveTo_A'
      ),
      teachMove: new TComponents.ButtonTeachMove_A(
        this.find('.btn-teach-move'),
        'esTarget02',
        'Ecosystem_BASE',
        'ButtonTeachMove_A'
      ),
      selectorVar: new TComponents.SelectorVariables_A(
        this.find('.selector-var'),
        'Ecosystem_BASE',
        true,
        '',
        'SelectorVariables_A',
        false
      ),
      selectorModule: new TComponents.SelectorModules_A(
        this.find('.selector-module'),
        false,
        '',
        'SelectorModules_A',
        false
      ),
      selectorProc: new TComponents.SelectorProcedures_A(
        this.find('.selector-proc'),
        'Ecosystem_BASE',
        false,
        '',
        'SelectorProcedures_A',
        false
      ),
      selectorDevice: new TComponents.SelectorEthernetIPDevices_A(
        this.find('.selector-device'),
        '',
        'SelectorEthernetIPDevices_A'
      ),
      selectorSignal: new TComponents.SelectorSignals_A(
        this.find('.selector-signal'),
        { name: 'di_', category: 'EcoSystem' },
        'do_gripper_close',
        'SelectorSignals_A'
      ),
      signalIndicator: new TComponents.SignalIndicator_A(
        this.find('.signal-indicator'),
        this._signal,
        'DI Is Gripper Closed'
      ),
      signalView: new TComponents.SignalView_A(this.find('.signal-view'), this._signal, true),
      switch: new TComponents.SignalSwitch_A(
        this.find('.signal-switch'),
        this._signal,
        'DI Is Gripper Closed'
      ),
      editSignal: editSignal,
      modalWindow: new TComponents.ModalWindow_A(this.find('.modal-window'), editSignal),
      btnTrigger: new TComponents.Button_A(
        this.find('.btn-modal-trigger'),
        null,
        'trigger modal window'
      ),
      templateComp: new TComponents.TemplateView_A(this.find('.template-comp'), 'Template View'),
    };
  }

  onRender() {
    this.child.varInput.onChange((value) => {
      console.log(`varInput called - value ${value}`);
    });
    this.child.varInd.onChange((value) => {
      console.log(`varInd called - value ${value}`);
    });
    this.child.varIncrDecrInd.onChange((value) => {
      console.log(`varIncrDecrInd called - value ${value}`);
    });
    this.child.varIncrDecrInput.onChange((value) => {
      console.log(`varIncrDecrInput called - value ${value}`);
    });

    this.child.selectorModule.onSelection(this.cbOnSelectionModule.bind(this));
    this.child.selectorProc.onSelection(this.cbOnSelectionProcedure.bind(this));
    // this.child.dropDownMenu.model = { items: ['ab', 'cd', 'ef'] };
    // this.child.dropDownMenu.onselection = (value) => {
    //   console.log(`selection: ${value}`);
    // };
    // this.child.dropDownMenu.selected = 1;
    // this.child.dropDownMenu.desc = 'Using FPComponents';
    // this.child.dropDownMenu.attachToElement(this.find('.selector-dropdown'));
    this.child.modalWindow.triggerElements(this.child.signalView.getEditButton());
    this.child.modalWindow.triggerElements(this.child.btnTrigger.container);

    this.child.btnRender.highlight = true;

    // Accordion
    const sections = this.all('.tc-accordion-item');
    sections.map((section) => {
      section.addEventListener('click', this.cbArrowClick.bind(this));
    });
  }

  markup({ _name }) {
    return `
        <h1 class="row comp-text">${_name}</h1>
        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">Variables</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="tc-container-row">
              <div class="var-input-num tc-item"></div>
              <div class="var-input-string tc-item"></div>
              <div class="var-input-bool tc-item"></div>
              <div class="var-switch-bool tc-item"></div>
            </div>
            <div class="tc-container-row">
              <div class="var-ind tc-item"></div>
              <div class="var-ind-string tc-item"></div>
              <div class="var-ind-bool tc-item"></div>
            </div>
            <div class="tc-container-row">
              <div class="var-incr-decr-readonly tc-item"></div>
              <div class="var-incr-decr-input tc-item"></div>
            </div>
          </div>
        </div>

        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">Motion Buttons</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="tc-container-row">
              <div class="btn-teach"></div>
              <div class="btn-move"></div>
              <div class="btn-teach-move"></div>
            </div>
          </div>
        </div>

        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">RAPID Buttons</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="tc-container-row">
              <div class="btn-var"></div>
              <div class="btn-procedure "></div>
              <div class="btn-render"></div>
              <div class="btn-modal-trigger"></div>
            </div>
          </div>
        </div>

        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">Selectors</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="tc-container-row">
              <div class="selector-module item"></div>
              <div class="selector-var item"></div>
              <div class="selector-proc item"></div>
              <div class="selector-device item"></div>
              <div class="selector-signal item"></div>
              <div class="selector-dropdown"></div>
            </div>
          </div>
        </div>

        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">Signals</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="tc-container-row">
              <div class="signal-switch "></div>
              <div class="signal-indicator item"></div>
              <div class="signal-view item"></div>
              <div class="signal-examples "></div>
            </div>
          </div>
        </div>

        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">Template</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="tc-container-row">
              <div class="template-comp"></div>
            </div>
          </div>
        </div>


        <div class="edit-signal item"></div>
        <div class="modal-window"></div>
      `;
  }
  cbArrowClick(e) {
    if (e.target instanceof HTMLElement) {
      const hidden = e.target.closest('.tc-hidden-box');

      if (!hidden) {
        const el = e.target.closest('.tc-accordion-item');
        if (el.classList.contains('tc-open')) {
          el.classList.remove('tc-open');
          el.querySelector('.tc-hidden-box').classList.remove('tc-overflow-visible');
        } else {
          el.classList.add('tc-open');
          setTimeout(() => {
            el.querySelector('.tc-hidden-box').classList.add('tc-overflow-visible');
          }, 500);
        }

        var icon = el.querySelector('.tc-icon');
        if (icon.classList.contains('tc-image-arrow-up')) {
          icon.classList.remove('tc-image-arrow-up');
          icon.classList.add('tc-image-arrow-down');
        } else {
          icon.classList.add('tc-image-arrow-up');
          icon.classList.remove('tc-image-arrow-down');
        }

        var panel = el.querySelector('.tc-hidden-box');
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      }
    }
  }

  async cbOnSelectionModule(selection) {
    await this.child.selectorProc.updateSearch(selection);
    this.child.btnProcedure.procedure = this.child.selectorProc.selected;
  }

  cbOnSelectionProcedure(selection) {
    this.child.btnProcedure.procedure = selection;
  }

  cbRender() {
    this.render();
  }
}
