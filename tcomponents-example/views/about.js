import { T_COMPONENTS_EXAMPLE_VERSION } from '../constants/common.js';

export default class About extends TComponents.Component_A {
  constructor(parent) {
    super(parent);
  }

  onRender() {
    this.find('.about-api').textContent = API.ECOSYSTEM_API_VERSION;
    this.find('.about-tcomponents').textContent = TComponents.T_COMPONENTS_BASE_VERSION;
    this.find('.about-tcomponents-example').textContent = T_COMPONENTS_EXAMPLE_VERSION;
    this.find('.about-omnicore-sdk').textContent = RWS.RWS_LIB_VERSION;
  }
  markup() {
    return /*html*/ `
      <div id="about-view" class="about-view" style="background-color: #ebebeb">
        <div class="tc-container-box">
          <div>
            <div class="about-ecosystem-framework tc-infobox">
              <div>
                <p>Version</p>
              </div>
              <div>
                <table class="about-table">
                  <tr>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="about-label">ECOSYSTEM API</td>
                    <td class="about-api" class="label">--</td>
                  </tr>
                  <tr>
                    <td class="about-label">ECOSYSTEM TCOMPONENTS</td>
                    <td class="about-tcomponents" class="label">--</td>
                  </tr>
                  <tr>
                    <td class="about-label">ECOSYSTEM WEBAPP</td>
                    <td class="about-tcomponents-example" class="label">--</td>
                  </tr>
                  <tr>
                    <td class="about-label">OMNICORE APP SDK</td>
                    <td class="about-omnicore-sdk" class="label">--</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
