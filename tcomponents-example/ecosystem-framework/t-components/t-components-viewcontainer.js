import { TabContainer_A } from './t-components-tabcontainer.js';
import { Component_A as TC } from './t-components-component.js';

/**
 * @typedef ViewContainerProps
 * @prop {TComponents.View[]} [views] Array of view objects
 */

/**
 *
 * @extends TComponents.TabContainer_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ViewContainerProps} [props]
 */
export class ViewContainer_A extends TabContainer_A {
  /**
   * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
   * @param {ViewContainerProps} props
   */
  constructor(parent, props) {
    super(parent, props);
    this.initPropsDep(['views']);
  }

  async onInit() {
    this._props.hiddenTabs = true;
    await super.onInit();
  }

  onRender() {
    super.onRender();

    const btns = this.all('.view-home-button');
    btns.forEach((btn, index) => {
      btn.addEventListener(
        'click',
        function () {
          this.activeTab = this.views[index + 1].name;
        }.bind(this),
      );
    });
  }

  _onRenderView() {
    this.viewId.clear();
    this.views.unshift({ name: 'HOME', content: this.find('.view-container-main-menu'), id: this.compId + '__home' });
    this.views.forEach(({ name, content, id }, index) => {
      const dom = this._getDom(content, id, name);

      let v;
      if (index > 0) {
        v = this.find(`.view-${index}`);
        v.querySelector('.view-content').appendChild(dom);
        v.querySelector('.home-button').addEventListener(
          'click',
          function () {
            this.activeTab = this.views[0].name;
          }.bind(this),
        );
      } else {
        v = content;
      }

      id = this.tabContainer.addTab(ViewContainer_A.t(name), v);
      this.viewId.set(id, name);
    });
  }

  markupViewsButtons(view) {
    return /*html*/ `
    <button class="view-home-button flex-col items-center justify-content-center gap-2" type="button">
      <div>${TC.t(view.name)}</div>
      ${view.image ? /*html*/ `<img class="view_container__image" src="${view.image}" alt="${view.name}" />` : ''}
    </button>

    `;
  }

  markupViews(view, index) {
    const idx = index + 1;
    return /*html*/ `
    <div class="view-${idx} grid grid-rows">
      <div class="view-content  grid-item1 flex-col justify-stretch"></div>
      <div class="view-buttons grid-item2 pl-2 pt-2">
        <button class="home-button">Home</button>
        <div class="views-buttons"></div>
      </div>
    </div>
    `;
  }

  markup() {
    return /*html*/ `

    <div class="view-container-main-menu flex-row items-center justify-center">
      <div class="view-main-buttons flex-row gap-15 flex-wrap justify-content-center">
        ${TC.mFor(this.views, this.markupViewsButtons.bind(this))}
      </div>
    </div>
    ${TC.mFor(this.views, this.markupViews.bind(this))}


    `;
  }

  /**
   *
   * @alias addTab
   * @memberof TComponents.ViewContainer_A
   * @param  {TComponents.View}  view   View object
   */
  addTab({ name, content }) {
    this.addView({ name, content });
  }
}

ViewContainer_A.loadCssClassFromString(/*css*/ `

.view-home-button {
  border-radius: 10%;
  width: 160px;
  height: 160px;
  background-color: white;
  border: 2px solid var(--t-color-GRAY-30);
  color: var(--t-color-PRIMARY-TEXT);
  padding: 32px 16px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  margin: 20px 50px;
  cursor: pointer;  hover */
  transition-duration: 0.4s;
}

.view-home-button:hover {
  background-color: var(--t-color-BLUE-OPACITY-50);
  color: white;
}

.home-button {
  border-radius: 20px;
  padding: 10px 20px;
  width: auto;
  height: auto;
  background-color: var(--t-color-GRAY-20);
  border: 2px solid var(--t-color-GRAY-30);
  color: var(--t-color-PRIMARY-TEXT);
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;  hover */
  transition-duration: 0.4s;
}

.home-button:hover {
  background-color: var(--t-color-BLUE-OPACITY-50);
  color: white;
}

.grid-rows {
  grid-template-rows: 90% 1fr
}

.grid-item1 {
  grid-row-start: 1
}

.grid-item2 {
  grid-row-start: 2
}

.view_container__image{
  width: 0;
  height: 0;
  min-width: 100%;
  min-height: 100%;
  border-radius: 20px;
  object-fit: cover;
  object-position: center;
  transition: 0.3s;

}

`);
