import { Component_A } from './t-components-component.js';
import { Container_A } from './t-components-container.js';

/**
 * @typedef TComponents.FieldsetProps
 * @prop {string} [title] Title of the infobox
 * @prop {TComponents.ContainerProps} [content] Props to be passed to the content container}
 * @prop {object} [options] Option to be passed to the container
 */

/**
 * Fieldset is a component that displays a title and content in a box
 * @class TComponents.Fieldset_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.FieldsetProps} [props]
 */
export class Fieldset_A extends Component_A {
  constructor(parent, props) {
    super(parent, props);

    this.forceUpdate();
  }

  /**
   *
   * @returns {TComponents.FieldsetProps}
   */
  defaultProps() {
    return {
      title: 'Title',
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
      content: new Container_A(this.find('.fieldset-content'), props),
    };
  }

  onRender() {
    this.container.classList.add('flex-col', 'justify-stretch');
    this.child.content.container.style.minHeight = '60px';
  }

  markup() {
    return /*html*/ `

    <div class="custom-fieldset flex-col justify-stretch">
      <div class="legend">${Component_A.t(this._props.title)}</div>
        <div class="fieldset-content flex-col justify-stretch">
      </div>
    </div>


    `;
  }

  set title(title) {
    this.setProps({ title });
  }
}

Fieldset_A.loadCssClassFromString(/*css*/ `

.custom-fieldset {
  margin: 8px 4px;
  padding: 10px;
  border: 2px solid #ddd; /* Mimic fieldset border */
  position: relative;
}

.legend {
  position: absolute;
  top: -10px; /* Adjust based on the font size */
  left: 10px;
  background: #fff; /* Same as your page background */
  padding: 0 5px;
  font-weight: 500;
}

.fieldset-content {

}



`);
// Fieldset_A.loadCssClassFromString(/*css*/ `
// .fieldset-box {
//   display: flex;
//   flex-direction: column;
// }

// .fieldset-container {
//   display: flex;
//   flex-direction: column;
// }

// .fieldset-container > .fieldset {
//   flex: 1;
// }

// .fieldset-content {
//   max-height: 100%;
// }

// .fieldset {
//   display: flex;
//   flex-direction: column;
//   max-height: 100%;
// }

// .fieldset > .fieldset-title {
//   /* background-color: #dddddd; */
//   max-height: 30px;
//   min-height: 30px;

//   border-bottom-style: solid;
//   border-bottom-color: #d5d5d5;
//   border-bottom-width: 3px;
//   /* border-radius: 10px; */
//   display: flex;
//   align-items: center;
//   /* padding-left: 8px; */
//   margin-top: 0.2rem;
//   margin-bottom: 0.4rem;
// }

// .fieldset > :not(.fieldset-title)  {
//   /* background-color: white; */
//   flex-grow: 1;
//   /* padding: 8px; */

//   min-height: 30px;
//   min-width: 80px;
// }

// `);
