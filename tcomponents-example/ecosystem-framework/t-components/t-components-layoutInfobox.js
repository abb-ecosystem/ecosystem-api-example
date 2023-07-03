import { Component_A } from './t-components-component.js';
import { Container_A } from './t-components-container.js';

/**
 * @typedef LayoutInfoboxProps
 * @prop {string} [label] Title of the infobox
 * @prop {TComponents.ContainerProps} [content] Props to be passed to the content container}
 * @prop {object} [options] Option to be passed to the container
 */

/**
 * LayoutInfobox is a component that displays a title and content in a box * @class TComponents.Menu_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.LayoutInfoboxProps} [props]
 */
export class LayoutInfobox_A extends Component_A {
  constructor(parent, props) {
    super(parent, props);
  }

  /**
   *
   * @returns {LayoutInfoboxProps}
   */
  defaultProps() {
    return {
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
    this.cssBox(true);
    this.child.content.cssBox(false);
    this.container.classList.add('layout-container');
    this.container.style.boxSizing = 'border-box';
    this.child.content.container.style.minHeight = '40px';
  }

  markup() {
    return /*html*/ `
      
      <div class="tc-infobox">
        <div class="layout-exclude"><p>${this._props.label}</p></div> 
        <div class="layout-infobox-content"></div>
      </div>    
    `;
  }

  set label(label) {
    this.setProps({ label });
  }
}

LayoutInfobox_A.loadCssClassFromString(/*css*/ `
.layout-container {	
  display: flex;
  flex-direction: column;
}

.layout-container > .tc-infobox {
  flex: 1;
}

.layout-infobox-content {
  display: flex;
  flex-direction: column;
}

.layout-infobox-content > div{
  flex: 1;
}
`);
