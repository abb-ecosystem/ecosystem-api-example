// declare function tComponentsLoadCSS(href: string): void;

declare namespace TComponents {
  type TComponetElement = Component_A | Element | string;
  const T_COMPONENTS_BASE_VERSION: string;
  class Eventing_A {
    on(eventName: string, callback: Function): void;
    off(eventName: string, callback: Function): boolean;
    once(eventName: string, callback: Function): void;
    trigger(eventName: string, ...data: any): void;
  }

  class Base_A extends Eventing_A {
    constructor(props: object);
    protected noCheck: string[];
    protected _props: any;
    props: any;
    defaultProps(props: object): object;
    getProps(): any;
    setProps(props: object, onRender?: Function);

    static _equalProps(newProps, prevProps): boolean;
    static _splitObject(originalObject: object, includedKeysObject: object);
  }

  interface ComponentProps {
    label?: string;
    options?: object;
  }
  class Component_A extends Base_A {
    constructor(parent: HTMLElement, props?: ComponentProps);

    static _isHTMLElement(o: any): boolean;
    static _isTComponent(o: any): boolean;
    static loadCssClassFromString(css: string): void;
    static mIf(condition: boolean, markup: string, elseMarkup?: string): string;
    static mFor(array: any[], markup: Function): string;

    props: ComponentProps;

    parent: HTMLElement;

    container: HTMLElement;

    compId: string;

    protected _enabled: boolean;

    private _data: any;

    protected child: any;

    init(): object;

    render(data?: object): Component_A;
    set label(arg: string);

    get label(): string;
    set enabled(arg: boolean);

    get enabled(): boolean;

    onInit(): void;
    mapComponents(): object;
    onRender(): void;
    markup(self: Component_A): string;

    attachToElement(element: HTMLElement): void;

    // set(newProps: object): void;
    // setupProps(newProps: object, initial: object): void;

    find(selector: string): HTMLElement;

    all(selector: string): HTMLElement[];

    hide(): void;

    show(): void;

    toggle(): void;

    backgroundColor(param: string): void;

    cssBox(enable?: boolean): void;

    css(properties: string | any[]): void;

    cssAddClass(selector: string, className: string | string[], all?: boolean): void;
    cssRemoveClass(selector: string, className: string, all?: boolean): void;
  }

  interface ButtonProps extends ComponentProps {
    callback?: Function;
    icon?: string;
  }

  class Button_A extends Component_A {
    constructor(parent: HTMLElement, props?: ButtonProps);

    props: ButtonProps;

    _btn: FPComponents.Button_A;

    onInit(): void;

    onRender(): void;

    onClick(func: Function): void;

    protected cbOnClick(value): void;
  }

  interface DigitalProps extends ComponentProps {
    callback?: Function;
  }

  class Digital_A extends Component_A {
    constructor(parent: HTMLElement, props?: DigitalProps);

    props: DigitalProps;
    protected _dig: FPComponents.Digital_A;
    onInit(): void;
    onRender(): void;

    get active();
    set active(value: boolean);

    onClick(func: Function): void;

    protected cbOnClick(value): void;
  }

  interface SwitchProps extends ComponentProps {
    callback?: Function;
  }

  class Switch_A extends Component_A {
    constructor(parent: HTMLElement, props?: SwitchProps);

    props: SwitchProps;

    protected _switch: FPComponents.Switch_A;

    onInit(): void;

    onRender(): void;

    get active();
    set active(value: boolean);

    get scale();
    set scale(value: Number);

    onChange(func: Function): void;

    protected cbOnChange(value): void;
  }

  interface InputProps extends ComponentProps {
    callback?: Function;
    readOnly?: boolean;
    description?: string;
    useBorder?: boolean;
    text?: string;
  }

  class Input_A extends Component_A {
    constructor(parent: HTMLElement, props?: InputProps);

    props: InputProps;

    protected _inputField: FPComponents.Input_A;

    onInit(): void;

    onRender(): void;

    get validator(): Function;
    set validator(func: Function);

    get regex(): RegExp;
    set regex(regexp: RegExp);

    onChange(func: Function): void;

    protected cbOnChange(value): void;
  }

  interface ButtonAlignProps extends ButtonProps {
    tool?: string;
    wobj?: string;
    coords?: string;
    selector?: boolean;
  }

  class ButtonAlign_A extends Button_A {
    constructor(parent: HTMLElement, props?: ButtonAlignProps);
    onInit(): void;
    align(): Promise<void>;
    stop(): Promise<void>;
  }

  interface ButtonMoveToProps extends ButtonProps {
    variable: string;
    module: string;
    tool?: string;
    wobj?: string;
    coords?: string;
  }

  class ButtonMoveTo_A extends Button_A {
    constructor(parent: HTMLElement, props?: ButtonMoveToProps);
    onInit(): void;
    move(): Promise<void>;
    stop(): Promise<void>;
  }

  interface ButtonProcedureProps extends ButtonProps {
    procedure?: string;
    userLevel?: boolean;
    cycleMode?: string;
    stopOnRelease?: boolean;
    task?: string;
  }

  class ButtonProcedure_A extends Button_A {
    constructor(parent: any, props?: ButtonProcedureProps);

    props: ButtonProcedureProps;

    cbOnClick(): Promise<void>;

    cbStop(): Promise<void>;
    set procedure(arg: string);

    get procedure(): string;
    set userLevel(arg: boolean);

    get userLevel(): boolean;
    set task(arg: string);

    get task(): string;
  }

  interface ButtonRebootProps extends ButtonProps {
    confirm?: true;
  }

  class ButtonReboot_A extends Component_A {
    constructor(parent: HTMLElement, props?: ButtonRebootProps);

    props: ButtonRebootProps;

    reboot(): void;
  }

  interface ButtonTeachProps extends ButtonProps {
    variable: string;
    module: string;
  }

  class ButtonTeach_A extends Component_A {
    constructor(parent: HTMLElement, props?: ButtonTeachProps);

    teach(): Promise<void>;
  }

  interface ButtonTeachMoveProps extends ComponentProps {
    variable: string;
    module: string;
  }

  class ButtonTeachMove_A extends Component_A {
    constructor(parent: HTMLElement, props?: ButtonTeachMoveProps);
  }

  interface DropdownProps extends ComponentProps {
    itemList?: string[] | Number[];
    selected?: string | Number;
    addNoSelection?: boolean;
  }

  class Dropdown_A extends Component_A {
    constructor(parent: HTMLElement, props?: DropdownProps);

    onInit(): void;

    onRender(): void;

    onSelection(func: Function): void;
    get selected(): string;
    set selected(arg: string);
    get items(): string[];
    set items(arg: string[]);

    _updateItemList(itemsList: string[]): void;
  }

  interface ModalWindowProps {
    content?: Component_A | HTMLElement;
  }

  class ModalWindow_A extends Component_A {
    constructor(parent: any, props?: ModalWindowProps);

    setContent(element: Component_A | HTMLElement): void;

    triggerElements(elem: HTMLElement | any[] | NodeList, event?: string): void;

    onOpen(func: Function): void;
    onClose(func: Function): void;

    openWindow(e: Event): void;

    toggleWindow(): void;

    get isOpen(): boolean;
  }

  class MotorsOnOff_A extends Component_A {
    constructor(parent: any, props?: ComponentProps);
    setIcon(val: any): Promise<void>;
    cbSwitch(onoff: any): Promise<void>;
  }

  class OpMode_A extends Component_A {
    constructor(parent: HTMLElement, props?: ComponentProps);
    OpModeChanged(mode: any): Promise<void>;
    cbOpModeAuto(): Promise<void>;
    cbOpModeMan(): Promise<void>;
  }

  class Popup_A {
    static get OK(): string;
    static get CANCEL(): string;

    static message(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;

    static info(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;

    static warning(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;

    static danger(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;

    static error(e: object, callback?: any): void;

    static confirm(
      msg1: string,
      msg_array?: string | string[],
      callback?: (arg0: string) => void
    ): void;
  }

  interface RapidStartStopProps {
    indicator?: boolean;
  }
  class RapidStartStop_A extends Component_A {
    constructor(parent: HTMLElement, props?: RapidStartStopProps);
    cbStart(): Promise<void>;
    cbStop(): Promise<void>;
  }

  interface SignalEditProps {
    signal: string | object;
  }

  class SignalEdit_A extends Component_A {
    constructor(parent: HTMLElement, props?: string | SignalEditProps);

    onUpdate(handler: any): void;
  }

  interface SignalIndicatorProps extends DigitalProps {
    signal: string | API.SIGNAL.Signal;
    onChange?: Function;
    readOnly?: boolean;
  }

  class SignalIndicator_A extends Digital_A {
    constructor(parent: HTMLElement, props?: SignalIndicatorProps);
    props: SignalIndicatorProps;
    get signal(): void;
  }

  interface SwitchSignalProps extends ComponentProps {
    signal: string | object;
    callback?: Function;
  }

  class SwitchSignal_A extends Component_A {
    constructor(parent: HTMLElement, props?: SwitchSignalProps);
    cbUpdateSwitch(value: any): Promise<void>;
    cbOnChange(value: any): Promise<void>;
  }

  interface SignalViewProps {
    signal: string | object;
    control?: boolean;
    edit?: boolean;
  }

  class SignalView_A extends Component_A {
    constructor(parent: HTMLElement, props?: SignalViewProps);
  }

  interface ButtonVariableProps extends ButtonProps {
    variable: string;
    module: string;
    task?: string;
  }

  class ButtonVariable_A extends Button_A {
    constructor(parent: HTMLElement, props);
  }

  interface VarIncrDecrProps extends ComponentProps {
    module?: string;
    variable?: string;
    readOnly?: boolean;
    steps?: number;
  }

  class VarIncrDecr_A extends Component_A {
    constructor(parent: HTMLElement, props?: VarIncrDecrProps);
    props: VarIncrDecrProps;
    set variable(arg: string);

    get variable(): string;
    set module(arg: string);

    get module(): string;
    set steps(arg: number);

    get steps(): number;
    set readOnly(arg: boolean);

    get readOnly(): boolean;

    cbIncr(): Promise<void>;

    cbDecr(): Promise<void>;

    onChange(func: Function): void;
  }

  interface InputVariableProps extends InputProps {
    variable?: string;
    module?: string;
  }

  class InputVariable_A extends Component_A {
    constructor(parent: HTMLElement, props?: InputVariableProps);

    get variable(): string;
    set variable(arg: string);

    get module(): string;
    set module(arg: string);

    cbOnChange(value: any): Promise<void>;

    cbUpdateInputField(value: any): void;
  }

  interface SwitchVariableProps {
    variable?: string;
    module?: string;
    callback?: Function;
    label?: string;
  }

  class SwitchVariable_A extends Switch_A {
    constructor(parent: HTMLElement, props?: SwitchVariableProps);

    get variable(): string;
    set variable(arg: string);
    get module(): string;
    set module(arg: string);

    cbOnChange(value: any): Promise<void>;

    cbUpdateSwitch(value: any): void;
  }

  interface filterRapid {
    name?: string;
    symbolType?: 'constant' | 'variable' | 'persistent';
    dataType?: string;
  }

  interface ItemMap {
    item: string;
    alias: string;
  }

  interface SelectorAliasProps extends DropdownProps {
    itemMap: ItemMap[];
  }

  class SelectorAlias_A extends Dropdown_A {
    constructor(parent: HTMLElement, props?: SelectorAliasProps);
    onInit(): void;

    _updateItemMap(imap: object): void;
  }

  interface SelectorVariablesProps extends DropdownProps {
    module?: string;
    isInUse?: boolean;
    filter?: filterRapid;
  }

  class SelectorVariables_A extends Dropdown_A {
    constructor(parent: HTMLElement, props?: SelectorVariablesProps);

    updateSearch(module: string, filter?: object): Promise<void>;
  }

  interface SelectorProceduresProps extends DropdownProps {
    module?: string;
    isInUse?: boolean;
    filter?: string;
  }

  class SelectorProcedures_A extends Dropdown_A {
    constructor(parent: HTMLElement, props?: SelectorProceduresProps);

    updateSearch(module: string, filter?: string): Promise<void>;
  }

  interface SelectorModulesProps extends DropdownProps {
    isInUse?: boolean;
    filter?: string;
  }

  class SelectorModules_A extends Dropdown_A {
    constructor(parent: HTMLElement, props?: SelectorModulesProps);

    updateSearch(filter?: string): Promise<void>;
  }

  class SelectorEthernetIPDevices_A extends Dropdown_A {
    constructor(parent: HTMLElement, props?: DropdownProps);

    updateSearch(): Promise<void>;
  }

  interface filterRapid {
    name?: string;
    device?: string;
    network?: string;
    category?: string;
    type?: 'DI' | 'DO' | 'AI' | 'AO' | 'GI' | 'GO';
    invert?: boolean;
    blocked?: boolean;
  }

  interface SelectorSignalsProps extends DropdownProps {
    filter?: filterRapid;
  }

  class SelectorSignals_A extends Dropdown_A {
    constructor(parent: HTMLElement, props?: SelectorSignalsProps);

    updateSearch(filter: object): Promise<void>;
  }

  interface TemplateViewProps extends ComponentProps {
    name?: string;
  }
  class TemplateView_A extends Component_A {
    constructor(parent: HTMLElement, props?: TemplateViewProps);
    protected prop: TemplateViewProps;
    name: string;

    onInit(): void;
    mapComponents(): object;
    onRender(): void;
    markup(self: Component_A): string;
    onClick(func: Function): void;
  }

  type View = {
    name: string;
    content: TComponetElement;
    image?: string;
    active?: boolean;
    id?: string;
  };

  interface MenuProps extends ComponentProps {
    title?: string;
    onChange?: Function;
    views?: View[];
  }

  class Menu_A extends Component_A {
    constructor(parent: HTMLElement, props?: MenuProps);
    protected views: View[];
    protected viewId: Map<object, string>;
    protected _getDom(content: TComponetElement, id: string): HTMLElement;
    protected _processContent(content: TComponetElement): string;
    addView(view: View): void;
    get viewList(): View[];
    cbOnChange(oldView: View, newView: View): void;
  }

  interface HamburgerProps extends MenuProps {
    alwaysVisible?: boolean;
  }

  class Hamburger_A extends Menu_A {
    constructor(parent: HTMLElement, props?: HamburgerProps);
    get activeView(): string;
    set activeView(name: string);
  }

  interface TabContainerProps extends MenuProps {
    onPlus?: Function;
    onUserClose?: Function;
    plusEnabled?: boolean;
    hiddenTabs?: boolean;
  }

  class TabContainer_A extends Menu_A {
    constructor(parent: HTMLElement, props?: TabContainerProps);
    addTab(tab: View): void;
    removeTab(name: string): void;
    get getTabTitle(): string;
    set setTabTitle(title: string);
    get plusEnabled(): boolean;
    set plusEnabled(enabled: boolean);
    get hiddenTabs(): boolean;
    set hiddenTabs(hidden: boolean);
    get userTabClosing(): boolean;
    set userTabClosing(value: boolean);
    get activeTab(): string;
    set activeTab(name: string);
  }

  interface ContainerProps extends ComponentProps {
    children?: (Component_A | HTMLElement)[] | Component_A | HTMLElement;
    row?: boolean;
    align?: '' | 'start' | 'center' | 'end';
    box?: boolean;
    width?: string;
    height?: string;
    classNames?: string | string[];
    id?: string;
  }

  class Container_A extends Component_A {
    constructor(parent: HTMLElement, props?: ContainerProps);
    protected prop: ContainerProps;
    cssItem(index: number, className: string, remove: boolean): void;
    cssItems(className: string, remove: boolean): void;
  }

  interface LayoutInfoboxProps extends ComponentProps {
    label?: string;
    content?: ContainerProps;
  }

  class LayoutInfobox_A extends Component_A {
    constructor(parent: HTMLElement, props?: LayoutInfoboxProps);
    protected prop: LayoutInfoboxProps;
  }
}