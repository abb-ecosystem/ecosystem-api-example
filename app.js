'use strict'

// const modulePath = 'HOME/WebApps/EcosystemGuide/rapid/myModule.sysx'

////////////////////////////////////////////////////////////////////
// Entry point
////////////////////////////////////////////////////////////////////
window.addEventListener('load', async () => {
  // RWS.setDebug(1, 0)
  fpComponentsEnableLog()
  console.log('windows loaded')

  await setupConfiguration()

  constructUI(UIConstructionCompleted)
})

////////////////////////////////////////////////////////////////////
// GUI
////////////////////////////////////////////////////////////////////

async function constructUI(done) {
  // initIndicators()

  initTabs()
  configRebootButton()
  createConfigView()

  setTimeout(() => {
    done()
  }, 0)
}

function initTabs() {
  var tabContainer = new FPComponents.Tabcontainer_A()
  tabContainer.addTab('Configuration', 'cfg-view')
  tabContainer.addTab('Digital IOs', 'io-view')
  tabContainer.addTab('About', 'about-view')
  tabContainer.attachToId('tab-container')
}

// Called after the constructUI function has finished.
async function UIConstructionCompleted() {}
