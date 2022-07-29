requirejs.config({
  baseUrl: '',
  paths: {
    views: 'views',
  },
})

// Start loading the app file. Put all of
// your application logic in there.
requirejs(['app'], function (App) {
  ;(async function () {
    // RWS.setDebug(1, 0)
    fpComponentsEnableLog()

    const locale = await API.CONTROLLER.getLanguage()
    console.log(`Current language: ${locale}`)

    // let state = await API.RWS.getMastershipState('edit')
    // console.log(state)

    // const task = await API.RAPID.getTask()

    // task.executeProcedure('myProc', true)

    // let myTarget = await task.getVariable('Example', 'myTarget')
    // console.log(JSON.stringify(myTarget))
    // let myTarget02 = await task.getVariable('Example', 'myTarget02')
    // console.log(JSON.stringify(myTarget02))

    // let robTarget = await API.RWS.MOTIONSYSTEM.getRobTarget()
    // let robTarget = await API.MOTION.getRobotPosition()
    // console.log(`robTarget:`)
    // console.log(JSON.stringify(robTarget))

    // const jogData = [500, 500, 500, 500, 500, 500]
    // // const jogData = [1000, 1000, 1000, 1000, 1000, 1000]
    // // const jogData = [50, 50, 50, 50, 50, 50]

    // await API.MOTION.executeJogging(
    //   '',
    //   '',
    //   '',
    //   API.MOTION.JOGMODE.GoToPos,
    //   jogData,
    //   myTarget
    // )

    // await API.MOTION.executeJogging(
    //   '',
    //   '',
    //   '',
    //   API.MOTION.JOGMODE.GoToPos,
    //   jogData,
    //   myTarget02
    // )

    // await API.RWS.releaseMastership('motion')

    // robTarget = await API.RWS.MOTIONSYSTEM.getRobTarget()
    // console.log(`robTarget:`)
    // console.log(JSON.stringify(robTarget))

    // state = await API.RWS.getMastershipState('motion')
    // console.log(`Motion Mastership: ${state}`)

    const app = new App(document.getElementById('app'))
  })()
})
