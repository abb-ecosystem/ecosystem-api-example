import { Base_A } from './t-components-base.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

import {
  Button_A,
  ButtonAlign_A,
  ButtonMoveTo_A,
  ButtonProcedure_A,
  ButtonReboot_A,
  ButtonTeach_A,
  ButtonTeachMove_A,
  ButtonVariable_A,
} from './t-components-buttons.js';
import { Digital_A, SignalIndicator_A } from './t-components-digital.js';
import { Input_A, InputVariable_A } from './t-components-inputs.js';
import { Switch_A, SwitchSignal_A, SwitchVariable_A } from './t-components-switches.js';
import {
  Dropdown_A,
  SelectorVariables_A,
  SelectorProcedures_A,
  SelectorModules_A,
  SelectorEthernetIPDevices_A,
  SelectorSignals_A,
} from './t-components-selectors.js';
import { ModalWindow_A } from './t-components-modalwindow.js';
import { MotorsOnOff_A } from './t-components-motorsonoff.js';
import { OpMode_A } from './t-components-opmode.js';
import { RapidStartStop_A } from './t-components-rapidstartstop.js';
import { SignalView_A } from './t-components-signalview.js';
import { SignalEdit_A } from './t-components-signaledit.js';
import { TemplateView_A } from './t-components-templateview.js';
import { VarIncrDecr_A } from './t-components-varincrdecr.js';

export * from './t-components-base.js';
export * from './t-components-buttons.js';
export * from './t-components-digital.js';
export * from './t-components-inputs.js';
export * from './t-components-modalwindow.js';
export * from './t-components-motorsonoff.js';
export * from './t-components-opmode.js';
export * from './t-components-rapidstartstop.js';
export * from './t-components-selectors.js';
export * from './t-components-signaledit.js';
export * from './t-components-signalview.js';
export * from './t-components-switches.js';
export * from './t-components-templateview.js';
export * from './t-components-varincrdecr.js';
export * from './img/images.js';

const T_COMPONENTS_BASE_VERSION = '0.5';

const TComponents = {};
TComponents.version = T_COMPONENTS_BASE_VERSION;

TComponents.Base_A = Base_A;
TComponents.Component_A = Component_A;
TComponents.Popup_A = Popup_A;

TComponents.Button_A = Button_A;
TComponents.ButtonProcedure_A = ButtonProcedure_A;
TComponents.ButtonAlign_A = ButtonAlign_A;
TComponents.ButtonMoveTo_A = ButtonMoveTo_A;
TComponents.ButtonReboot_A = ButtonReboot_A;
TComponents.ButtonTeach_A = ButtonTeach_A;
TComponents.ButtonTeachMove_A = ButtonTeachMove_A;
TComponents.ButtonVariable_A = ButtonVariable_A;

TComponents.Input_A = Input_A;
TComponents.InputVariable_A = InputVariable_A;

TComponents.Switch_A = Switch_A;
TComponents.SwitchSignal_A = SwitchSignal_A;
TComponents.SwitchVariable_A = SwitchVariable_A;

TComponents.Dropdown_A = Dropdown_A;
TComponents.SelectorVariables_A = SelectorVariables_A;
TComponents.SelectorProcedures_A = SelectorProcedures_A;
TComponents.SelectorModules_A = SelectorModules_A;
TComponents.SelectorEthernetIPDevices_A = SelectorEthernetIPDevices_A;
TComponents.SelectorSignals_A = SelectorSignals_A;

TComponents.Digital_A = Digital_A;
TComponents.SignalIndicator_A = SignalIndicator_A;
TComponents.SignalEdit_A = SignalEdit_A;
TComponents.SignalView_A = SignalView_A;

TComponents.ModalWindow_A = ModalWindow_A;
TComponents.MotorsOnOff_A = MotorsOnOff_A;
TComponents.OpMode_A = OpMode_A;
TComponents.RapidStartStop_A = RapidStartStop_A;

TComponents.VarIncrDecr_A = VarIncrDecr_A;
TComponents.TemplateView_A = TemplateView_A;

if (typeof module === 'object' && !module.exports) {
  window.TComponents = TComponents;
}

export default TComponents;
