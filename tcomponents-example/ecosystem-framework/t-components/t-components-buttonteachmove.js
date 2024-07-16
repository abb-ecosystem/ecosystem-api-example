import { Component_A } from './t-components-component.js';
import { ButtonMoveTo_A } from './t-components-buttonmoveto.js';
import { ButtonTeach_A } from './t-components-buttonteach.js';

/**
 * @typedef TComponents.ButtonTeachMoveProps
 * @prop {string} robTarget Rapid robTarget to subpscribe to
 * @prop {string} module - Module containig the rapid variable
 * @prop {string} [label] Label text
 * @prop {string} [labelPos] Label position (top, bottom, left, right)
 */

/**
 * Component that combine {@link TComponents.ButtonTeach_A} and {@link TComponents.ButtonMoveTo_A} together.
 * @class TComponents.ButtonTeachMove_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent
 * @param {TComponents.ButtonTeachMoveProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-teach-move"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnTeach = new ButtonTeachMove_A(
 *    document.querySelector('.btn-teach-move'), {
 *     robTarget: 'esTarget02',
 *     module: 'Ecosystem_BASE',
 *    }
 *  );
 *  await btnTeach.render();
 */
export class ButtonTeachMove_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonTeachMoveProps}
     */
    this._props;

    this._isJogging = false;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonTeachMove_A
   * @returns {TComponents.ButtonTeachMoveProps}
   */
  defaultProps() {
    return {
      module: '',
      robTarget: '',
    };
  }

  mapComponents() {
    return {
      _btnMoveTo: new ButtonMoveTo_A(this.find('.tc-button-teachmove-move'), {
        robTarget: this._props.robTarget,
        module: this._props.module,
      }),
      _btnTeach: new ButtonTeach_A(this.find('.tc-button-teachmove-teach'), {
        robTarget: this._props.robTarget,
        module: this._props.module,
      }),
    };
  }

  markup() {
    return /*html*/ `
          <div class="tc-btnteachmove-location tc-btnteachmove-location-row">
            <div class="tc-button-teachmove-teach tc-button-teachmove-btn tc-item"></div>
            <div class="tc-button-teachmove-move tc-button-teachmove-btn tc-item"></div>
          </div>
        `;
  }

  get robTarget() {
    return this._props.robTarget;
  }

  set robTarget(robTarget) {
    this.setProps({ robTarget });
  }

  get module() {
    return this._props.module;
  }

  set module(module) {
    this.setProps({ module });
  }
}

ButtonTeachMove_A.loadCssClassFromString(/*css*/ `

.tc-btnteachmove-location {
  display: flex;
  flex-direction: column;
  height: 100px;
  width: max-content;
  align-items: flex-start;
}

.tc-btnteachmove-location-row {
  flex-direction: row;
  height: auto;
  align-items: center;
}

.tc-button-teachmove-btn {
  font-size: 14px;
  padding-left: 0 !important
}

`);
