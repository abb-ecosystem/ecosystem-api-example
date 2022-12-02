// declare function tComponentsLoadCSS(href: string): void;

declare namespace TComponents {
  // class Component_A {
  //   constructor(container: HTMLElement);
  //   init(): Promise<void>;
  //   render(render: boolean): void | string;
  //   markup(self: Component_A): string;
  //   set enabled(en: boolean);
  //   attachToId(nodeId): void;
  //   attachToElement(element): void;
  //   hideView(): void;
  //   showView(): void;
  //   toggleView(): void;
  //   backgroundColor(color: string): void;
  //   useContainer(enable: boolean): void;
  //   applyCss(properties: string | object): void;
  // }
  class Eventing_A {
    /**
     * Subscribe to an event
     * @alias on
     * @memberof TComponents.Eventing_A
     * @param {string} eventName - name of the triggering event
     * @param {function} callback -function to be called when event is triggered
     */
    on(eventName: string, callback: Function): void;
    /**
     * Triggers all callback fuction that have subscribe to an event
     * @alias trigger
     * @memberof TComponents.Eventing_A
     * @param {string} eventName - Name of the event to be triggered
     * @param {any} data - Data passed to the callback as input parameter
     */
    trigger(eventName: string, data?: any): void;
  }

  /**
   * Creates an instance of TComponents.Component class.
   * This is the base parent class of all TComponent.
   * @class TComponents.Component_A
   * @memberof TComponents
   * @extends  {TComponents.Eventing_A}
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component.
   * @param {string} [label] - Label text
   */
  class Component_A extends TComponents.Eventing_A {
    /**
     * Creates an instance of TComponents.Component class.
     * This is the base parent class of all TComponent.
     * @constructor
     * @memberof TComponents
     * @extends TComponents.Eventing_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component.
     * @param {string} [label] - Label text
     */
    constructor(container: HTMLElement, label?: string);

    /**
     * Check if an entry is
     * @alias _isHTMLElement
     * @memberof TComponents.Component_A
     * @static
     * @param {any} o
     * @returns {boolean} true if entry is an HTMLElement, false otherwise
     */
    static _isHTMLElement(o: any): boolean;

    /**
     * @protected
     */
    protected container: HTMLElement;
    /**
     * @protected
     */
    protected _compId: string;
    /**
     * @protected
     */
    protected _label: string;
    /**
     * @protected
     */
    protected _enabled: boolean;
    /**
     * @protected
     */
    protected child: any;
    /**
     * Initialization of a component. Any asynchronous operaiton (like access to controller) is done here.
     * @async
     * @returns {TComponents} The instance on which this method was called.
     */
    init(): object;
    /**
     * Update the content of the instance into the Document Object Model (DOM).
     * @async
     * @param {object} [data] data - Data that can be passed to the component, which may be required for the rendering process.
     * @returns {TComponents} The instance on which this method was called.
     */
    render(data?: object): object;
    set label(arg: string);
    /**
     * Component label text
     * @alias label
     * @type {string}
     * @memberof TComponents.Component_A
     */
    get label(): string;
    set enabled(arg: boolean);
    /**
     * Enables or disables any FPComponent component (see Omnicore App SDK) d within the component as an own property (e.g. this.btn = new FPComponent()).
     * @alias enabled
     * @type {boolean}
     * @memberof TComponents.Component_A
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    get enabled(): boolean;
    /**
     * Changes the DOM element in which this component is to be inserted.
     * @alias attachToElement
     * @memberof TComponents.Component_A
     * @param {HTMLElement} element - Container DOM element
     */
    attachToElement(element: HTMLElement): void;
    /**
     * Returns the first Element within the component that matches the specified selector. If no matches are found, null is returned.
     * @alias find
     * @memberof TComponents.Component_A
     * @param {string} selector - A string containing one selector to match. This string must be a valid CSS selector string
     * @returns {HTMLElement} An Element object representing the first element wthin the component that matches the specified set of CSS selectors, or null is returned if there are no matches.
     */
    find(selector: string): HTMLElement;
    /**
     * Returns an Array representing the component's elemenst that matches the specified selector. If no matches are found, an empty Array is returned.
     * @alias all
     * @memberof TComponents.Component_A
     * @param {string} selector - A string containing one selector to match. This string must be a valid CSS selector string
     * @returns {HTMLElement[]} An Array of Elements that matches the specified CSS selector, or empty array is returned if there are no matches.
     */
    all(selector: string): HTMLElement[];
    /**
     * Chages visibility of the component to not show it in the view.
     * @alias hide
     * @memberof TComponents.Component_A
     */
    hide(): void;
    /**
     * Changes visibility of the component to show it in the view.
     * @alias show
     * @memberof TComponents.Component_A
     */
    show(): void;
    /**
     * Toggles visibility of component. Shows it when hidden, hides it when shown
     * @alias toggle
     * @memberof TComponents.Component_A
     */
    toggle(): void;
    /**
     * Changes the background color of the component
     * @alias backgroundColor
     * @memberof TComponents.Component_A
     * @param {string} param - Parameter: There are four parameter accepted by backgroundColor property: "color|transparent|initial|inherit"
     *                            color: This property holds the background color.
     *                            transparent: By default the background color is transparent.
     *                            initial: Set this property to it’s default
     *                            inherit: Inherits the property from it’s parent element
     */
    backgroundColor(param: string): void;
    /**
     * Changes apperance of the component (border and background color) to frame it or not.
     * @alias cssContainer
     * @memberof TComponents.Component_A
     * @param {boolean} enable - if true, the component is framed, if false, not frame is shown
     */
    cssContainer(enable?: boolean): void;
    /**
     * Changes the position of the label
     * @alias cssLabelAside
     * @memberof TComponents.Component_A
     * @param {*} enable - if true, the labels appears at the left side, otherwise on the top-left corner
     */
    cssLabelAside(enable?: any): void;
    /**
     * Sets or returns the contents of a style declaration as a string.
     * @alias css
     * @memberof TComponents.Component_A
     * @param {string|Array} properties - Specifies the content of a style declaration.
     * E.g.: "background-color:pink;font-size:55px;border:2px dashed green;color:white;"
     */
    css(properties: string | any[]): void;
  }

  /**
   * Rounded button that triggers a callback when pressed. Additional callbacks can be added with the {@link TComponents.Button_A#onClick|onClick} method.
   * @class TComponents.Button_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {function|null} [callback] - Function to be called when button is pressed
   * @param {string} [label] - Label of the component
   * @param {string|null} [img] - Path to image file
   * @example
   *        const btnExecute = new TComponents.Button_A(
   *          document.querySelector('.btn-render'),
   *          () => { console.log('execute')},
   *          'Execute'
   *        )
   */
  class Button_A extends TComponents.Component_A {
    /**
     *
     * @constructor
     * @extends {TComponents.Component_A}
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {function|null} [callback] - Function to be called when button is pressed
     * @param {string} [label] - Label of the component
     * @param {string|null} [img] - Path to image file
     */
    constructor(
      container: HTMLElement,
      callback?: Function | null,
      label?: string,
      img?: string | null
    );
  }

  // class Button_A extends Component_A {
  //   handler: () => {};
  //   label: string;
  //   img: string | null;
  //   constructor(container: HTMLElement, handler: () => {}, label: string, img: string | null);
  //   init(): Promise<void>;
  //   render(): void;
  //   markup(self: Button_A): string;
  //   get text(): string;
  //   set text(t: string);
  // }

  /**
   * Button to jog the robot to a position provided by a RAPID robtarget variable.
   * @class TComponents.ButtonMoveTo_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} rapid_variable - Rapid variable to subpscribe to
   * @param {string} module - Module containig the rapid variable
   * @param {string} [label] - label text
   * @example
   *
   * const btnMove = new TComponents.ButtonMoveTo_A(
   *    document.querySelector('.btn-move'),
   *    'esTarget02',
   *    'Ecosystem_BASE',
   *    'move to'
   *  );
   *  await btnMove.render();
   */
  class ButtonMoveTo_A extends TComponents.Component_A {
    /**
     * @constructor
     * @extends {TComponents.Component_A}
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} rapid_variable - Rapid variable to subpscribe to
     * @param {string} module - Module containig the rapid variable
     * @param {string} [label] - label text
     */
    constructor(container: HTMLElement, rapid_variable: string, module: string, label?: string);
    /**
     * Jogs the robot to the position defined at rapid_variable
     * @alias move
     * @memberof TComponents.ButtonMoveTo_A
     * @async
     */
    move(): Promise<void>;
    /**
     * Stops jogging
     * @alias stop
     * @memberof TComponents.ButtonMoveTo_A
     * @async
     */
    stop(): Promise<void>;
  }

  /**
   * Button for procedure execution. The behaviour depends on stopOnRelease value  (default=false).
   * When stopOnRelease equals false, then the procedure is started after press and release of the button.
   * Wehn stopOnRelease equals true, then the procedure is started when pressing, and stopped when releasing the button.
   * @class TComponents.ButtonProcedure_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} [procedure] - Procedure to be called
   * @param {Boolean} [userLevel] - if true, execution level is set to “user level”, i.e. execute as a service routine.
   * In this case "motor on" is not required in procedures that no motion is executed.
   * @param {string} [label] - label text
   * @param {boolean} [stopOnRelease]
   * @param {string} [task]
   * @example
   * btnProcedure: new TComponents.ButtonProcedure_A(
   *   document.querySelector('.my-class'),
   *   '',
   *   true,
   *   'Execute'
   * ),
   */
  class ButtonProcedure_A extends TComponents.Component_A {
    constructor(
      container: any,
      procedure?: string,
      userLevel?: boolean,
      label?: string,
      stopOnRelease?: boolean,
      task?: string
    );
    /**
     * Excecutes a procedure when button is pressed. The behaviour depends on the constructor stopOnRelease (default=false).
     * When stopOnRelease equals false, then the procedure is started after press and release of the button.
     * Wehn stopOnRelease equals true, then the procedure is started when pressing, and stopped when releasing the button.
     * @alias cbOnClick
     * @memberof TComponents.ButtonProcedure_A
     * @async
     *
     */
    cbOnClick(): Promise<void>;
    /**
     * Stops running procedure
     * @alias cbOnClick
     * @memberof TComponents.ButtonProcedure_A
     * @async
     *
     */
    cbStop(): Promise<void>;
    set procedure(arg: string);
    /**
     * Procedure to be executed
     * @alias procedure
     * @type {string}
     * @memberof TComponents.ButtonProcedure_A
     */
    get procedure(): string;
    set userLevel(arg: boolean);
    /**
     * If true, the procedure is executed as service routine, therefore, motor on is not required
     * If false, the procedure is executed
     * @alias userLevel
     * @type {boolean}
     * @memberof TComponents.ButtonProcedure_A
     */
    get userLevel(): boolean;
    set task(arg: string);
    /**
     * Task containing the procedure (default value "T_ROB1").
     * @alias task
     * @type {string}
     * @memberof TComponents.ButtonProcedure_A
     */
    get task(): string;
  }

  /**
   * Button to restart the controller.
   * @class TComponents.ButtonReboot_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @example
   * const btnReboot = new TComponents.ButtonReboot_A(document.querySelector('.reboot-view'));
   * btnRebbot.render();
   */
  class ButtonReboot_A extends TComponents.Component_A {
    constructor(container: any);
    /**
     * Restarts the controller
     * @alias reboot
     * @memberof TComponents.ButtonReboot_A
     *
     */
    reboot(): void;
  }

  /**
   * Button to teach the current position into a RAPID robtarget variable
   * @class TComponents.ButtonTeach_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container
   * @param {string} rapid_variable - Rapid variable to subpscribe to
   * @param {string} module - Module containig the rapid variable
   * @param {string} [label] - label text
   * @example
   *
   * const btnTeach = new TComponents.ButtonTeach_A(
   *    document.querySelector('.btn-teach'),
   *    'esTarget02',
   *    'Ecosystem_BASE',
   *    'teach'
   *  );
   *  await btnTeach.render();
   */
  class ButtonTeach_A extends TComponents.Component_A {
    /**
     * @constructor
     * @extends TComponents.Component_A
     * @param {HTMLElement} container
     * @param {string} rapid_variable - Rapid variable to subpscribe to
     * @param {string} module - Module containig the rapid variable
     * @param {string} [label] - label text
     */
    constructor(container: HTMLElement, rapid_variable: string, module: string, label?: string);
    /**
     * Saves the current robot position in to rapid_variable. This method is called when pressing the instance button.
     * @alias teach
     * @memberof TComponents.ButtonTeach_A
     * @async
     */
    teach(): Promise<void>;
  }

  /**
   * Component that combine {@link TComponents.ButtonTeach_A} and {@link TComponents.ButtonMoveTo_A} together.
   * @class TComponents.ButtonTeachMove_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container
   * @param {string} rapid_variable - Rapid variable to subpscribe to
   * @param {string} module - Module containig the rapid variable
   * @param {string} [label] - label text
   * @example
   *
   * const btnTeach = new TComponents.ButtonTeachMove_A(
   *    document.querySelector('.btn-teach'),
   *    'esTarget02',
   *    'Ecosystem_BASE',
   *    'teach'
   *  );
   *  await btnTeach.render();
   */
  class ButtonTeachMove_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container
     * @param {string} rapid_variable - Rapid variable to subpscribe to
     * @param {string} module - Module containig the rapid variable
     * @param {string} [label] - label text
     */
    constructor(container: HTMLElement, location: any, module: string, label?: string);
  }

  /**
   * @class TComponents.Dropdown_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} [itemList] - List of dropdown items
   * @param {string} [selected] - item that shall be shown as selected after first render
   * @param {string} [label] - label text
   * @example
   * const ddMenu = new TComponents.Dropdown_A(
   *    document.querySelector('.comp2-dd-menu'),
   *    ['a', 'b', 'c'],
   *    'b',
   *    'ABC'
   * );
   * ddMenu.render();
   */
  class Dropdown_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string[]} [itemList] - List of dropdown items
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     */
    constructor(container: HTMLElement, itemList?: string[], selected?: string, label?: string);
    /**
     * Adds a callback function to be called when an item is selected
     * @alias onSelection
     * @memberof TComponents.Dropdown_A
     * @param {function} func
     * @todo Currently only one function is possible. Change the method to accept multiple callbacks
     */
    onSelection(func: Function): void;
    set selected(arg: string);
    /**
     * Selected item
     * @alias selected
     * @type {string}
     * @memberof TComponents.Dropdown_A
     */
    get selected(): string;
    set items(arg: string);
    /**
     * Array of all possible items
     * @alias items
     * @type {string}
     * @memberof TComponents.Dropdown_A
     */
    get items(): string;
  }

  // class Dropdown_A extends Component_A {
  //   constructor(container: HTMLElement, itemList?: string[], selected?: string, label?: string);
  //   init(): Promise<void>;
  //   render(): void;
  //   markup({ label: string }: Dropdown_A): string;
  //   onChange(index: number, selection: string): void;
  //   addCallbackOnSelection(func: () => {}): void;
  //   get selected(): string;
  //   set selected(value: string);
  // }

  /**
   *
   * @class TComponents.ModalWindow_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {TComponents.Component_A | HTMLElement | null} [content] - Component/Element to be displayed in the modal window
   * @example
   * const editSignal = new TComponents.SignalEdit_A(
   *   document.querySelector('.edit-signal'),
   *   'di_signal'
   * );
   * const modalWindow =  new TComponents.ModalWindow_A(
   *   document.querySelector('.modal-window'),
   *   editSignal
   * );
   * const btnTrigger = new TComponents.Button_A(
   *   document.querySelector('.modal-trigger'),
   *   null,
   *   'trigger'
   * );
   * @see TComponents.SignalEdit_A
   * @see TComponents.SignalView_A
   */
  class ModalWindow_A extends TComponents.Component_A {
    constructor(container: any, content?: any);
    /**
     * Adds a callback funciton to the component. This will be called after the button is pressed and released
     * @alias onClick
     * @memberof TComponents.ModalWindow_A
     * @param {TComponents.Component_A | HTMLElement}  element    The callback function which is called when the button is pressed
     */
    setContent(element: TComponents.Component_A | HTMLElement): void;
    /**
     * Adds openWindow method as event listener of event (default: 'click') to the given elements.
     * @alias triggerElements
     * @memberof TComponents.ModalWindow_A
     * @param {HTMLElement | Array | NodeList } elem - Element(s) where the event listener is to be added
     * @param {string} [event] -  Event used to trigger the openWindow method
     */
    triggerElements(elem: HTMLElement | any[] | NodeList, event?: string): void;
    /**
     * Registar a function to be called before the window is openned
     * @alias onOpen
     * @memberof TComponents.ModalWindow_A
     * @param {function} func
     */
    onOpen(func: Function): void;
    /**
     * Opens the modal window. All event listener callbacks function called when a trigger element dipatch the registered event
     * @alias openWindow
     * @memberof TComponents.ModalWindow_A
     * @param {Event} e - object based on Event describing the event that has occurred
     * @see TComponents.ModalWindow_A.triggerElements
     */
    openWindow(e: Event): void;
    /**
     * Toggles visibility of modal window.
     * Different than openWindow method, this method does not trigger any event nor load any data to the content element when oppening.
     * @alias toggleWindow
     * @memberof TComponents.ModalWindow_A
     */
    toggleWindow(): void;
  }

  /**
   * Called when an instance of this component is created.
   * @class TComponents.MotorsOnOff_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @example
   * const switchMotors = new TComponents.MotorsOnOff_A(document.querySelector('.switch-motors')),
   */
  class MotorsOnOff_A extends TComponents.Component_A {
    constructor(container: any, label?: string);
    setIcon(val: any): Promise<void>;
    cbSwitch(onoff: any): Promise<void>;
  }

  /**
   * Called when an instance of this component is created.
   * @class TComponents.OpMode_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @example
   * const opMode = new TComponents.OpMode_A(document.querySelector('.radio-opmode')),
   */
  class OpMode_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     */
    constructor(container: HTMLElement);
    OpModeChanged(mode: any): Promise<void>;
    cbOpModeAuto(): Promise<void>;
    cbOpModeMan(): Promise<void>;
  }

  /**
   * @class TComponents.Popup_A
   */
  class Popup_A {
    /**
     * 'ok'
     * @alias OK
     * @type {string}
     * @memberof TComponents.Popup_A
     * @static
     */
    static get OK(): string;
    /**
     * 'cancel'
     * @alias CANCEL
     * @type {string}
     * @memberof TComponents.Popup_A
     * @static
     */
    static get CANCEL(): string;
    /**
     * A popup dialog is a modal window that provides the user with information messages.
     * @alias message
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     * @example
     * TComponents.Popup_A.message(
     *   "Important message!",
     *   [
     *     "For your information, this is a popup dialog.",
     *     "",
     *     "Further information can be given here!"
     *   ],
     *  function (action) {
     *    console.log("OK button was clicked")
     *  });
     */
    static message(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;
    /**
     * A popup dialog is a modal window that provides the user with information messages.
     * The main difference with TComponents.Popup_A.message is that TComponents.Popup_A.info includes a "i" image in the modal window.
     * @alias info
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     * @example
     * TComponents.Popup_A.info(
     *   "Important information!",
     *   [
     *     "For your information, this is a popup dialog.",
     *     "",
     *     "Further information can be given here!"
     *   ],
     *  function (action) {
     *    console.log("OK button was clicked")
     *  });
     */
    static info(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;
    /**
     * A popup dialog is a modal window that provides the user with warning messages.
     * @alias warning
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     *  try {
     *    // do something
     *  } catch (e) {
     *    TComponents.Popup_A.waring('Something went wrong', [e.message, e.description]);
     *  }
     */
    static warning(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;
    /**
     * A popup dialog is a modal window that provides the user with error messages.
     * @alias danger
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     * @example
     *  try {
     *    // do something
     *  } catch (e) {
     *    TComponents.Popup_A.danger('Something went wrong', [e.message, e.description]);
     *  }
     */
    static danger(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;
    /**
     * A popup dialog is a modal window that provides the user with error messages.
     * @alias error
     * @memberof TComponents.Popup_A
     * @param {object} e - Error object thrown by Omnicore RWS
     *
     * @example
     *  try {
     *    throw new Error("Whoops!");
     *  } catch (e) {
     *    TComponents.Popup_A.error(e);
     *  };
     * @todo Optimize the parsing of error object
     */
    static error(e: object, callback?: any): void;
    /**
     * TA popup dialog is a modal window that provides "OK/Cancel" confirmation dialog.
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     * @example
     * TComponents.Popup_A.confirm(
     *   `${moduleName} module not yet loaded on the controller`,
     *   ['This module is required for this WebApp.', 'Do you want to load the module?'],
     *   if (action === TComponents.Popup_A.OK) {
     *     console.log("Load the module here...")
     *   } else if (action == FPComponents.Popup_A.CANCEL) {
     *     console.log("Abort mission!");
     *   }
     * );
     */
    static confirm(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;
  }

  class RapidStartStop_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     */
    constructor(container: HTMLElement);
    cbStart(): Promise<void>;
    cbStop(): Promise<void>;
  }

  /**
   * Signal editor (normaly used together with the {@link TComponents.ModalWindow_A} and {@link TComponents.SignalView_A} components)
   * @class TComponents.SignalEdit_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
   * @example
   * const signal = new TComponents.SignalView_A(
   *    document.querySelector('.signal-container'),
   *    'signal_name',
   *    true, //hasSwitch
   *    true //hasEditButton
   *  );
   *  await signal.render();
   *
   * const editSignal = new TComponents.SignalEdit_A(
   *   document.querySelector('.edit-signal'),
   *   'di_signal'
   * );
   *
   * // Modal window will contain the signal editor
   * const modalWindow =  new TComponents.ModalWindow_A(
   *   document.querySelector('.modal-window'),
   *   editSignal
   * );
   * await modalWindow.render();
   *
   * // In order to connect the signal to the modal window
   * // this is automatically forwarded to the signal editor
   * modalWindow.triggerElements(signal.getEditButton())
   * @see TComponents.SignalView_A
   * @see TComponents.ModalWindow_A
   */
  class SignalEdit_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
     */
    constructor(container: HTMLElement, signal?: string | object);
    onUpdate(handler: any): void;
  }

  /**
   * @class TComponents.SignalIndicator_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} signal
   * @param {string} [label] - label text
   */
  class SignalIndicator_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} signal
     * @param {string} [label] - label text
     */
    constructor(container: HTMLElement, signal: string, label?: string);
    get signal(): void;
  }

  /**
   * Creates an instance of a switch connected to a signal
   * @class TComponents.SignalSwitch_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
   * @param {*} label
   */
  class SignalSwitch_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
     * @param {string} label
     */
    constructor(container: HTMLElement, signal: string | object, label?: string);
    cbUpdateSwitch(value: any): Promise<void>;
    cbOnChange(value: any): Promise<void>;
    active(value?: boolean): void;
    set scale(arg: any);
  }

  /**
   * Instance of a Signal view containing an indicator, signal information (name, type, device, map) and a optional connection to TComponents.SignalEdit_A component for editing the signal.
   * @class TComponents.SignalView_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
   * @param {boolean} hasSwitch - To enable/disable the precense of a swith
   * @param {boolean} hasEditButton - To enable/disable the editing button
   * @example
   * const signal = new TComponents.SignalView_A(
   *    document.querySelector('.signal-container'),
   *    'signal_name',
   *    true, //hasSwitch
   *    true //hasEditButton
   *  );
   *  await signal.render();
   *
   * const editSignal = new TComponents.SignalEdit_A(
   *   document.querySelector('.edit-signal'),
   *   'di_signal'
   * );
   *
   * // Modal window will contain the signal editor
   * const modalWindow =  new TComponents.ModalWindow_A(
   *   document.querySelector('.modal-window'),
   *   editSignal
   * );
   * await modalWindow.render();
   *
   * // In order to connect the signal to the modal window
   * // this is automatically forwarded to the signal editor
   * modalWindow.triggerElements(signal.getEditButton())
   * @see TComponents.SignalEdit_A
   */
  class SignalView_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
     * @param {boolean} hasSwitch - To enable/disable the precense of a swith
     * @param {boolean} hasEditButton - To enable/disable the editing button
     */
    constructor(
      container: HTMLElement,
      signal: string | object,
      hasSwitch?: boolean,
      hasEditButton?: boolean
    );
  }

  /**
   * Creates a button that triggers registered callback functions and pass them the value of a RAPID variable
   * @class TComponents.VarButton_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @param {string} module - RAPID module containig the variable
   * @param {string} variable - RAPID variable
   * @param {function} [callback] Callback function
   * @param {string} [label] - Label text
   * @param {string} [img] - Path to image file
   * @param {string} [task] - RAPID Task in which the variable is contained (default = "T_ROB1" )
   * @example
   * const upButton = await new TComponents.VarButton_A(
   *    document.querySelector('#button-moveUp'),
   *    'Wizard',
   *    'UpLimit',
   *    async function (value) {
   *      Set_Pos(value);
   *    },
   *    'Up'
   *  ).render();
   */
  class VarButton_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string} module - RAPID module containig the variable
     * @param {string} variable - RAPID variable
     * @param {function} [callback] Callback function
     * @param {string} [label] - Label text
     * @param {string} [img] - Path to image file
     * @param {string} [task] - RAPID Task in which the variable is contained (default = "T_ROB1" )
     */
    constructor(
      container: HTMLElement,
      module: string,
      variable: string,
      callback?: Function,
      label?: string,
      img?: string,
      task?: string
    );
    /**
     * Adds a callback to be called when the button is pressed. Multiple callbacks can be registered by calling this method multiple times.
     * @alias onClick
     * @memberof TComponents.VarButton_A
     * @param   {function}  callback    The callback function which is called when the button is pressed
     */
    onClick(callback: Function): void;
  }

  /**
   * Component connected to a variable together with increment and decrement buttons.
   * @class TComponents.VarIncrDecr_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @param {string} [module] - module to seach for variables
   * @param {string} [variable] - Rapid variable to subpscribe to
   * @param {boolean} [readOnly] - if true, variable value is displayed and can only be modified with the increment and decrement buttons. If false, the value can also be directly modified
   * @param {number} [steps] - Increments/decrements steps applied at a button click (default = 1)
   * @param {string} [label] - label text
   */
  class VarIncrDecr_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string} [module] - module to seach for variables
     * @param {string} [variable] - Rapid variable to subpscribe to
     * @param {boolean} [readOnly] - if true, variable value is displayed and can only be modified with the increment and decrement buttons. If false, the value can also be directly modified
     * @param {number} [steps] - Increments/decrements steps applied at a button click (default = 1)
     * @param {string} [label] - label text
     */
    constructor(
      container: HTMLElement,
      module?: string,
      variable?: string,
      readOnly?: boolean,
      steps?: number,
      label?: string
    );
    set variable(arg: string);
    /**
     * RAPID variable
     * @alias variable
     * @type {string}
     * @memberof TComponents.VarIncrDecr_A
     */
    get variable(): string;
    set module(arg: string);
    /**
     * RAPID module
     * @alias module
     * @type {string}
     * @memberof TComponents.VarIncrDecr_A
     */
    get module(): string;
    set steps(arg: number);
    /**
     * Increments/decrements steps applied at a button click (default = 1)
     * @alias steps
     * @type {number}
     * @memberof TComponents.VarIncrDecr_A
     */
    get steps(): number;
    set readOnly(arg: boolean);
    /**
     * If true value can only be modified with the increment/decrement buttons. If false, the value can be directly modified by the user by clicking on it.
     * @alias readOnly
     * @type {boolean}
     * @memberof TComponents.VarIncrDecr_A
     */
    get readOnly(): boolean;
    /**
     * Callback function to update variable when increment button is clicked
     * @alias cbIncr
     * @memberof TComponents.VarIncrDecr_A
     * @async
     *
     */
    cbIncr(): Promise<void>;
    /**
     * Callback function to update variable when decrement button is clicked
     * @alias cbDecr
     * @memberof TComponents.VarIncrDecr_A
     * @async
     *
     */
    cbDecr(): Promise<void>;
    /**
     * Adds a callback function that will be called when the RAPID variable value changes
     * @alias onChange
     * @memberof TComponents.VarIncrDecr_A
     * @param {function} func
     */
    onChange(func: Function): void;
  }

  // class VarIncrDecr_A extends Component_A {
  //   readonly steps: number;
  //   readonly _label: string;
  //   constructor(
  //     container: HTMLElement,
  //     module?: string,
  //     variable?: string,
  //     isInput?: boolean,
  //     label?: string,
  //   );
  //   init(): Promise<void>;
  //   render(): void;
  //   markup({ _label }: VarIncrDecr_A): string;
  //   get variable(): string;
  //   set variable(text: string);
  //   get module(): string;
  //   set module(text: string);
  //   get isInput(): boolean;
  //   set isInput(is: boolean);
  //   get label(): string;
  //   set label(text: string);
  //   cbIncr(): Promise<void>;
  //   cbDecr(): Promise<void>;
  // }

  /**
   * Display field connected to a RAPID variable. It supports variables of type "num", "bool" and "strings".
   * @class TComponents.VarIndicator_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @param {string} [module] - module to seach for variables
   * @param {string} [variable] - Rapid variable to subpscribe to
   * @param {string} [label] - label text
   * @param {boolean} [useIndicatorBorder] - if true, creates a border around the value
   * @todo add restriction to association to not supported variables, liek robtarget
   */
  class VarIndicator_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string} [module] - module to seach for variables
     * @param {string} [variable] - Rapid variable to subpscribe to
     * @param {string} [label] - label text
     * @param {boolean} [useIndicatorBorder] - if true, creates a border around the value
     */
    constructor(
      container: HTMLElement,
      module?: string,
      variable?: string,
      label?: string,
      useIndicatorBorder?: boolean
    );
    set variable(arg: string);
    /**
     * RAPID variable
     * @alias variable
     * @type {string}
     * @memberof TComponents.VarIndicator_A
     */
    get variable(): string;
    set module(arg: string);
    /**
     * RAPID module
     * @alias module
     * @type {string}
     * @memberof TComponents.VarIndicator_A
     */
    get module(): string;
    /**
     * Callback function to update input field when variable changes
     * @alias cbUpdateInputField
     * @memberof TComponents.VarIndicator_A
     * @async
     *
     */
    cbVarChanged(value: any): void;
    /**
     * Adds a callback function that will be called when the RAPID variable value changes
     * @alias onChange
     * @memberof TComponents.VarIndicator_A
     * @param {function} func
     */
    onChange(func: Function): void;
    /**
     * if true, displays a border around the variable value, otherwise no border is displayed
     * @alias useIndicatorBorder
     * @memberof TComponents.VarIndicator_A
     * @async
     */
    useIndicatorBorder(value?: boolean): void;
  }

  // class VarIndicator_A extends Component_A {
  //   readonly _id: string;
  //   readonly _label: string;
  //   readonly task: any;
  //   readonly varElement: any;
  //   readonly _varValue: number;
  //   constructor(container: HTMLElement, module?: string, variable?: string, label?: string);
  //   init(): Promise<void>;
  //   render(): void;
  //   markup({ _label, _id, _varValue }: VarIndicator_A): string;
  //   get variable(): string;
  //   set variable(text: string);
  //   get module(): string;
  //   set module(text: string);
  //   get label(): string;
  //   set label(text: string);
  // }

  /**
   * Input field connected to a RAPID variable
   * @class TComponents.VarInput_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @param {string} [module] - module to seach for variables
   * @param {string} [variable] - Rapid variable to subpscribe to
   * @param {string} [label] - label text
   */
  class VarInput_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string} [module] - module to seach for variables
     * @param {string} [variable] - Rapid variable to subpscribe to
     * @param {string} [label] - label text
     */
    constructor(container: HTMLElement, module?: string, variable?: string, label?: string);
    set variable(arg: string);
    /**
     * RAPID variable
     * @alias variable
     * @type {string}
     * @memberof TComponents.VarInput_A
     */
    get variable(): string;
    set module(arg: string);
    /**
     * RAPID module
     * @alias module
     * @type {string}
     * @memberof TComponents.VarInput_A
     */
    get module(): string;
    /**
     * Callback function to update variable when input field state changes
     * @alias cbOnChange
     * @memberof TComponents.VarInput_A
     * @async
     *
     */
    cbOnChange(value: any): Promise<void>;
    /**
     * Callback function to update input field when variable changes
     * @alias cbUpdateInputField
     * @memberof TComponents.VarInput_A
     * @async
     *
     */
    cbUpdateInputField(value: any): void;
    /**
     * Adds a callback function that will be called when the RAPID variable value changes
     * @alias onChange
     * @memberof TComponents.VarInput_A
     * @param {function} func
     */
    onChange(func: Function): void;
  }

  // class VarInput_A extends Component_A {
  //   readonly inputField: FPComponents.Input_A;
  //   readonly task: any;
  //   readonly varElement: any;
  //   constructor(container: HTMLElement, module?: string, variable?: string, label?: string);
  //   init(): Promise<void>;
  //   render(): void;
  //   markup(self: VarInput_A): string;
  //   get variable(): string;
  //   set variable(text: string);
  //   get module(): string;
  //   set module(text: string);
  //   get label(): string;
  //   set label(text: string);
  //   cbOnChange(value): Promise<void>;
  //   cbOnChanged(value): void;
  // }

  /**
   * Switch connected to a RAPID variable. The variable must be of type boolean, otherwise an Error is thrown during initialization.
   * @class TComponents.VarSwitch_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   * @param {string} [module] - module to seach for variables
   * @param {string} [variable] - Rapid variable to subpscribe to
   * @param {string} [label] - label text
   */
  class VarSwitch_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string} [module] - module to seach for variables
     * @param {string} [variable] - Rapid variable to subpscribe to
     * @param {string} [label] - label text
     */
    constructor(container: HTMLElement, module?: string, variable?: string, label?: string);
    set variable(arg: string);
    /**
     * RAPID variable
     * @alias variable
     * @type {string}
     * @memberof TComponents.VarSwitch_A
     */
    get variable(): string;
    set module(arg: string);
    /**
     * RAPID module
     * @alias module
     * @type {string}
     * @memberof TComponents.VarSwitch_A
     */
    get module(): string;
    /**
     * Callback function to update variable when switch state changes
     * @alias cbOnChange
     * @memberof TComponents.VarSwitch_A
     * @async
     *
     */
    cbOnChange(value: any): Promise<void>;
    /**
     * Callback function to update switch when variable changes
     * @alias cbUpdateSwitch
     * @memberof TComponents.VarSwitch_A
     * @async
     *
     */
    cbUpdateSwitch(value: any): void;
  }

  // class ProcButton_A extends Component_A {
  //   constructor(
  //     container: HTMLElement,
  //     procedure?: string,
  //     isServiceRoutine?: false,
  //     label?: string,
  //     task?: string,
  //   );
  //   init(): Promise<void>;
  //   render(): void;
  //   markup(self: ProcButton_A): string;
  //   cbOnClick(): Promise<void>;
  //   get procedure(): string;
  //   set procedure(text: string);
  //   get isServiceRoutine(): boolean;
  //   set isServiceRoutine(is: boolean);
  //   get label(): string;
  //   set label(text: string);
  //   get task(): string;
  //   set task(text: string);
  // }

  /**
   * Base class used by the different TComponents selectors:
   * @class TComponents.Selector_A
   * @extends TComponents.Component_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} [selected] - item that shall be shown as selected after first render
   * @param {string} [label] - label text
   * @param {string[]} [itemList]
   * @todo Apply filter to the item list
   * @see TComponents.SelectorVariables_A
   * @see TComponents.SelectorProcedures_A
   * @see TComponents.SelectorModules_A
   * @see TComponents.SelectorEthernetIPDevices_A
   * @see TComponents.SelectorSignals_A
   */
  class Selector_A extends TComponents.Component_A {
    /**
     * @constructor
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {string[]} [itemList]
     */
    constructor(container: HTMLElement, selected?: string, label?: string, itemList?: string[]);
    cbOnSelection(selection: any): Promise<void>;
    set selected(arg: string);
    /**
     * Selected item
     * @alias selected
     * @type {string}
     * @memberof TComponents.Selector_A
     */
    get selected(): string;
    /**
     * List of items
     * @alias items
     * @type {string[]}
     * @memberof TComponents.Selector_A
     */
    get items(): string[];
    /**
     * Add a callback on selection
     * @alias onSelection
     * @param {function} func - callback function
     * @memberof TComponents.Selector_A
     */
    onSelection(func: Function): void;
    /**
     * Update list of items
     * @param {string[]} itemsList - list of paramenters
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     * @protected
     */
    _updateItemList(itemsList: string[], addNoSelection?: boolean): void;
  }

  /**
   * Selector displaying variables available inside a module at the controller
   * @class TComponents.SelectorVariables_A
   * @extends TComponents.Selector_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} module - module to seach for variables
   * @param {boolean} [isInUse] - only return symbols that are used in a Rapid program, i.e. a type declaration that has no d variable will not be returned when this flag is set true.
   * @param {string} [selected] - item that shall be shown as selected after first render
   * @param {string} [label] - label text
   * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
   * @example
   *  const selectorVar = new TComponents.SelectorVariables_A(
   *     document.querySelector('.selector-var'),
   *     'Ecosystem_BASE',
   *     true,
   *     '',
   *     'Select a variable:'
   *   );
   * @todo Apply filter to the item list
   */
  class SelectorVariables_A extends TComponents.Selector_A {
    /**
     * @constructor
     * @extends TComponents.Selector_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} module - module to seach for variables
     * @param {boolean} [isInUse] - only return symbols that are used in a Rapid program, i.e. a type declaration that has no d variable will not be returned when this flag is set true.
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     */
    constructor(
      container: HTMLElement,
      module?: string,
      isInUse?: boolean,
      selected?: string,
      label?: string,
      addNoSelection?: boolean
    );
    /**
     * Updates the content of selector based on {@link module} parameter
     * @alias updateSearch
     * @param {string} module - Module to search for procedures
     * @memberof TComponents.SelectorVariables_A
     */
    updateSearch(module: string, render?: boolean): Promise<void>;
  }

  /**
   * Selector displaying procedures available inside a module at the controller
   * @class TComponents.SelectorProcedures_A
   * @extends TComponents.Selector_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} module - module to search for procedures
   * @param {boolean} isInUse - only return symbols that are used in a Rapid program, i.e. a type declaration that has no d variable will not be returned when this flag is set true.
   * @param {string} [selected] - item that shall be shown as selected after first render
   * @param {string} [label] - label text
   * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
   * @example
   *  const procSelector = new TComponents.SelectorProcedures_A(
   *     document.querySelector('.proc-dropdown'),
   *     'Ecosystem_BASE',
   *     false,
   *     '',
   *     'Select a procedure:'
   *   );
   *
   * @todo Apply filter to the item list
   */
  class SelectorProcedures_A extends TComponents.Selector_A {
    /**
     * @constructor
     * @extends TComponents.Selector_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} module - module to search for procedures
     * @param {boolean} isInUse - only return symbols that are used in a Rapid program, i.e. a type declaration that has no d variable will not be returned when this flag is set true.
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     */
    constructor(
      container: HTMLElement,
      module?: string,
      isInUse?: boolean,
      selected?: string,
      label?: string,
      addNoSelection?: boolean
    );
    /**
     * Updates the content of selector based on {@link module} parameter
     * @alias updateSearch
     * @param {string} module - Module to search for procedures
     * @memberof TComponents.SelectorProcedures_A
     */
    updateSearch(module: string): Promise<void>;
  }

  /**
   * Selector displaying modules available at the controller
   * @class TComponents.SelectorModules_A
   * @extends TComponents.Selector_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {boolean} isInUse - only return symbols that are used in a Rapid program, i.e. a type declaration that has no d variable will not be returned when this flag is set true.
   * @param {string} [selected] - item that shall be shown as selected after first render
   * @param {string} [label] - label text
   * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
   * @example
   * const modSelector = new TComponents.SelectorModules_A(
   *    document.querySelector('.module-dropdown'),
   *    false,
   *    '',
   *    'Select a module:'
   *  );
   * @todo Apply filter to the item list
   */
  class SelectorModules_A extends TComponents.Selector_A {
    /**
     * @constructor
     * @extends TComponents.Selector_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {boolean} isInUse - only return symbols that are used in a Rapid program, i.e. a type declaration that has no d variable will not be returned when this flag is set true.
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     */
    constructor(
      container: HTMLElement,
      isInUse?: boolean,
      selected?: string,
      label?: string,
      addNoSelection?: boolean
    );
    /**
     * Updates the content of selector based available modules
     * @alias updateSearch
     * @memberof TComponents.SelectorModules_A
     */
    updateSearch(): Promise<void>;
  }

  /**
   * Selector displaying Ethernet/IP devices available at the controller
   * @class TComponents.SelectorEthernetIPDevices_A
   * @extends TComponents.Selector_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} [selected] - item that shall be shown as selected after first render
   * @param {string} [label] - label text
   * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
   * @example
   *  const selectorDevice = new TComponents.SelectorEthernetIPDevices_A(
   *     document.querySelector('.selector-device'),
   *     '',
   *     'Select a device:'
   *   );
   * @todo Apply filter to the item list
   */
  class SelectorEthernetIPDevices_A extends TComponents.Selector_A {
    /**
     * @constructor
     * @extends TComponents.Selector_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     */
    constructor(
      container: HTMLElement,
      selected?: string,
      label?: string,
      addNoSelection?: boolean
    );
    /**
     * Updates the content of selector based available Ethernet/IP devices
     * @alias updateSearch
     * @memberof TComponents.SelectorEthernetIPDevices_A
     */
    updateSearch(): Promise<void>;
  }

  /**
   * Selector displaying modules available at the controller
   * @class TComponents.SelectorSignals_A
   * @extends TComponents.Selector_A
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {object} filter - An object with filter information:
   * <br>&emsp;(string) name signal name
   * <br>&emsp;(string) device device name
   * <br>&emsp;(string) network network name
   * <br>&emsp;(string) category category string
   * <br>&emsp;(string) type type of signal, valid values: 'DI', 'DO', 'AI', 'AO', 'GI' or 'GO'
   * <br>&emsp;(boolean) invert inverted signals
   * <br>&emsp;(boolean) blocked blocked signals
   * @param {string} [selected] - item that shall be shown as selected after first render
   * @param {string} [label] - label text
   * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
   * @example
   * const signalSelector = new TComponents.SelectorSignals_A(
   *   document.querySelector('.signal-dropdown'),
   *   { name: 'di_', category: 'EcoSystem' },
   *   'di_is_gripper_opened',
   *   'Select a signal:'
   * )
   */
  class SelectorSignals_A extends TComponents.Selector_A {
    /**
     * @ckonstructor
     * @extends TComponents.Selector_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {object} filter - An object with filter information:
     * <br>&emsp;(string) name signal name
     * <br>&emsp;(string) device device name
     * <br>&emsp;(string) network network name
     * <br>&emsp;(string) category category string
     * <br>&emsp;(string) type type of signal, valid values: 'DI', 'DO', 'AI', 'AO', 'GI' or 'GO'
     * <br>&emsp;(boolean) invert inverted signals
     * <br>&emsp;(boolean) blocked blocked signals
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     */
    constructor(
      container: HTMLElement,
      filter?: object,
      selected?: string,
      label?: string,
      addNoSelection?: boolean
    );
    /**
     * Updates the content of selector based on {@link filter} parameter
     * @alias updateSearch
     * @memberof TComponents.SelectorSignals_A
     * @param   {object}  filter - An object with filter information:
     * (string) name signal name
     * (string) device device name
     * (string) network network name
     * (string) category category string
     * (string) type type of signal, valid values: 'DI', 'DO', 'AI', 'AO', 'GI' or 'GO'
     * (boolean) invert inverted signals
     * (boolean) blocked blocked signals
     */
    updateSearch(filter: object): Promise<void>;
  }

  //   class Selector_A extends Component_A {
  //     readonly _label: string;
  //     readonly _selected: string;
  //     constructor(container: HTMLElement, label?: string);
  //     render(): void;
  //     markup(self: Selector_A): string;
  //     cbOnSelection(selection: string): Promise<void>;
  //     get selected(): string;
  //     set selected(value: string);
  //     get items(): string[];
  //     get label(): string;
  //     set label(text: string);
  //     addCallbackOnSelection(func: (selected: string) => void): void;
  //   }

  //   class SelectorVariables_A extends Selector_A {
  //     module: string;
  //     isInUse: boolean;
  //     constructor(
  //       container: HTMLElement,
  //       module?: string | null,
  //       isInUse?: boolean,
  //       selected?: string,
  //       label?: string,
  //     );
  //     init(): Promise<void>;
  //     updateSearch(module: string): Promise<void>;
  //   }

  //   class SelectorProcedures_A extends Selector_A {
  //     module: string;
  //     isInUse: boolean;
  //     constructor(
  //       container: HTMLElement,
  //       module: string | null,
  //       isInUse: boolean,
  //       selected?: string,
  //       label?: string,
  //     );
  //     init(): Promise<void>;
  //     updateSearch(module: string): Promise<void>;
  //   }

  //   class SelectorModules_A extends Selector_A {
  //     isInUse: boolean;
  //     constructor(container: HTMLElement, isInUse?: boolean, selected?: string, label?: string);
  //     init(): Promise<void>;
  //   }

  //   class SelectorEthernetIPDevices_A extends Selector_A {
  //     constructor(container: HTMLElement, selected?: string, label?: string);
  //     init(): Promise<void>;
  //     updateSearch(): Promise<void>;
  //   }

  class TemplateView_A extends TComponents.Component_A {
    /**
     * @constructor
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string} [name] - Example of pasing a prop to the component
     */
    constructor(container: HTMLElement, name?: string);
    name: string;
    /**
     * Contains component specific asynchronous implementation (like access to controller).
     * This method is called internally during initialization process orchestrated by {@link init() init}.
     * @alias onInit
     * @memberof TComponents.TemplateView_A
     * @async
     */
    onInit(): void;
    /**
     * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
     * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
     * @alias mapComponents
     * @memberof TComponents.TemplateView_A
     * @returns {object} Contains all child TComponents instances used within the component.
     */
    mapComponents(): object;
    /**
     * Contains component specific asynchronous implementation (like access to controller).
     * This method is called internally during initialization process orchestrated by {@link init() init}.
     * @alias onRender
     * @memberof TComponents.TemplateView_A
     */
    onRender(): void;
    /**
     * Generates the HTML definition corresponding to the component.
     * @alias markup
     * @memberof TComponents.TemplateView_A
     * @param {TComponents.Component_A} self - The instance on which this method was called.
     * @returns {string}
     */
    markup(self: TComponents.Component_A): string;
  }

  //   class SelectorSignals_A extends Selector_A {
  //     constructor(container: HTMLElement, filter: object, selected?: string, label?: string);
  //     init(): Promise<void>;
  //     updateSearch(filter: object): Promise<void>;
  //   }
}
