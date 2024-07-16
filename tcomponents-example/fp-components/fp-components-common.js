
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

function fpComponentsLoadCSS(href) {
    let head = document.getElementsByTagName("head")[0];
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    head.appendChild(link);
}

const FP_COMPONENTS_COMMON_VERSION = "1.4.1";

fpComponentsLoadCSS("fp-components/fp-components-common.css");

const FP_COMPONENTS_KEYBOARD_ALPHA = {};

const FP_COMPONENTS_KEYBOARD_NUM = {};

function fpComponentsKeyboardShow(callback, initialText = null, label = null, variant = null, regex = null, validator = null) {
    var __fpComponentsKeyboardCallback = callback;
    var __fpComponentsKeyboardLabel = label;
    var __fpComponentsKeyboardRegex = regex;
    var __fpComponentsKeyboardValidator = validator;
    const INPUT_OK = {};
    function cancel() {
        document.getElementById("fp-components-keyboard-id").style.display = "none";
        document.getElementById("fp-components-keyboard-background-id").style.display = "none";
        document.getElementById("fp-components-keyboard-input-id").value = "";
        if (__fpComponentsKeyboardCallback !== null && typeof __fpComponentsKeyboardCallback === "function") {
            __fpComponentsKeyboardCallback(null);
        }
    }
    function validateInput() {
        let isMatch = false;
        let f = document.getElementById("fp-components-keyboard-input-id");
        if (__fpComponentsKeyboardRegex === null || __fpComponentsKeyboardRegex.test === undefined || __fpComponentsKeyboardRegex.test(f.value)) {
            isMatch = true;
        }
        if (isMatch && __fpComponentsKeyboardValidator !== null && typeof __fpComponentsKeyboardValidator === "function") {
            isMatch = __fpComponentsKeyboardValidator(f.value);
        }
        f.style.color = isMatch ? "black" : "red";
        let okButton = document.getElementById("fp-components-keyboard-ok-id");
        if (okButton) {
            if (isMatch) {
                okButton.classList.remove("fp-components-keyboard-disabled-button");
                okButton.onclick = () => {
                    input(INPUT_OK);
                };
            } else {
                okButton.classList.add("fp-components-keyboard-disabled-button");
                okButton.onclick = null;
            }
        }
    }
    function input(c) {
        let f = document.getElementById("fp-components-keyboard-input-id");
        if (f === null) {
            return;
        }
        if (typeof c === "string") {
            let oldSelStart = f.selectionStart;
            if (f.selectionStart != f.selectionEnd) {
                f.value = f.value.slice(0, oldSelStart) + f.value.slice(f.selectionEnd);
            }
            f.value = f.value.slice(0, oldSelStart) + c + f.value.slice(oldSelStart);
            f.selectionStart = oldSelStart;
            f.selectionEnd = oldSelStart;
            f.selectionStart = oldSelStart + 1;
            f.selectionEnd = f.selectionStart;
        } else if (c === INPUT_OK) {
            if (__fpComponentsKeyboardCallback !== null && typeof __fpComponentsKeyboardCallback === "function") {
                document.getElementById("fp-components-keyboard-id").style.display = "none";
                document.getElementById("fp-components-keyboard-background-id").style.display = "none";
                let inputField = document.getElementById("fp-components-keyboard-input-id");
                let val = inputField.value;
                inputField.value = "";
                __fpComponentsKeyboardCallback(val);
            }
        }
        validateInput();
    }
    let existing = document.getElementById("fp-components-keyboard-id");
    if (existing === null) {
        let divKeyboard = document.createElement("div");
        divKeyboard.className = "fp-components-keyboard";
        divKeyboard.id = "fp-components-keyboard-id";
        let divTop = document.createElement("div");
        divTop.className = "fp-components-keyboard-toparea";
        divTop.id = "fp-components-keyboard-toparea-id";
        divKeyboard.appendChild(divTop);
        let divLabel = document.createElement("div");
        divLabel.className = "fp-components-keyboard-label";
        divKeyboard.appendChild(divLabel);
        let okBtn = document.createElement("div");
        okBtn.innerHTML = "OK";
        okBtn.id = "fp-components-keyboard-ok-id";
        okBtn.className = "fp-components-keyboard-button fp-components-keyboard-ok";
        divTop.appendChild(okBtn);
        let cancelBtn = document.createElement("div");
        cancelBtn.textContent = "Cancel";
        cancelBtn.id = "fp-components-keyboard-button-id";
        cancelBtn.className = "fp-components-keyboard-button";
        divTop.appendChild(cancelBtn);
        let f = document.createElement("input");
        f.className = "fp-components-keyboard-input";
        f.id = "fp-components-keyboard-input-id";
        f.autocomplete = "off";
        f.addEventListener("keyup", ev => {
            if (ev.key === "Enter") {
                if (okBtn.onclick) {
                    okBtn.onclick();
                }
            }
        });
        divTop.appendChild(f);
        let hand = document.createElement("div");
        hand.id = "fp-components-keyboard-hand-id";
        hand.className = "fp-components-keyboard-hand";
        let handImg = document.createElement("div");
        hand.appendChild(handImg);
        divTop.appendChild(hand);
        let divBackshade = document.createElement("div");
        divBackshade.id = "fp-components-keyboard-background-id";
        divBackshade.className = "fp-components-keyboard-background";
        let body = document.getElementsByTagName("body")[0];
        body.appendChild(divBackshade);
        body.appendChild(divKeyboard);
        existing = divKeyboard;
    }
    let bg = document.getElementById("fp-components-keyboard-background-id");
    let okBtn = document.getElementById("fp-components-keyboard-ok-id");
    let cancelBtn = document.getElementById("fp-components-keyboard-button-id");
    let handDiv = document.getElementById("fp-components-keyboard-hand-id");
    let inputField = document.getElementById("fp-components-keyboard-input-id");
    bg.onclick = () => {
        cancel();
    };
    okBtn.onclick = () => {
        input(INPUT_OK);
    };
    cancelBtn.onclick = () => {
        cancel();
    };
    inputField.addEventListener("input", validateInput);
    inputField.onfocus = () => {
        handDiv.classList.add("fp-components-keyboard-hand-hide");
    };
    inputField.value = initialText === null ? "" : initialText.toString();
    bg.style.display = "block";
    existing.style.display = "block";
    if (handDiv.classList.contains("fp-components-keyboard-hand-hide")) {
        handDiv.classList.remove("fp-components-keyboard-hand-hide");
    }
    let labelDiv = document.getElementsByClassName("fp-components-keyboard-label")[0];
    labelDiv.textContent = __fpComponentsKeyboardLabel === null ? " " : __fpComponentsKeyboardLabel;
    validateInput();
}

var __fpComponentsDebugWindowLock = false;

var __fpComponentsDebugWindowCmd = null;

function fpComponentsEnableLog() {
    const NORMAL = 1;
    const INFO = 2;
    const ERROR = 3;
    const WARN = 4;
    function currentTime() {
        function pad(n) {
            return ("00" + n).slice(-2);
        }
        let now = new Date();
        return pad(now.getHours()) + ":" + pad(now.getMinutes()) + "." + pad(now.getSeconds());
    }
    function updateClock() {
        let clock = document.getElementById("fp-debugwindow-clock");
        clock.textContent = currentTime();
        setTimeout(updateClock, 1e3);
    }
    function logToDebugWindow(message, level) {
        let debugWindowContent = document.getElementById("fp-debugwindow-content");
        if (debugWindowContent !== null) {
            let now = new Date();
            let newEntry = document.createElement("pre");
            if (level === ERROR) {
                newEntry.style.fontWeight = "bold";
                newEntry.style.textDecoration = "underline";
            } else if (level === WARN) {
                newEntry.style.fontWeight = "bold";
            } else if (level === INFO) {
                newEntry.style.fontStyle = "italic";
            }
            newEntry.textContent = "§ " + currentTime() + " - " + message;
            debugWindowContent.appendChild(newEntry);
            if (debugWindowContent.children.length > 1e3) {
                debugWindowContent.removeChild(debugWindowContent.children[0]);
            }
            if (!__fpComponentsDebugWindowLock) {
                debugWindowContent.scrollTop = debugWindowContent.scrollHeight;
            }
        }
    }
    let divWindow = document.createElement("div");
    divWindow.id = "fp-debugwindow";
    let divGrid = document.createElement("div");
    divGrid.id = "fp-debugwindow-grid";
    let divMenu = document.createElement("div");
    divMenu.id = "fp-debugwindow-menu";
    let pClock = document.createElement("p");
    pClock.id = "fp-debugwindow-clock";
    pClock.style.display = "inline-block";
    pClock.textContent = "xx:xx.xx";
    divMenu.appendChild(pClock);
    let divMinimize = document.createElement("div");
    divMinimize.className = "fp-debugwindow-button";
    divMinimize.onclick = minimizeFPComponentsLog;
    divMinimize.textContent = "Minimize";
    divMenu.appendChild(divMinimize);
    let divClear = document.createElement("div");
    divClear.className = "fp-debugwindow-button";
    divClear.onclick = clearFPComponentsLog;
    divClear.textContent = "Clear";
    divMenu.appendChild(divClear);
    let divGhost = document.createElement("div");
    divGhost.id = "fp-debugwindow-ghostbutton";
    divGhost.className = "fp-debugwindow-button";
    divGhost.onclick = ghostFPComponentsLog;
    divGhost.textContent = "Ghost";
    divMenu.appendChild(divGhost);
    let divLock = document.createElement("div");
    divLock.id = "fp-debugwindow-scrollbutton";
    divLock.className = "fp-debugwindow-button";
    divLock.onclick = lockScrollFPComponentsLog;
    divLock.textContent = "Lock scroll";
    divMenu.appendChild(divLock);
    let divCmd = document.createElement("div");
    divCmd.id = "fp-debugwindow-cmdbutton";
    divCmd.className = "fp-debugwindow-button";
    divCmd.onclick = cmdFPComponentsLog;
    divCmd.textContent = "New command";
    divMenu.appendChild(divCmd);
    let divCmdReuse = document.createElement("div");
    divCmdReuse.id = "fp-debugwindow-cmdbuttonreuse";
    divCmdReuse.className = "fp-debugwindow-button";
    divCmdReuse.onclick = () => cmdFPComponentsLog(true);
    divCmdReuse.textContent = "Re-use command";
    divMenu.appendChild(divCmdReuse);
    divGrid.appendChild(divMenu);
    let divContent = document.createElement("div");
    divContent.id = "fp-debugwindow-content";
    divGrid.appendChild(divContent);
    divWindow.appendChild(divGrid);
    let divBody = document.getElementsByTagName("body")[0];
    divBody.appendChild(divWindow);
    let divRaise = document.createElement("div");
    divRaise.id = "fp-debugwindow-minimized";
    divRaise.onclick = raiseFPComponentsLog;
    divBody.appendChild(divRaise);
    updateClock();
    if ("external" in window && "notify" in window.external || "chrome" in window && "webview" in window.chrome && "postMessage" in window.chrome.webview) {
        function format(messages) {
            return messages.map(message => {
                if (typeof message === "object") {
                    return JSON.stringify(message);
                } else {
                    return message;
                }
            }).join(" ");
        }
        let originalConsoleLog = console.log;
        console.log = (...messages) => {
            logToDebugWindow(format(messages), NORMAL);
            originalConsoleLog.apply(console, messages);
        };
        let originalConsoleInfo = console.info;
        console.info = (...messages) => {
            logToDebugWindow(format(messages), INFO);
            originalConsoleInfo.apply(console, messages);
        };
        let originalConsoleWarn = console.warn;
        console.warn = (...messages) => {
            logToDebugWindow(format(messages), WARN);
            originalConsoleWarn.apply(console, messages);
        };
        let originalConsoleError = console.error;
        console.error = (...messages) => {
            logToDebugWindow(format(messages), ERROR);
            originalConsoleError.apply(console, messages);
        };
    } else {
        logToDebugWindow("Not running in embedded browser. Please open the browser's JavaScript console to see log messages or to enter commmands.");
    }
    window.addEventListener("error", e => {
        console.error(e.filename + " (" + e.lineno + ":" + e.colno + "): " + e.message);
    });
}

function ghostFPComponentsLog() {
    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) {
        debugWindow.style.opacity = "0.5";
        debugWindow.style.pointerEvents = "none";
        let ghostButton = document.getElementById("fp-debugwindow-ghostbutton");
        ghostButton.textContent = "Solid";
        ghostButton.onclick = solidFPComponentsLog;
    }
}

function solidFPComponentsLog() {
    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) {
        debugWindow.style.opacity = "1";
        debugWindow.style.pointerEvents = "all";
        let ghostButton = document.getElementById("fp-debugwindow-ghostbutton");
        ghostButton.textContent = "Ghost";
        ghostButton.onclick = ghostFPComponentsLog;
    }
}

function lockScrollFPComponentsLog() {
    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) {
        __fpComponentsDebugWindowLock = true;
        let scrollButton = document.getElementById("fp-debugwindow-scrollbutton");
        scrollButton.textContent = "Auto-scroll";
        scrollButton.onclick = autoScrollFPComponentsLog;
    }
}

function autoScrollFPComponentsLog() {
    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) {
        __fpComponentsDebugWindowLock = false;
        let scrollButton = document.getElementById("fp-debugwindow-scrollbutton");
        scrollButton.textContent = "Lock scroll";
        scrollButton.onclick = lockScrollFPComponentsLog;
    }
}

function clearFPComponentsLog() {
    let debugWindowContent = document.getElementById("fp-debugwindow-content");
    if (debugWindowContent !== null) {
        while (debugWindowContent.firstChild) {
            debugWindowContent.removeChild(debugWindowContent.firstChild);
        }
    }
}

function raiseFPComponentsLog() {
    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) debugWindow.style.display = "block";
    let debugWindowMinimized = document.getElementById("fp-debugwindow-minimized");
    if (debugWindowMinimized !== null) debugWindowMinimized.style.display = "none";
}

function minimizeFPComponentsLog() {
    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) debugWindow.style.display = "none";
    let debugWindowMinimized = document.getElementById("fp-debugwindow-minimized");
    if (debugWindowMinimized !== null) debugWindowMinimized.style.display = "block";
}

function cmdFPComponentsLog(reuse = false) {
    minimizeFPComponentsLog();
    fpComponentsKeyboardShow(async cmd => {
        function logErr(msg, msgJSON, e) {
            console.error(`${msg} ${e}`);
            if (typeof e !== "string" && typeof e !== "number") {
                console.error(`${msgJSON} ${JSON.stringify(e)}`);
            }
        }
        if (cmd) {
            console.log(`Executing: ${cmd}`);
            __fpComponentsDebugWindowCmd = cmd;
            try {
                let value = eval(cmd);
                console.log(`Return value: ${value}`);
                if (value && typeof value.then === "function") {
                    value.then(asyncValue => {
                        console.log(`Async return value: ${asyncValue}`);
                        console.log(`Async return value type: ${typeof asyncValue}`);
                        if (typeof asyncValue !== "string" && typeof asyncValue !== "number") {
                            console.log(`Return value as JSON: ${JSON.stringify(asyncValue)}`);
                        }
                        window.r = asyncValue;
                        console.log("Async response value saved in global variable 'r'");
                    }).catch(e => {
                        logErr("Async operation was rejected. Message:", "Rejection message as JSON:", e);
                    });
                } else {
                    console.log(`Return value type: ${typeof value}`);
                    if (typeof value !== "string" && typeof value !== "number") {
                        console.log(`Return value as JSON: ${JSON.stringify(value)}`);
                    }
                    window.r = value;
                    console.log("Response value saved in global variable 'r'");
                }
            } catch (e) {
                logErr("Exception:", "Exception as JSON:", e);
            }
        }
        raiseFPComponentsLog();
    }, reuse === true ? __fpComponentsDebugWindowCmd : null, "Enter a JavaScript expression, result will be stored in global variable 'r'");
}