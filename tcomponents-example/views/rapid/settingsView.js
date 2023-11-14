import { imgTray } from '../../constants/images.js';

export default class SettingsView extends TComponents.Component_A {
  constructor(parent, module, nrParts, rows, columns, currentPart, simMachine) {
    super(parent, { options: { async: false } });
    this._module = module;
    this._nrParts = nrParts;
    this._rows = rows;
    this._columns = columns;
    this._currentPart = currentPart;
    this._simMachine = simMachine;
  }

  mapComponents() {
    return {
      numParts: new TComponents.InputVariable_A(this.find('.mt-numParts'), {
        module: this._module,
        variable: this._nrParts,
        readOnly: true,
      }),
      rows: new TComponents.VarIncrDecr_A(this.find('.mt-numRows'), {
        module: this._module,
        variable: this._rows,
      }),
      cols: new TComponents.VarIncrDecr_A(this.find('.mt-numCols'), {
        module: this._module,
        variable: this._columns,
      }),
      currentPart: new TComponents.InputVariable_A(this.find('.mt-currentPart'), {
        module: this._module,
        variable: this._currentPart,
      }),
      simMachine: new TComponents.SwitchVariable_A(this.find('.checkbox-sim'), {
        module: this._module,
        variable: this._simMachine,
      }),
      btnStart: new TComponents.RapidStartStop_A(this.find('.btn-start')),

      switchMotors: new TComponents.MotorsOnOff_A(this.find('.switch-motors'), {
        // label: 'Motor',
      }),

      radioOpMode: new TComponents.OpMode_A(this.find('.radio-opmode'), {
        // label: 'Operation mode',
      }),
    };
  }

  onRender() {
    const setup = new TComponents.LayoutInfobox_A(this.find('.setup'), {
      title: 'Setup',
      content: { children: this.find('.setup-content') },
    });
    setup.render();

    const basicControl = new TComponents.LayoutInfobox_A(this.find('#basic-control'), {
      title: 'Basic control',
      content: {
        children: [this.child.btnStart, this.child.switchMotors, this.child.radioOpMode],
        classNames: 'justify-start',
      },
    });
    basicControl.render();
  }

  markup(self) {
    return /*html*/ `
      <div id="settings-subview" class="tc-content flex-col">
        <div class="flex-col"> 

          <div class="tc-infobox">
            <div>
              <p>Machine Tending Example</p>
            </div>
            
            <div class="flex-row">

              <div class="flex-1">
                <div class="setup"></div>
                <div class="setup-content">
                  <div class="mt-numRows"></div>
                  <div class="mt-numCols"></div>
                  <div class="flex-row gap-4 items-center">
                    <p class="my-3">Number of parts on tray</p>
                    <div class="mt-numParts"></div>
                  </div>
                  <div class="flex-row gap-4 items-center">
                    <p class="my-3">Current part</p>
                    <div class="mt-currentPart"></div>
                  </div>
                  <div class="flex-row gap-4 items-center">
                    <p class="my-3">Simulate Machine</p>
                    <div class="checkbox-sim tc-item"></div>
                  </div>
                </div>
              </div>
            
              <div class="flex-1">
                <img src="${imgTray}" alt="Tray" class="tc-settingview-img" />
              </div>
            </div>
          </div>
        
          <div id="basic-control"></div>
    
          </div>
        </div>

      </div>
    `;
  }
}

SettingsView.loadCssClassFromString(/*css*/ `

.tc-settingview-img {
  width: 300px;
  height: auto;
  padding: 0px 50px;
}

`);
