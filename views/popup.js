define(function () {
  return class Popup {
    static message(msg1, msg_array, callback = null) {
      FPComponents.Popup_A.message(msg1, msg_array, callback)
    }

    static info(msg1, msg_array, callback = null) {
      FPComponents.Popup_A.message(
        msg1,
        msg_array,
        callback,
        FPComponents.Popup_A.STYLE.INFORMATION
      )
    }

    static warning(msg1, msg_array, callback = null) {
      FPComponents.Popup_A.message(
        msg1,
        msg_array,
        callback,
        FPComponents.Popup_A.STYLE.WARNING
      )
    }

    static error(e, callback = null) {
      const entries = Object.entries(e)
      const msgArray = []
      entries.forEach(([key, value]) => {
        if (key !== 'message') {
          const json = JSON.stringify(value, null, 2)
            .replace(/"([^"]+)":/g, '$1:')
            .replace(/[{}]/g, '')

          const msg = `${key} -- ${json}`
          msgArray.push(msg)
        }
      })

      const severity =
        e.controllerStatus !== undefined &&
        e.controllerStatus.severity === 'Error'
          ? FPComponents.Popup_A.STYLE.DANGER
          : FPComponents.Popup_A.STYLE.WARNING

      FPComponents.Popup_A.message(e.message, msgArray, callback, severity)

      // FPComponents.Popup_A.message(e.message, [
      //   `${e.httpStatus ? `HTTP Status: ${e.httpStatus.code}` : ''}`,
      //   `${e.httpStatus ? `HTTP Text: ${e.httpStatus.text}` : ''}`,
      //   `${
      //     e.controllerStatus
      //       ? `Controller status: ${e.controllerStatus.name}`
      //       : ''
      //   }`,
      //   `${
      //     e.controllerStatus
      //       ? `Description: ${e.controllerStatus.description}`
      //       : ''
      //   }`,
      // ])
    }

    static confrim(msg1, msg_array, callback = null) {
      FPComponents.Popup_A.confirm(msg1, msg_array, callback)
    }
  }
})
