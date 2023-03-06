// import TComponents from '../t-components/index.js';
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
  }

  async onInit() {}

  mapComponents() {
    return {
      trayPose01: new TComponents.ButtonTeachMove_A(this.find('.tray-position-1'), {
        variable: this._tray1,
        module: this._module,
        label: 'Location 1',
      }),
      trayPose02: new TComponents.ButtonTeachMove_A(this.find('.tray-position-2'), {
        variable: this._tray2,
        module: this._module,
        label: 'Location 2',
      }),
      trayPose03: new TComponents.ButtonTeachMove_A(this.find('.tray-position-3'), {
        variable: this._tray3,
        module: this._module,
        label: 'Location 3',
      }),
      trayPose04: new TComponents.ButtonTeachMove_A(this.find('.tray-position-4'), {
        variable: this._tray4,
        module: this._module,
        label: 'Location 4',
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
    };
  }

  onRender() {
    this.cssContainer(true);
    // console.log('😎😎😎 - TrayView finished rendering...');
  }

  markup(self) {
    return `
      <div>
        <div class="tray-view" class="content"></div>
        <div class="tc-row">
          <div class="tc-cols-1 tc-infobox">
            <div>
              <p>${this.name}</p>
            </div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-cols-2">
            <div class="tray-position-1"></div>
            <div class="tray-position-2"></div>
            <div class="tray-position-3"></div>
            <div class="tray-position-4"></div>
          </div>
          <div class="tc-cols-2">
            <div>
              <img src="${imgTray}" alt="Tray" class="tc-trayview-img" />
            </div>
          </div>
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

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

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

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);