import { imgTray } from '../../constants/images.js';
import { imgPickStragety } from '../../constants/images.js';

export default class TrayView extends TComponents.Component_A {
  constructor(parent, name, module, tray1, tray2, tray3, tray4, trayGrip, trayApproach, trayExit) {
    super(parent, { options: { async: false } });
    this._module = module;
    this._tray1 = tray1;
    this._tray2 = tray2;
    this._tray3 = tray3;
    this._tray4 = tray4;
    this._trayGrip = trayGrip;
    this._trayApproach = trayApproach;
    this._trayExit = trayExit;
    this.name = name;

    this.locArray = [
      { item: this._tray1, alias: 'Corner 1' },
      { item: this._tray2, alias: 'Corner 2' },
      { item: this._tray3, alias: 'Corner 3' },
      { item: this._tray4, alias: 'Corner 4' },
    ];
  }

  async onInit() {
    this._tool = await API.MOTION.getTool();
    this._wobj = await API.MOTION.getWobj();
  }

  mapComponents() {
    return {
      selectorRobTarget: new TComponents.SelectorAlias_A(this.find('.target-select'), {
        label: 'Select a corner',
        selected: this._tray1,
        itemMap: this.locArray,
      }),
      trayPose01: new TComponents.ButtonTeachMove_A(this.find('.tray-position-1'), {
        variable: this._tray1,
        module: this._module,
        label: this.locArray[0].alias,
      }),
      trayPoseGrip: new TComponents.ButtonTeachMove_A(this.find('.tray-position-grip'), {
        variable: this._trayGrip,
        module: this._module,
        label: 'Grip Location',
      }),
      trayPoseApproach: new TComponents.ButtonTeachMove_A(this.find('.tray-position-approach'), {
        variable: this._trayApproach,
        module: this._module,
        label: 'Approach Location',
      }),
      trayPoseExit: new TComponents.ButtonTeachMove_A(this.find('.tray-position-exit'), {
        variable: this._trayExit,
        module: this._module,
        label: 'Exit Location',
      }),
      btnTestPick: new TComponents.ButtonProcedure_A(this.find('.tray-btn-test-pick'), {
        procedure: 'es_testPickStrategy',
        userLevel: false,
        label: 'test',
        stopOnRelease: true,
      }),
      selectorTool: new TComponents.SelectorVariables_A(this.find('.tool-select'), {
        label: 'Select tool',
        selected: this._tool,
        filter: { dataType: 'tooldata' },
      }),
      selectorWObj: new TComponents.SelectorVariables_A(this.find('.wobj-select'), {
        label: 'Select work object',
        selected: this._wobj,
        filter: { dataType: 'wobjdata' },
      }),
      align: new TComponents.ButtonAlign_A(this.find('.align-tool'), {
        label: 'Align tool',
        selector: true,
      }),
    };
  }

  onRender() {
    this.cssBox(true);

    this.child.selectorRobTarget.onSelection(async (item, alias) => {
      this.child.trayPose01.setProps({ variable: item, label: alias });
    });
    this.child.selectorTool.onSelection(async (value) => {
      await API.MOTION.setTool(value);
    });
    this.child.selectorWObj.onSelection(async (value) => {
      await API.MOTION.setWobj(value);
    });
  }

  markup(self) {
    return /*html*/ `
      <div>
        <div class="tray-view" class="content"></div>
        <div class="tc-row">
          <div class="tc-cols-1 tc-infobox">
            <div>
              <p>${this.name}</p>
            </div>
          </div>
        </div>
        <div class="flex-row justify-between">
          
            <div>
              <div class="target-select"></div>
              <div class="tray-position-1"></div>
              <div class="align-tool"></div>
            </div>

            <div class="flex-col">
              <div class="tool-select"></div>
              <div class="wobj-select"></div>
            </div>
            
            <img src="${imgTray}" alt="Tray" class="tc-trayview-img" />
           
        </div>
        <div class="tc-row">
          <div class="tc-cols-1 tc-infobox">
            <div>
              <p>Grip position configuration</p>
            </div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-cols-2">
            <div class="tray-position-grip"></div>
            <div class="tray-position-approach"></div>
            <div class="tray-position-exit"></div>
            <div class="tray-btn-test-pick"></div>
          </div>
          <div class="tc-cols-2">
            <div>
              <img
                src="${imgPickStragety}"
                alt="Tray"
                class="tc-trayview-img-pick-strategy"
              />
            </div>
          </div>
        </div>
      </div>
      `;
  }
}

TrayView.loadCssClassFromString(/*css*/ `

.tc-trayview-img {
  width: 250px;
  height: auto;
  padding: 0px 50px;
}

.tc-trayview-img-pick-strategy {
  width: 250px;
  height: 200px;
  padding: 0px 50px;
}

.align-tool {
  margin-top: 20px;
}

`);

// var tComponentStyle = document.createElement('style');
// tComponentStyle.innerHTML = `

// .tc-trayview-img {
//   width: 250px;
//   height: auto;
//   padding: 0px 50px;
// }

// .tc-trayview-img-pick-strategy {
//   width: 250px;
//   height: 200px;
//   padding: 0px 50px;
// }

// `;

// var ref = document.querySelector('script');
// ref.parentNode.insertBefore(tComponentStyle, ref);
