export class CC_MotionDisplay extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);
    this._intervalId = null;
  }
  defaultProps() {
    return {
      title: "Title",
      module: "",
      robTarget: "",
      readOnly: false,
    };
  }
  async onInit() {
    if (this._intervalId !== null) clearInterval(this._intervalId);
    this._intervalId = setInterval(this.update.bind(this), 500);
  }
  onRender() {
    this.container.classList.add(
      "flex-col",
      "justify-stretch",
      "html-container"
    );
  }

  mapComponents() {
    const Input_X = new TComponents.Input_A(
      this.find("#ID_5e21b521-ad22-4282-b963-68098748d1a5_Input_X"),
      {
        options: {
          async: false,
        },
        label: "X",
        labelPos: "left",
        onChange: null,
        readOnly: false,
        description: "",
        useBorder: true,
        transparent: false,
        bold: false,
        text: "",
      }
    );
    const Input_Y = new TComponents.Input_A(
      this.find("#ID_5e21b521-ad22-4282-b963-68098748d1a5_Input_Y"),
      {
        options: {
          async: false,
        },
        label: "Y",
        labelPos: "left",
        onChange: null,
        readOnly: false,
        description: "",
        useBorder: true,
        transparent: false,
        bold: false,
        text: "",
      }
    );
    const Input_Z = new TComponents.Input_A(
      this.find("#ID_5e21b521-ad22-4282-b963-68098748d1a5_Input_Z"),
      {
        options: {
          async: false,
        },
        label: "Z",
        labelPos: "left",
        onChange: null,
        readOnly: false,
        description: "",
        useBorder: true,
        transparent: false,
        bold: false,
        text: "",
      }
    );
    const Fieldset_132 = new TComponents.Fieldset_A(
      this.find("#ID_e80c3199-8b43-4524-a17c-d161fae35835_Fieldset_132"),
      {
        options: {
          async: false,
        },
        label: "",
        labelPos: "top",
        title: "Translation",
        content: {
          children: [this.find("#ID_5e21b521-ad22-4282-b963-68098748d1a5")],
          row: false,
          box: false,
          width: "auto",
          height: "auto",
          classNames: ["flex-col", "justify-stretch"],
        },
      }
    );
    const Input_Q1 = new TComponents.Input_A(
      this.find("#ID_f6d93a0a-8517-4a21-944f-3ecd83938a68_Input_Q1"),
      {
        options: {
          async: false,
        },
        label: "Q1",
        labelPos: "left",
        onChange: null,
        readOnly: false,
        description: "",
        useBorder: true,
        transparent: false,
        bold: false,
        text: "",
      }
    );
    const Input_Q2 = new TComponents.Input_A(
      this.find("#ID_f6d93a0a-8517-4a21-944f-3ecd83938a68_Input_Q2"),
      {
        options: {
          async: false,
        },
        label: "Q2",
        labelPos: "left",
        onChange: null,
        readOnly: false,
        description: "",
        useBorder: true,
        transparent: false,
        bold: false,
        text: "",
      }
    );
    const Input_Q3 = new TComponents.Input_A(
      this.find("#ID_f6d93a0a-8517-4a21-944f-3ecd83938a68_Input_Q3"),
      {
        options: {
          async: false,
        },
        label: "Q3",
        labelPos: "left",
        onChange: null,
        readOnly: false,
        description: "",
        useBorder: true,
        transparent: false,
        bold: false,
        text: "",
      }
    );
    const Input_Q4 = new TComponents.Input_A(
      this.find("#ID_f6d93a0a-8517-4a21-944f-3ecd83938a68_Input_Q4"),
      {
        options: {
          async: false,
        },
        label: "Q4",
        labelPos: "left",
        onChange: null,
        readOnly: false,
        description: "",
        useBorder: true,
        transparent: false,
        bold: false,
        text: "",
      }
    );
    const Fieldset_136 = new TComponents.Fieldset_A(
      this.find("#ID_e80c3199-8b43-4524-a17c-d161fae35835_Fieldset_136"),
      {
        options: {
          async: false,
        },
        label: "",
        labelPos: "top",
        title: "Orientation",
        content: {
          children: [this.find("#ID_f6d93a0a-8517-4a21-944f-3ecd83938a68")],
          row: false,
          box: false,
          width: "auto",
          height: "auto",
          classNames: ["flex-col", "justify-stretch"],
        },
      }
    );
    const LayoutInfobox_135 = new TComponents.LayoutInfobox_A(
      this.find("#container_77972cad-c347-44af-b2ca-7fc63c3f6b96"),
      {
        options: {
          async: false,
        },
        label: "",
        labelPos: "top",
        title: "",
        useBorder: true,
        content: {
          children: [this.find("#ID_e80c3199-8b43-4524-a17c-d161fae35835")],
          row: false,
          box: false,
          width: "auto",
          height: "auto",
          classNames: ["flex-col", "justify-stretch"],
        },
        transparent: true,
      }
    );
    return {
      Input_X,
      Input_Y,
      Input_Z,
      Fieldset_132,
      Input_Q1,
      Input_Q2,
      Input_Q3,
      Input_Q4,
      Fieldset_136,
      LayoutInfobox_135,
    };
  }
  markup() {
    return /*html*/ `
<div
  id="MotionDisplay"
  class="flex-col justify-stretch overflow-auto html-container"
>
  <div
    id="container_77972cad-c347-44af-b2ca-7fc63c3f6b96"
    class="html-container justify-stretch flex-wrap flex-row"
  >
    <div
      id="ID_e80c3199-8b43-4524-a17c-d161fae35835"
      class="html-container flex-row justify-stretch overflow-auto"
    >
      <div class="flex-row justify-stretch grow-0">
        <div
          id=""
          style="color:#000000;background-color:transparent;font-size:16px;font-style:normal;font-family:Segoe UI, Verdana, sans-serif;font-weight:bold;line-height:1.5;letter-spacing:normal;text-align:left;text-decoration:none;word-wrap:break-word;display:inline-block;padding-top:0;padding-right:0;padding-bottom:4px;padding-left:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;"
        >
          ${lang.t(this._props.title)}
        </div>
      </div>
      <div
        id="ID_e80c3199-8b43-4524-a17c-d161fae35835_Fieldset_132"
        class="flex-row justify-stretch"
      ></div>

      <div
        id="ID_5e21b521-ad22-4282-b963-68098748d1a5"
        class="html-container flex-col justify-stretch overflow-auto"
      >
        <div
          id="ID_5e21b521-ad22-4282-b963-68098748d1a5_Input_X"
          class="flex-row justify-stretch"
        ></div>

        <div
          id="ID_5e21b521-ad22-4282-b963-68098748d1a5_Input_Y"
          class="flex-row justify-stretch"
        ></div>

        <div
          id="ID_5e21b521-ad22-4282-b963-68098748d1a5_Input_Z"
          class="flex-row justify-stretch"
        ></div>
      </div>

      <div
        id="ID_e80c3199-8b43-4524-a17c-d161fae35835_Fieldset_136"
        class="flex-row justify-stretch"
      ></div>

      <div
        id="ID_f6d93a0a-8517-4a21-944f-3ecd83938a68"
        class="html-container flex-col justify-stretch overflow-auto"
      >
        <div
          id="ID_f6d93a0a-8517-4a21-944f-3ecd83938a68_Input_Q1"
          class="flex-row justify-stretch"
        ></div>

        <div
          id="ID_f6d93a0a-8517-4a21-944f-3ecd83938a68_Input_Q2"
          class="flex-row justify-stretch"
        ></div>

        <div
          id="ID_f6d93a0a-8517-4a21-944f-3ecd83938a68_Input_Q3"
          class="flex-row justify-stretch"
        ></div>

        <div
          id="ID_f6d93a0a-8517-4a21-944f-3ecd83938a68_Input_Q4"
          class="flex-row justify-stretch"
        ></div>
      </div>
    </div>
  </div>
</div>
`;
  }
  async update() {
    if (this._props.robTarget) {
      await this.getRobotTargetPosition();
    } else {
      await this.getCurrentPosition();
    }
  }
  async getCurrentPosition() {
    try {
      var _value = await API.RWS.MOTIONSYSTEM.getRobTarget(
        "tool0",
        "wobj0",
        "",
        "ROB_1"
      );
      this.child.Input_X.text = Math.round(_value.trans.x * 100) / 100;
      this.child.Input_Y.text = Math.round(_value.trans.y * 100) / 100;
      this.child.Input_Z.text = Math.round(_value.trans.z * 100) / 100;
      this.child.Input_Q1.text = Math.round(_value.rot.q1 * 100) / 100;
      this.child.Input_Q2.text = Math.round(_value.rot.q2 * 100) / 100;
      this.child.Input_Q3.text = Math.round(_value.rot.q3 * 100) / 100;
      this.child.Input_Q4.text = Math.round(_value.rot.q4 * 100) / 100;
    } catch (e) {
      console.error(e);
    }
  }
  async getRobotTargetPosition() {
    var data = await API.RAPID.getVariable(
      "T_ROB1",
      this._props.module,
      this._props.robTarget,
      ""
    );
    if (!data) return;
    var _value = await data.getValue();
    this.child.Input_X.text = Math.round(_value.trans.x * 100) / 100;
    this.child.Input_Y.text = Math.round(_value.trans.y * 100) / 100;
    this.child.Input_Z.text = Math.round(_value.trans.z * 100) / 100;
    this.child.Input_Q1.text = Math.round(_value.rot.q1 * 100) / 100;
    this.child.Input_Q2.text = Math.round(_value.rot.q2 * 100) / 100;
    this.child.Input_Q3.text = Math.round(_value.rot.q3 * 100) / 100;
    this.child.Input_Q4.text = Math.round(_value.rot.q4 * 100) / 100;
    console.log(_value);
  }
}
