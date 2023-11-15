import { Component_A } from './t-components-component.js';
import { Container_A } from './t-components-container.js';

/**
 * @typedef TComponents.LayoutInfoboxProps
 * @prop {string} [title] Title of the infobox
 * @prop {boolean} [useBorder] Use border around the infobox
 * @prop {TComponents.ContainerProps} [content] Props to be passed to the content container}
 * @prop {object} [options] Option to be passed to the container
 */

/**
 * LayoutInfobox is a component that displays a title and content in a box
 * @class TComponents.LayoutInfobox_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.LayoutInfoboxProps} [props]
 */
export class LayoutInfobox_A extends Component_A {
  constructor(parent, props) {
    super(parent, props);

    this.forceUpdate();
  }

  /**
   *
   * @returns {TComponents.LayoutInfoboxProps}
   */
  defaultProps() {
    return {
      title: 'Title',
      useBorder: true,
      content: {
        children: [],
        row: false,
        box: false,
        width: 'auto',
        height: 'auto',
        classNames: ['flex-col', 'justify-stretch'],
      },
    };
  }
  mapComponents() {
    let props = Object.assign({}, this._props.content);
    props = Object.assign(props, { id: 'content' });

    return {
      content: new Container_A(this.find('.layout-infobox-content'), props),
    };
  }

  onRender() {
    this.child.content.cssBox(false);
    this.container.classList.add('layout-container');
    this.child.content.container.style.minHeight = '60px';
  }

  markup() {
    return /*html*/ `
      <div class="layout-infobox ${this._props.useBorder ? 'tc-container-box' : ''}">
        ${this._props.title ? /*html*/ `<div class="layout-title"><p>${this._props.title}</p></div>` : ''}
        <div class="layout-infobox-content flex-col justify-stretch"></div>
      </div>
    `;
  }

  set title(title) {
    this.setProps({ title });
  }
}

LayoutInfobox_A.loadCssClassFromString(/*css*/ `
.layout-container {
  display: flex;
  flex-direction: column;
}

.layout-container > .layout-infobox {
  flex: 1;
}

.layout-infobox-content {
  max-height: 100%;
}

.layout-infobox {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.layout-infobox > .layout-title {
  /* background-color: #dddddd; */
  max-height: 30px;
  min-height: 30px;

  border-bottom-style: solid;
  border-bottom-color: #d5d5d5;
  border-bottom-width: 3px;
  /* border-radius: 10px; */
  display: flex;
  align-items: center;
  /* padding-left: 8px; */
  margin-top: 0.2rem;
  margin-bottom: 0.4rem;
}

.layout-infobox > .layout-title > p {
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  width: 100%;
}

.layout-infobox > :not(.layout-title)  {
  /* background-color: white; */
  flex-grow: 1;
  /* padding: 8px; */

  min-height: 30px;
  min-width: 80px;
}

`);
