// import TComponents from '../t-components/index.js';

export default class TComponentsView extends TComponents.Component_A {
  constructor(parent, name = 'TComponents') {
    super(parent, { options: { async: false } });
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
    const editSignal = new TComponents.SignalEdit_A(this.find('.edit-signal'), {
      signal: this._signal,
    });
    const templateComp = new TComponents.TemplateView_A(this.find('.template-comp'), {
      name: 'Template Example View',
    });
    return {
      InputVariable: new TComponents.InputVariable_A(this.find('.var-input-num'), {
        module: this._module,
        variable: this._variable,
        label: 'InputVariable_A',
        useBorder: false,
      }),
      InputVariableString: new TComponents.InputVariable_A(this.find('.var-input-string'), {
        module: this._module,
        variable: this._variableString,
        label: 'InputVariable_A (string)',
      }),
      InputVariableBool: new TComponents.InputVariable_A(this.find('.var-input-bool'), {
        module: this._module,
        variable: this._variableBool,
        label: 'InputVariable_A (boolean)',
      }),
      SwitchVariable: new TComponents.SwitchVariable_A(this.find('.var-switch-bool'), {
        module: this._module,
        variable: this._variableBool,
        label: 'SwitchVariable_A',
        callback: () => {
          console.log('SwitchVariable_A changed...');
        },
      }),
      varInd: new TComponents.InputVariable_A(this.find('.var-ind'), {
        module: this._module,
        variable: this._variable,
        label: 'InputVariable_A readOnly',
        readOnly: true,
        useBorder: false,
      }),
      varIndString: new TComponents.InputVariable_A(this.find('.var-ind-string'), {
        module: this._module,
        variable: this._variableString,
        label: 'InputVariable_A readOnly (string)',
        readOnly: true,
      }),
      varIndBool: new TComponents.InputVariable_A(this.find('.var-ind-bool'), {
        module: this._module,
        variable: this._variableBool,
        label: 'InputVariable_A readOnly (boolean)',
        readOnly: true,
      }),
      varIncrDecrInd: new TComponents.VarIncrDecr_A(this.find('.var-incr-decr-readonly'), {
        module: this._module,
        variable: this._variable,
        readOnly: true,
        steps: 5,
        label: 'VarIncrDecr_A (readonly)',
      }),
      varIncrDecrInput: new TComponents.VarIncrDecr_A(this.find('.var-incr-decr-input'), {
        module: this._module,
        variable: this._variable,
        readOnly: false,
        steps: 1,
        label: 'VarIncrDecr_A',
      }),
      // dropDownMenu: new FPComponents.Dropdown_A(),
      btnRender: new TComponents.Button_A(this.find('.btns-all'), {
        callback: this.cbRender.bind(this),
        label: 'Button_A - Render',
      }),
      varButton: new TComponents.ButtonVariable_A(this.find('.btns-all'), {
        module: this._module,
        variable: this._variable,
        callback: async function (value) {
          console.log(`tComponentsView: ButtonVariable_A : `);

          const valueString = value.toString();

          TComponents.Popup_A.message('I am a Message window', [
            `Variable ${this._variable} changed`,
            '\n',
            ` ${this._variable} = ${value}`,
          ]);
          TComponents.Popup_A.info('I am a Information window', [
            `Variable ${this._variable} equals:`,
            '\n',
            ` ${this._variable} = ${value}`,
          ]);
          TComponents.Popup_A.warning('I am a Warning window', [
            `Variable ${this._variable} equals:`,
            '\n',
            ` ${this._variable} = ${value}`,
          ]);
          TComponents.Popup_A.danger('I am a Error window', [
            `Variable ${this._variable} equals:`,
            '\n',
            ` ${this._variable} = ${value}`,
          ]);
          TComponents.Popup_A.confirm('I am a Confirm window', [
            `Variable ${this._variable} equals:`,
            '\n',
            ` ${this._variable} = ${value}`,
          ]);
        }.bind(this),
        label: 'Call variable and popups',
      }),
      btnProcedure: new TComponents.ButtonProcedure_A(this.find('.btns-all'), {
        procedure: 'es_Procedure_01',
        userLevel: true,
        label: 'Execute procedure',
      }),
      align: new TComponents.ButtonAlign_A(this.find('.btns-move'), {
        label: 'Align',
      }),
      teach: new TComponents.ButtonTeach_A(this.find('.btns-move'), {
        variable: 'esTarget02',
        module: 'Ecosystem_BASE',
        label: 'ButtonTeach_A',
      }),
      move: new TComponents.ButtonMoveTo_A(this.find('.btns-move'), {
        variable: 'esTarget02',
        module: 'Ecosystem_BASE',
        label: 'ButtonMoveTo_A',
      }),
      teachMove: new TComponents.ButtonTeachMove_A(this.find('.btns-move'), {
        variable: 'esTarget02',
        module: 'Ecosystem_BASE',
        label: 'ButtonTeachMove_A',
      }),
      selectorVar: new TComponents.SelectorVariables_A(this.find('.selectors-all'), {
        module: 'Ecosystem_BASE',
        isInUse: true,
        label: 'SelectorVariables_A',
        addNoSelection: false,
      }),
      selectorModule: new TComponents.SelectorModules_A(this.find('.selectors-all'), {
        isInUse: false,
        label: 'SelectorModules_A',
        addNoSelection: false,
      }),
      selectorProc: new TComponents.SelectorProcedures_A(this.find('.selectors-all'), {
        module: 'Ecosystem_BASE',
        isInUse: false,
        label: 'SelectorProcedures_A',
        addNoSelection: false,
      }),
      selectorDevice: new TComponents.SelectorEthernetIPDevices_A(this.find('.selectors-all'), {
        label: 'SelectorEthernetIPDevices_A',
      }),
      selectorSignal: new TComponents.SelectorSignals_A(this.find('.selectors-all'), {
        filter: { name: 'di_', category: 'EcoSystem' },
        selected: 'di_part_clamped',
        label: 'SelectorSignals_A',
      }),
      signalIndicator: new TComponents.SignalIndicator_A(this.find('.signal-indicator'), {
        signal: this._signal,
        readOnly: false,
        label: 'DI Is Gripper Closed',
        onChange: (value) => {
          console.log(`SignalIndicator callback onChange called -- value ${value}`);
        },
      }),
      signalView: new TComponents.SignalView_A(this.find('.signal-view'), {
        signal: this._signal,
        control: true,
        // edit: true,
      }),
      switch: new TComponents.SwitchSignal_A(this.find('.signal-switch'), {
        signal: this._signal,
        label: 'DI Is Gripper Closed',
      }),
      editSignal: editSignal,
      modalWindow: new TComponents.ModalWindow_A(this.find('.modal-window'), {
        content: templateComp,
      }),
      modalWindowSignal: new TComponents.ModalWindow_A(this.find('.modal-window'), {
        content: editSignal,
      }),
      btnTrigger: new TComponents.Button_A(this.find('.btns-all'), {
        label: 'trigger modal window',
      }),
      templateComp: templateComp,
      btnStart: new TComponents.RapidStartStop_A(this.find('.controls-all'), { indicator: false }),

      switchMotors: new TComponents.MotorsOnOff_A(this.find('.controls-all'), {
        // label: 'Motor',
      }),

      radioOpMode: new TComponents.OpMode_A(this.find('.controls-all'), {
        // label: 'Operation mode',
      }),
    };
  }

  onRender() {
    this.child.InputVariable.onChange((value) => {
      console.log(`InputVariable called - value ${value}`);
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

    this.child.modalWindowSignal.triggerElements(this.child.signalView.getEditButton());
    this.child.modalWindow.triggerElements(this.child.btnTrigger.container);

    this.child.btnRender.highlight = true;

    // Accordion
    const sections = this.all('.tc-accordion-item');
    sections.map((section) => {
      section.addEventListener('click', this.cbArrowClick.bind(this));
    });

    // console.log('😎😎😎 - TComponentsView finished rendering...');
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
            <div class="flex-row gap-4  items-center btns-move">
            </div>
          </div>
        </div>

        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">RAPID Buttons</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="flex-row gap-4 btns-all"></div>
          </div>
        </div>

        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">Selectors</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="flex-row gap-4 selectors-all"></div>
          </div>
        </div>

        <div class="tc-accordion-item">
          <p class="tc-accordion-info-text">Controls</p>  
          <div class="tc-image-arrow-down tc-icon"></div>        
          <div class="tc-hidden-box">
            <div class="flex-row gap-4 controls-all"></div>
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

        <div class="edit-signal item"></div>
        <div class="modal-window"></div>
        <div class="template-comp"></div>
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
    const v = this.child.varInd.variable;
    this.child.varInd.variable = v === this._variable ? this._variableString : this._variable;
  }
}
