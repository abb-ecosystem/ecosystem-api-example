export default class Variable extends TComponents.Component_A {
  /**
   * @brief Called when an instance of this component is created.
   *
   * @param {HTMLElement} parent - DOM element in which this component is to be inserted
   */
  constructor(parent, props) {
    super(parent, props);
  }

  defaultProps() {
    return {
      module: '',
      variable: 'esNumber',
    };
  }

  async onInit() {
    try {
      this.task = await API.RAPID.getTask();
    } catch (e) {
      TComponents.Popup_A.danger('Variable view', [e.message, e.description]);
    }
  }

  mapComponents() {
    return {
      varCtrl: new TComponents.InputVariable_A(this.find('.var-ctrl'), {
        module: this._props.module,
        variable: this._props.variable,
        label: 'Righty label',
        labelPos: 'right',
        // useBorder: false,
      }),
      varInd: new TComponents.InputVariable_A(this.find('.var-ind'), {
        module: this._props.module,
        variable: this._props.variable,
        label: 'Lefty label',
        labelPos: 'left',
        // useBorder: false,
      }),
      varIncrDecrInd: new TComponents.VarIncrDecr_A(this.find('.var-incr-decr-ind'), {
        module: this._props.module,
        variable: this._props.variable,
        readOnly: false,
        label: '<div style="text-align: center">Label on the <span style="font-weight:bold">TOP</span></div>',
        labelPos: 'top',
      }),
      varIncrDecrCtrl: new TComponents.VarIncrDecr_A(this.find('.var-incr-decr-ctrl'), {
        module: this._props.module,
        variable: this._props.variable,
        readOnly: true,
        label: '<div style="color:gray;font-style:italic;font-weight:200">* This is a label on the bottom</div>',
        labelPos: 'bottom',
      }),
      toggleBtn: new TComponents.Button_A(this.find('.toggle-view'), {
        onClick: () => {
          if (this.child.toggleBtn.text === 'hide') {
            this.child.varIncrDecrCtrl.hide();
            this.child.varIncrDecrInd.hide();
            this.child.varCtrl.hide();
            this.child.varInd.hide();
            this.child.toggleBtn.text = this.child.toggleBtn.text = 'show';
          } else {
            this.child.varIncrDecrCtrl.show();
            this.child.varIncrDecrInd.show();
            this.child.varCtrl.show();
            this.child.varInd.show();
            this.child.toggleBtn.text = this.child.toggleBtn.text = 'hide';
          }
        },
        text: 'hide',
      }),
      stepsSelector: new TComponents.Dropdown_A(this.find('.steps-selector'), {
        itemList: [1, 1.2, 5, 10, 50, 100],
        selected: 1,
        label: 'steps',
      }),
      selector: new TComponents.SelectorVariables_A(this.find('.dd-menu'), {
        module: this._props.module,
      }),
      getBtn: new TComponents.Button_A(this.find('.get-btn'), {
        onClick: this.cbOnClick.bind(this),
        text: 'Get value',
      }),
      varsLayout: new TComponents.LayoutInfobox_A(this.find('.var-view-subscribe'), {
        title: 'Variable elements',
        content: { children: this.find('.var-view-subscribe-content') },
      }),
      getVarsLayout: new TComponents.LayoutInfobox_A(this.find('.get-var-view'), {
        title: 'Getting a Rapid variable value',
        content: { children: this.find('.get-var-view-content') },
      }),
    };
  }

  onRender() {
    this.swUseContainer = new FPComponents.Switch_A();
    this.swUseContainer.active = false;
    this.swUseContainer.desc = 'use border';
    this.swUseContainer.onchange = (value) => {
      if (value) {
        // this.child.varInd.setProps({ useBorder: true });
        // this.child.varCtrl.setProps({ useBorder: true });
        this.child.varIncrDecrInd.cssBox();
        this.child.varIncrDecrCtrl.css({
          border: '3px double',
          margin: '5px',
        });
      } else {
        // this.child.varInd.setProps({ useBorder: false });
        // this.child.varCtrl.setProps({ useBorder: false });
        this.child.varIncrDecrInd.cssBox(false);
        this.child.varIncrDecrCtrl.css('');
      }
    };
    this.swUseContainer.attachToElement(this.find('.use-border'));

    const cbEnable = (value) => {
      this.child.varIncrDecrCtrl.enabled = value;
      this.child.varIncrDecrInd.enabled = value;
      this.child.varInd.enabled = value;
      this.child.varCtrl.enabled = value;
    };
    // setTimeout(cbEnable.bind(this, false), 500);

    this.enComp = new FPComponents.Switch_A();
    this.enComp.active = false;
    this.enComp.desc = 'enable';
    this.enComp.onchange = cbEnable;
    this.enComp.attachToElement(this.find('.en-view'));
    this.enComp.active = true;

    // Section: Getting a Rapid variable value
    this.child.stepsSelector.onSelection((value) => {
      this.child.varIncrDecrInd.steps = value;
      this.child.varIncrDecrCtrl.steps = value;
    });

    this.child.selector.onSelection(this.cbOnSelection.bind(this));

    this.showVar = this.find('.show-var');
  }

  markup() {
    return /*html*/ `
    <div class="tc-container">
      <div class="var-view-subscribe flex-col justify-stretch">
        <div class="var-view-subscribe-content">
          <div class=" flex-row justify-stretch">

            <div class="flex-col items-center"> 
              <div class="var-ind center"></div>
              <div class="var-ctrl center"></div>
              <div class="var-incr-decr-ind center"></div>
              <div class="var-incr-decr-ctrl center"></div>
            </div>

            <div class="flex-col content-center"> 
              <div class="use-border tc-item"></div>     
              <div class="en-view tc-item"></div> 
              <div class="toggle-view tc-item"></div>
              <div class="steps-selector tc-item"></div>
            </div>

          </div>
        </div>
      </div>
      <div class="get-var-view">
        <div class="get-var-view-content">
          <p>Please select a varialbe and press the button to get its value.</p>
          <h4>Variables:</h4>
          <div class="tc-container-row">
            <div class="dd-menu tc-item dd-w-40"></div>
            <div class="get-btn tc-item"></div>
          </div>
          <div class="show-var"></div>
        </div>
      </div>  
    </div>
    `;
  }

  async cbOnClick() {
    this._variable = await this.task.getValue(this._props.module, this.child.selector.selected);

    this.showVar.innerHTML = '';
    this.showVar.appendChild(this.generateTable(this._variable));
  }

  async cbOnSelection(selection) {
    this._variable = await this.task.getValue(this._props.module, selection);
  }

  generateTable(obj) {
    const tbl = document.createElement('table');
    const tblBody = document.createElement('tbody');

    if (typeof obj !== 'object') {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      const cellContent = document.createTextNode(`${obj}`);
      cell.appendChild(cellContent);
      row.appendChild(cell);
      tblBody.appendChild(row);
    } else {
      for (const [key, val] of Object.entries(obj)) {
        const row = document.createElement('tr');
        const cellKey = document.createElement('td');
        cellKey.style.textAlign = 'left';
        cellKey.style.verticalAlign = 'top';
        const cellKeyContent = document.createTextNode(`${key} :`);
        cellKey.appendChild(cellKeyContent);
        row.appendChild(cellKey);

        const cellValue = document.createElement('td');
        let cellValueContent;
        if (typeof val === 'object') {
          cellValueContent = this.generateTable(val);
        } else {
          cellValueContent = document.createTextNode(`${val}`);
        }
        cellValue.appendChild(cellValueContent);
        row.appendChild(cellValue);

        row.style.borderBottom = '1px solid #ddd';
        tblBody.appendChild(row);
      }
    }
    tbl.appendChild(tblBody);
    tbl.style.fontSize = '0.8rem';
    return tbl;
  }
}

Variable.loadCssClassFromString(/*css*/ `

.var-view-subscribe {
  min-height: 380px;
}

`);
