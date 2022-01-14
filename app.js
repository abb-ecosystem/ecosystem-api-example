"use strict";

////////////////////////////////////////////////////////////////////
// Entry point
////////////////////////////////////////////////////////////////////
window.addEventListener("load", () => {
  RWS.setDebug(1, 0);
  fpComponentsEnableLog();
  console.log("windows loaded");

  constructUI(UIConstructionCompleted);
});

////////////////////////////////////////////////////////////////////
// GUI
////////////////////////////////////////////////////////////////////

async function constructUI(done) {
  initTabs();
  configRebootButton();

  setTimeout(() => {
    done();
  }, 0);
}

function initTabs() {
  var tabContainer = new FPComponents.Tabcontainer_A();
  tabContainer.addTab("Digital IOs", "io-view");
  tabContainer.addTab("About", "about-view");
  tabContainer.attachToId("tab-container");
}

// Called after the constructUI function has finished.
async function UIConstructionCompleted() {
  setTimeout(async () => {
    try {
      console.log("UIConstructionCompleted called ...");

      // await createIOs();
      await setupConfiguration();
    } catch (e) {
      console.error(
        "Uncaught exception in UIConstructionCompleted: " + JSON.stringify(e)
      );
      console.error(e);
    }
  }, 0);
}
