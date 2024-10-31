export class CC_MotionApp extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);
  }
  defaultProps() {
    return {
      module: '',
      rtTray1: '',
      rtTray2: '',
      rtTray3: '',
      rtTray4: '',
      rtGrip: '',
      rtApproach: '',
      rtExit: ''
    };
  }
  async onInit() {
    await this.onInitUser();
  }
  async onInitUser() {
    this._tool = await API.MOTION.getTool();
    this._wobj = await API.MOTION.getWobj();
  }
  onRender() {
    this.container.classList.add('flex-col', 'justify-stretch', 'html-container');
    this.onRenderUser();
  }
  onRenderUser() {
    // Insert your code here
    this.child.btnTMCorner.setProps({
      module: this._props.module,
      robTarget: this.child.selCorner.selected
    });
    this.child.btnTMGrip.setProps({
      module: this._props.module,
      robTarget: this._props.rtGrip
    });
    this.child.btnTMAppr.setProps({
      module: this._props.module,
      robTarget: this._props.rtApproach
    });
    this.child.btnTMExit.setProps({
      module: this._props.module,
      robTarget: this._props.rtExit
    });
    this.child.selTool.setProps({
      selected: this._tool
    });
    this.child.selWobj.setProps({
      selected: this._wobj
    });
  }
  mapComponents() {
    const selCorner = new TComponents.SelectorAlias_A(this.find('#HTMLContainer__3ee4bde8-e350-417c-8178-ef82a75c7ee8_selCorner'), {
      options: {
        async: false
      },
      label: 'Select corner',
      labelPos: 'top',
      itemList: [''],
      selected: 'esTray01',
      addNoSelection: false,
      onSelection: this.cbSelectCorner.bind(this),
      itemMap: [{
        item: 'esTray01',
        alias: 'Corner 1'
      }, {
        item: 'esTray02',
        alias: 'Corner 2'
      }, {
        item: 'esTray03',
        alias: 'Corner 3'
      }, {
        item: 'esTray04',
        alias: 'Corner 4'
      }]
    });
    const btnTMCorner = new TComponents.ButtonTeachMove_A(this.find('#HTMLContainer__3ee4bde8-e350-417c-8178-ef82a75c7ee8_btnTMCorner'), {
      options: {
        async: false
      },
      label: 'Corner 1',
      labelPos: 'right',
      module: 'Ecosystem_BASE',
      robTarget: 'esTray01'
    });
    const btnAlign = new TComponents.ButtonAlign_A(this.find('#HTMLContainer__7288c689-9996-4392-9c4e-6f5c91496bac'), {
      options: {
        async: false
      },
      label: '',
      labelPos: 'top',
      onClick: null,
      icon: null,
      text: 'Align',
      tool: 'tool0',
      wobj: 'wobj0',
      coords: '',
      useCoordSelector: true,
      speed: 100
    });
    const selTool = new TComponents.SelectorVariables_A(this.find('#HTMLContainer__2d589035-3b51-45ac-b149-cba8e4d1413e_selTool'), {
      options: {
        async: false
      },
      label: 'Select tool:',
      labelPos: 'top',
      task: 'T_ROB1',
      module: '',
      isInUse: false,
      selected: '',
      addNoSelection: true,
      filter: {
        name: '',
        symbolType: '',
        dataType: 'tooldata'
      },
      onSelection: this.cbSelectTool.bind(this)
    });
    const selWobj = new TComponents.SelectorVariables_A(this.find('#HTMLContainer__2d589035-3b51-45ac-b149-cba8e4d1413e_selWobj'), {
      options: {
        async: false
      },
      label: 'Select work object:',
      labelPos: 'top',
      task: 'T_ROB1',
      module: '',
      isInUse: false,
      selected: '',
      addNoSelection: true,
      filter: {
        name: '',
        symbolType: '',
        dataType: 'wobjdata'
      },
      onSelection: this.cbSelectWobj.bind(this)
    });
    const btnTMGrip = new TComponents.ButtonTeachMove_A(this.find('#HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd_btnTMGrip'), {
      options: {
        async: false
      },
      label: 'Grip Location',
      labelPos: 'right',
      module: 'Ecosystem_BASE',
      robTarget: 'esTrayGrip'
    });
    const btnTMAppr = new TComponents.ButtonTeachMove_A(this.find('#HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd_btnTMAppr'), {
      options: {
        async: false
      },
      label: 'Approach Location',
      labelPos: 'right',
      module: 'Ecosystem_BASE',
      robTarget: 'esTrayApproach'
    });
    const btnTMExit = new TComponents.ButtonTeachMove_A(this.find('#HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd_btnTMExit'), {
      options: {
        async: false
      },
      label: 'Exit Location',
      labelPos: 'right',
      module: 'Ecosystem_BASE',
      robTarget: 'esTrayExit'
    });
    const btnExecProc = new TComponents.ButtonProcedure_A(this.find('#HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd_btnExecProc'), {
      options: {
        async: false
      },
      label: '',
      labelPos: 'top',
      onClick: null,
      icon: null,
      text: 'Test Gripping Routine',
      task: 'T_ROB1',
      procedure: 'es_testPickStrategy',
      userLevel: false,
      cycleMode: 'once',
      stopOnRelease: true
    });
    const ccMotionDisplay = new CComponents.CC_MotionDisplay(this.find('#HTMLContainer__220e2c46-a1d9-4f87-899c-cdb041322752'), {
      options: {
        async: false
      },
      label: '',
      labelPos: 'top',
      title: '',
      module: '',
      robTarget: '',
      readOnly: false
    });
    const LayoutInfobox_0 = new TComponents.LayoutInfobox_A(this.find('#HTMLContainer_app'), {
      options: {
        async: false
      },
      label: '',
      labelPos: 'top',
      title: 'Motion App',
      useBorder: true,
      content: {
        children: [this.find('#ID_663ef454-890a-42d8-a570-9b8fd74f49ee')],
        row: false,
        box: false,
        width: 'auto',
        height: 'auto',
        classNames: ['flex-col', 'justify-stretch']
      },
      transparent: true
    });
    this.find('#HTMLContainer_app').style.backgroundImage = `url('${img_ABBbackgrounds01_png}')`;
    const ret = {
      selCorner,
      btnTMCorner,
      btnAlign,
      selTool,
      selWobj,
      btnTMGrip,
      btnTMAppr,
      btnTMExit,
      btnExecProc,
      ccMotionDisplay,
      LayoutInfobox_0
    };
    return this.mapComponentsUser(ret);
  }
  mapComponentsUser(ret) {
    // Insert your code here

    return ret;
  }
  markup() {
    return /*html*/`
<div
  id="MotionApp"
  class="flex-col justify-stretch overflow-auto html-container"
>
  <div
    id="HTMLContainer_app"
    class="html-container flex-col justify-stretch overflow-auto"
    style=" background-position: center center; background-size: auto; background-repeat: no-repeat;"
  >
    <div
      id="ID_663ef454-890a-42d8-a570-9b8fd74f49ee"
      class="html-container flex-col justify-stretch overflow-auto"
    >
      <div
        id="HTMLContainer__6d888382-9077-48fc-99fd-138afefefbcd"
        class="html-container justify-stretch overflow-auto pl-4 pr-4 flex-row"
      >
        <div
          id="HTMLContainer__6630716f-9d21-41ed-9b1e-400fcf1732b5"
          class="html-container flex-col justify-stretch overflow-auto pl-4 pr-4"
        >
          <div
            id="HTMLContainer__3ee4bde8-e350-417c-8178-ef82a75c7ee8"
            class="html-container flex-col justify-stretch overflow-auto pl-0 pr-0 gap-3"
          >
            <div
              id="HTMLContainer__3ee4bde8-e350-417c-8178-ef82a75c7ee8_selCorner"
              class="flex-row justify-stretch"
            ></div>

            <div
              id="HTMLContainer__3ee4bde8-e350-417c-8178-ef82a75c7ee8_btnTMCorner"
              class="flex-row justify-stretch"
            ></div>
          </div>

          <div
            id="HTMLContainer__7288c689-9996-4392-9c4e-6f5c91496bac"
            class="html-container flex-col overflow-auto pl-0 pr-0 justify-around"
          ></div>
        </div>

        <div
          id="HTMLContainer__2d589035-3b51-45ac-b149-cba8e4d1413e"
          class="html-container flex-col justify-stretch overflow-auto pl-4 pr-4 gap-4"
        >
          <div
            id="HTMLContainer__2d589035-3b51-45ac-b149-cba8e4d1413e_selTool"
            class="flex-row justify-stretch"
          ></div>

          <div
            id="HTMLContainer__2d589035-3b51-45ac-b149-cba8e4d1413e_selWobj"
            class="flex-row justify-stretch"
          ></div>
        </div>

        <div
          id="HTMLContainer__b642cba3-275e-4638-aae5-50b735609b29"
          class="html-container flex-col justify-stretch pl-4 pr-4 flex-wrap mt-4 mb-4"
        >
          <div class="flex-row justify-stretch" style="">
            <img
              id="ImageComponent_1"
              class="tc-img"
              src="${img_traywp14400x400_png}"
              style="object-fit:fill;"
              ondragstart="return false"
            />
          </div>
        </div>
      </div>

      <div
        id="HTMLContainer__5f4a4e5a-c012-4f71-bfef-bc40029a71ed"
        class="html-container justify-stretch overflow-auto border-solid br-none bl-none bb-none flex-row"
      >
        <div
          id="HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd"
          class="html-container flex-col justify-stretch overflow-auto border-solid br-none bl-none bb-none pl-4 pt-4 pr-4"
        >
          <div
            id="HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd_btnTMGrip"
            class="flex-row justify-stretch"
          ></div>

          <div
            id="HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd_btnTMAppr"
            class="flex-row justify-stretch"
          ></div>

          <div
            id="HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd_btnTMExit"
            class="flex-row justify-stretch"
          ></div>

          <div
            id="HTMLContainer__8ca6eeb0-3e45-4800-b6fa-b7a24f86eedd_btnExecProc"
            class="flex-row justify-stretch"
          ></div>
        </div>

        <div
          id="HTMLContainer__220e2c46-a1d9-4f87-899c-cdb041322752"
          class="html-container flex-col justify-stretch overflow-auto border-solid br-none bl-none bb-none"
        ></div>
      </div>
    </div>
  </div>
</div>
`;
  }
  cbSelectCorner(item, alias) {
    // Insert your code here
    console.log('cbSelectCorner() called...', item, alias);
    this.child.btnTMCorner.setProps({
      robTarget: item,
      module: this._props.module,
      label: alias
    });
  }
  async cbSelectTool(item) {
    console.log('selected tool:', item);
    await API.MOTION.setTool(item);
  }
  async cbSelectWobj(item) {
    console.log('selected wobj:', item);
    await API.MOTION.setWobj(item);
  }
}