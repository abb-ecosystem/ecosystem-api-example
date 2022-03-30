'use strict'

////////////////////////////////////////////////////////////////////
// Entry point
////////////////////////////////////////////////////////////////////
window.addEventListener('load', async () => {
  RWS.setDebug(1, 0)
  fpComponentsEnableLog()
  console.log('windows loaded')
  // let attr = {
  //   Name: 'di_is_gripper_opened',
  //   SignalType: 'DI',
  //   DeviceMap: '1',
  //   Access: 'All',
  //   Category: 'VIRTUAL',
  // }
  // const s1 = await API.SIGNAL.createSignal(attr)
  // let attr2 = {
  //   Name: 'di_not_existing_2',
  //   SignalType: 'DI',
  //   DeviceMap: '1',
  //   Access: 'All',
  //   Category: 'VIRTUAL',
  // }
  // const s2 = await API.SIGNAL.createSignal(attr2)
  constructUI(UIConstructionCompleted)
})

////////////////////////////////////////////////////////////////////
// GUI
////////////////////////////////////////////////////////////////////

async function constructUI(done) {
  // initIndicators()

  initTabs()
  configRebootButton()

  setTimeout(() => {
    done()
  }, 0)
}

function initTabs() {
  var tabContainer = new FPComponents.Tabcontainer_A()
  tabContainer.addTab('Digital IOs', 'io-view')
  tabContainer.addTab('About', 'about-view')
  tabContainer.attachToId('tab-container')
}

// function initIndicators() {
//   var indicator = new FPComponents.Digital_A()
//   var indicator2 = new FPComponents.Digital_A()

//   // Indicator 1
//   indicator.attachToId('signal-indicator')
//   let s = API.SIGNAL.getSignalByName('di_is_gripper_opened')
//   const cb = function (value) {
//     indicator.active = value
//   }
//   s.subscribe(cb)

//   const cbOnClick = async function () {
//     indicator.active = !indicator.active
//     indicator.active ? s.handler(1) : s.handler(0)
//   }
//   indicator.onclick = cbOnClick

//   // Indicator 2
//   indicator2.attachToId('signal-indicator-2')
//   let s2 = API.SIGNAL.getSignalByName('di_not_existing_2')
//   const cb2 = function (value) {
//     indicator2.active = value
//   }
//   s2.subscribe(cb2)

//   const cbOnClick2 = async function () {
//     console.log('cbOnClick2 called...')
//     indicator2.active = !indicator2.active
//     indicator2.active ? s2.handler(1) : s2.handler(0)
//   }
//   indicator2.onclick = cbOnClick2
// }

// Called after the constructUI function has finished.
async function UIConstructionCompleted() {
  setTimeout(async () => {
    try {
      console.log('UIConstructionCompleted called ...')

      await setupConfiguration()
    } catch (e) {
      console.error(
        'Uncaught exception in UIConstructionCompleted: ' + JSON.stringify(e)
      )
      console.error(e)
    }
  }, 0)
}
