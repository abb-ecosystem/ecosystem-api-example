import { imgTray } from '../../constants/images.js';
import { imgPickStragety } from '../../constants/images.js';

/**
 * @typedef TrayViewProps
 * @prop {string} [name] Title of the infobox
 * @prop {string} [module] Module to find the tray robtarget variables
 * @prop {string} [tray1] Variable name of the first corner of the tray
 * @prop {string} [tray2] Variable name of the second corner of the tray
 * @prop {string} [tray3] Variable name of the third corner of the tray
 * @prop {string} [tray4] Variable name of the fourth corner of the tray
 * @prop {string} [trayGrip] Variable name of the grip position
 * @prop {string} [trayApproach] Variable name of the approach position
 * @prop {string} [trayExit] Variable name of the exit position
 */

export default class TrayView extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.locArray = [
      { item: this._props.tray1, alias: 'Corner 1' },
      { item: this._props.tray2, alias: 'Corner 2' },
      { item: this._props.tray3, alias: 'Corner 3' },
      { item: this._props.tray4, alias: 'Corner 4' },
    ];
  }

  /**
   *
   * @returns {TrayViewProps}
   */
  defaultProps() {
    return {
      name: 'Tray Configuration',
      module: null,
      tray1: null,
      tray2: null,
      tray3: null,
      tray4: null,
      trayGrip: null,
      trayApproach: null,
      trayExit: null,
    };
  }

  async onInit() {
    this._tool = await API.MOTION.getTool();
    this._wobj = await API.MOTION.getWobj();
  }

  mapComponents() {
    return {
      selectorRobTarget: new TComponents.SelectorAlias_A(this.find('.target-select'), {
        label: 'Select a corner',
        selected: this._props.tray1,
        itemMap: this.locArray,
      }),
      trayPose: new TComponents.ButtonTeachMove_A(this.find('.tray-position-1'), {
        robTarget: this._props.tray1,
        module: this._props.module,
        label: this.locArray[0].alias,
        labelPos: 'right',
      }),
      trayPoseGrip: new TComponents.ButtonTeachMove_A(this.find('.tray-position-grip'), {
        robTarget: this._props.trayGrip,
        module: this._props.module,
        label: 'Grip Location',
        labelPos: 'right',
      }),
      trayPoseApproach: new TComponents.ButtonTeachMove_A(this.find('.tray-position-approach'), {
        robTarget: this._props.trayApproach,
        module: this._props.module,
        label: 'Approach Location',
        labelPos: 'right',
      }),
      trayPoseExit: new TComponents.ButtonTeachMove_A(this.find('.tray-position-exit'), {
        robTarget: this._props.trayExit,
        module: this._props.module,
        label: 'Exit Location',
        labelPos: 'right',
      }),
      btnTestPick: new TComponents.ButtonProcedure_A(this.find('.tray-btn-test-pick'), {
        procedure: 'es_testPickStrategy',
        userLevel: false,
        text: 'test',
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
        text: 'Align tool',
        useCoordSelector: true,
      }),
    };
  }

  onRender() {
    this.cssBox(true);

    this.child.selectorRobTarget.onSelection(async (item, alias) => {
      this.child.trayPose.setProps({ variable: item, label: alias });
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
              <p>${this._props.name}</p>
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
