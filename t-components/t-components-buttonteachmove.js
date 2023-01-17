'use strict';
// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ButtonTeachMove_A')) {
    /**
     * Component that combine {@link TComponents.ButtonTeach_A} and {@link TComponents.ButtonMoveTo_A} together.
     * @class TComponents.ButtonTeachMove_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent
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
    o.ButtonTeachMove_A = class ButtonTeachMove extends TComponents.Component_A {
      constructor(parent, location, module, label = '') {
        super(parent, label);
        this._location = location;
        this._module = module;
        this.robTarget = null;
        this._isJogging = false;
      }

      /**
       * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
       * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
       * @private
       * @returns {object} Contains all child TComponents instances used within the component.
       */
      mapComponents() {
        return {
          _btnMoveTo: new TComponents.ButtonMoveTo_A(
            this.find('.tc-button-teachmove-move'),
            this._location,
            this._module,
            'Move to'
          ),
          _btnTeach: new TComponents.ButtonTeach_A(
            this.find('.tc-button-teachmove-teach'),
            this._location,
            this._module,
            'Teach'
          ),
        };
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({ _location, _label }) {
        return `
          <div id="${_location}" class="tc-btnteachmove-location tc-btnteachmove-location-row">
            <div class="tc-button-teachmove-teach tc-button-teachmove-btn tc-item"></div>
            <div class="tc-button-teachmove-move tc-button-teachmove-btn tc-item"></div>
            <p>${_label}</p>
          </div>
        `;
      }
    };
  }
})(TComponents);

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-btnteachmove-location {
  display: flex;
  flex-direction: column;
  height: 100px;
  width: max-content;
  /* justify-content: space-around; */
  align-items: flex-start;
  padding-left: 20px;
}

.tc-btnteachmove-location-row {
  flex-direction: row;
  height: auto;
  align-items: center;

  margin-right: 10px;
}

.tc-button-teachmove-btn {
  font-size: 14px;
  margin-left: 5px;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
