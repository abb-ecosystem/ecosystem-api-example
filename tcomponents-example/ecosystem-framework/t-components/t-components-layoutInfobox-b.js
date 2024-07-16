import { LayoutInfobox_A } from './t-components-layoutInfobox.js';

/**
 * @typedef TComponents.LayoutInfoboxProps
 * @prop {string} [title] Title of the infobox
 * @prop {boolean} [useBorder] Use border around the infobox
 * @prop {TComponents.ContainerProps} [content] Props to be passed to the content container}
 * @prop {object} [options] Option to be passed to the container
 */

/**
 * LayoutInfobox is a component that displays a title and content in a box
 * @class TComponents.LayoutInfobox_B
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.LayoutInfoboxProps} [props]
 */
export class LayoutInfobox_B extends LayoutInfobox_A {
  constructor(parent, props) {
    super(parent, props);
  }

  /**
   *
   * @returns {TComponents.LayoutInfoboxProps}
   */
  defaultProps() {
    super.defaultProps();
  }

  onRender() {
    super.onRender();
    this.container.classList.add('tc-layoutinfobox-b');
    this.find('.layout-title').classList.remove('flex-row', 'justify-center');
  }
}

LayoutInfobox_B.loadCssClassFromString(/*css*/ `
.tc-layoutinfobox-b > .tc-container-box{
  border: 1px solid var(--t-color-GRAY-20);
  padding: 0 !important;
  margin: 4px 4px 4px 4px !important;
}

.tc-layoutinfobox-b > .layout-infobox > .layout-infobox-content{
  padding: 0.4rem;
}

.tc-layoutinfobox-b > .layout-infobox > :nth-child(1) {
  background-color: #dddddd;
  border-bottom: none !important;
  margin-top: 0 !important;
  border-radius: 0 !important;
  border-top-left-radius: 10px !important;
  border-top-right-radius: 10px !important;
}

.tc-layoutinfobox-b > .layout-infobox > .layout-infobox-content .t-component__container{
  min-height: 50px !important;
}
.tc-layoutinfobox-b > .layout-infobox > .layout-title {
  max-height: none !important;
}
.tc-layoutinfobox-b > .layout-infobox > .layout-title > p {
  text-align: left !important;
  padding: 8px 5px 5px 15px;
  margin: 0px;
  font-weight: 500 !important;
}

`);
