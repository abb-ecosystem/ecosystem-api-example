
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

var RWS = RWS || {};

if (typeof RWS.constructedRapidData === "undefined") {
    (function(rd) {
        rd.RAPIDDATA_LIB_VERSION = "1.4.1";
        let monitor = null;
        rd.initCache = () => {
            rd.resetSymbolTypeCache();
            monitor = new Monitor();
        };
        window.addEventListener("load", rd.initCache, false);
        function Monitor() {
            let taskChangeMonitors = [];
            let excStateMonitors = [];
            let blockClear = false;
            let tasks = [];
            (async function() {
                tasks = await RWS.Rapid.getTasks();
                for (let iii = 0; iii < tasks.length; iii++) {
                    let props = await tasks[iii].getProperties();
                    if (props.type !== "normal") continue;
                    let name = tasks[iii].getName();
                    let taskChange = new TaskChangeMonitor(name);
                    let excState = new ExcStateMonitor(name);
                    taskChangeMonitors.push(taskChange);
                    excStateMonitors.push(excState);
                }
            })();
            function TaskChangeMonitor(task) {
                let resourceString = `/rw/rapid/tasks/${encodeURIComponent(task)};taskchange`;
                let resourceUrl = `/rw/rapid/tasks/${encodeURIComponent(task)}`;
                this.getTitle = function() {
                    return resourceUrl;
                };
                this.getResourceString = function() {
                    return resourceString;
                };
                this.onchanged = function(newValue) {
                    if (blockClear === true) {
                        blockClear = false;
                        return;
                    }
                    if (newValue.hasOwnProperty("task-name") && newValue["task-name"] === task) {
                        RWS.removeSymbolTypes(task);
                    }
                };
                RWS.Subscriptions.subscribe([ this ]).catch(() => RWS.writeDebug(`Failed to subscribe to task changes for '${task}'.`, 2));
            }
            function ExcStateMonitor(task) {
                let resourceString = `/rw/rapid/tasks/${encodeURIComponent(task)};excstate`;
                let resourceUrl = `/rw/rapid/tasks/${encodeURIComponent(task)}`;
                this.getTitle = function() {
                    return resourceUrl;
                };
                this.getResourceString = function() {
                    return resourceString;
                };
                this.onchanged = function(newValue) {
                    if (newValue.hasOwnProperty("task-name") && newValue["task-name"] === task) {
                        let state = newValue.hasOwnProperty("pgmtaskexec-state") ? newValue["pgmtaskexec-state"] : "";
                        if (state === "started") blockClear = true;
                    }
                };
                RWS.Subscriptions.subscribe([ this ]).catch(() => RWS.writeDebug("Failed to subscribe to execution state changes.", 2));
            }
        }
        function getEmptyDataType() {
            return {
                type: "",
                url: "",
                isAtomic: false,
                isArray: false,
                dimensions: [],
                isAlias: false,
                aliasTypeUrl: "",
                isRecord: false,
                numberOfComponents: 0,
                components: []
            };
        }
        let symbolTypeCache = {};
        rd.resetSymbolTypeCache = function() {
            symbolTypeCache = {};
            symbolTypeCache["RAPID/num"] = getEmptyDataType();
            symbolTypeCache["RAPID/num"]["type"] = "num";
            symbolTypeCache["RAPID/num"]["url"] = "RAPID/num";
            symbolTypeCache["RAPID/num"]["isAtomic"] = true;
            symbolTypeCache["RAPID/dnum"] = getEmptyDataType();
            symbolTypeCache["RAPID/dnum"]["type"] = "dnum";
            symbolTypeCache["RAPID/dnum"]["url"] = "RAPID/dnum";
            symbolTypeCache["RAPID/dnum"]["isAtomic"] = true;
            symbolTypeCache["RAPID/string"] = getEmptyDataType();
            symbolTypeCache["RAPID/string"]["type"] = "string";
            symbolTypeCache["RAPID/string"]["url"] = "RAPID/string";
            symbolTypeCache["RAPID/string"]["isAtomic"] = true;
            symbolTypeCache["RAPID/bool"] = getEmptyDataType();
            symbolTypeCache["RAPID/bool"]["type"] = "bool";
            symbolTypeCache["RAPID/bool"]["url"] = "RAPID/bool";
            symbolTypeCache["RAPID/bool"]["isAtomic"] = true;
            symbolTypeCache["RAPID/btnres"] = getEmptyDataType();
            symbolTypeCache["RAPID/btnres"]["type"] = "btnres";
            symbolTypeCache["RAPID/btnres"]["url"] = "RAPID/btnres";
            symbolTypeCache["RAPID/btnres"]["isAlias"] = true;
            symbolTypeCache["RAPID/btnres"]["aliasTypeUrl"] = "RAPID/num";
            symbolTypeCache["RAPID/robjoint"] = getEmptyDataType();
            symbolTypeCache["RAPID/robjoint"]["type"] = "robjoint";
            symbolTypeCache["RAPID/robjoint"]["url"] = "RAPID/robjoint";
            symbolTypeCache["RAPID/robjoint"]["isRecord"] = true;
            symbolTypeCache["RAPID/robjoint"]["numberOfComponents"] = 6;
            symbolTypeCache["RAPID/robjoint"]["components"] = [];
            symbolTypeCache["RAPID/robjoint"]["components"].push({
                name: "rax_1",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/robjoint"]["components"].push({
                name: "rax_2",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/robjoint"]["components"].push({
                name: "rax_3",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/robjoint"]["components"].push({
                name: "rax_4",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/robjoint"]["components"].push({
                name: "rax_5",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/robjoint"]["components"].push({
                name: "rax_6",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/extjoint"] = getEmptyDataType();
            symbolTypeCache["RAPID/extjoint"]["type"] = "extjoint";
            symbolTypeCache["RAPID/extjoint"]["url"] = "RAPID/extjoint";
            symbolTypeCache["RAPID/extjoint"]["isRecord"] = true;
            symbolTypeCache["RAPID/extjoint"]["numberOfComponents"] = 6;
            symbolTypeCache["RAPID/extjoint"]["components"] = [];
            symbolTypeCache["RAPID/extjoint"]["components"].push({
                name: "eax_a",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/extjoint"]["components"].push({
                name: "eax_b",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/extjoint"]["components"].push({
                name: "eax_c",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/extjoint"]["components"].push({
                name: "eax_d",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/extjoint"]["components"].push({
                name: "eax_e",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/extjoint"]["components"].push({
                name: "eax_f",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/jointtarget"] = getEmptyDataType();
            symbolTypeCache["RAPID/jointtarget"]["type"] = "jointtarget";
            symbolTypeCache["RAPID/jointtarget"]["url"] = "RAPID/jointtarget";
            symbolTypeCache["RAPID/jointtarget"]["isRecord"] = true;
            symbolTypeCache["RAPID/jointtarget"]["numberOfComponents"] = 2;
            symbolTypeCache["RAPID/jointtarget"]["components"] = [];
            symbolTypeCache["RAPID/jointtarget"]["components"].push({
                name: "robax",
                type: symbolTypeCache["RAPID/robjoint"]
            });
            symbolTypeCache["RAPID/jointtarget"]["components"].push({
                name: "extax",
                type: symbolTypeCache["RAPID/extjoint"]
            });
            symbolTypeCache["RAPID/pos"] = getEmptyDataType();
            symbolTypeCache["RAPID/pos"]["type"] = "pos";
            symbolTypeCache["RAPID/pos"]["url"] = "RAPID/pos";
            symbolTypeCache["RAPID/pos"]["isRecord"] = true;
            symbolTypeCache["RAPID/pos"]["numberOfComponents"] = 3;
            symbolTypeCache["RAPID/pos"]["components"] = [];
            symbolTypeCache["RAPID/pos"]["components"].push({
                name: "x",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/pos"]["components"].push({
                name: "y",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/pos"]["components"].push({
                name: "z",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/orient"] = getEmptyDataType();
            symbolTypeCache["RAPID/orient"]["type"] = "orient";
            symbolTypeCache["RAPID/orient"]["url"] = "RAPID/orient";
            symbolTypeCache["RAPID/orient"]["isRecord"] = true;
            symbolTypeCache["RAPID/orient"]["numberOfComponents"] = 4;
            symbolTypeCache["RAPID/orient"]["components"] = [];
            symbolTypeCache["RAPID/orient"]["components"].push({
                name: "q1",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/orient"]["components"].push({
                name: "q2",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/orient"]["components"].push({
                name: "q3",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/orient"]["components"].push({
                name: "q4",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/pose"] = getEmptyDataType();
            symbolTypeCache["RAPID/pose"]["type"] = "pose";
            symbolTypeCache["RAPID/pose"]["url"] = "RAPID/pose";
            symbolTypeCache["RAPID/pose"]["isRecord"] = true;
            symbolTypeCache["RAPID/pose"]["numberOfComponents"] = 2;
            symbolTypeCache["RAPID/pose"]["components"] = [];
            symbolTypeCache["RAPID/pose"]["components"].push({
                name: "trans",
                type: symbolTypeCache["RAPID/pos"]
            });
            symbolTypeCache["RAPID/pose"]["components"].push({
                name: "rot",
                type: symbolTypeCache["RAPID/orient"]
            });
            symbolTypeCache["RAPID/confdata"] = getEmptyDataType();
            symbolTypeCache["RAPID/confdata"]["type"] = "confdata";
            symbolTypeCache["RAPID/confdata"]["url"] = "RAPID/confdata";
            symbolTypeCache["RAPID/confdata"]["isRecord"] = true;
            symbolTypeCache["RAPID/confdata"]["numberOfComponents"] = 4;
            symbolTypeCache["RAPID/confdata"]["components"] = [];
            symbolTypeCache["RAPID/confdata"]["components"].push({
                name: "cf1",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/confdata"]["components"].push({
                name: "cf4",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/confdata"]["components"].push({
                name: "cf6",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/confdata"]["components"].push({
                name: "cfx",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/robtarget"] = getEmptyDataType();
            symbolTypeCache["RAPID/robtarget"]["type"] = "robtarget";
            symbolTypeCache["RAPID/robtarget"]["url"] = "RAPID/robtarget";
            symbolTypeCache["RAPID/robtarget"]["isRecord"] = true;
            symbolTypeCache["RAPID/robtarget"]["numberOfComponents"] = 4;
            symbolTypeCache["RAPID/robtarget"]["components"] = [];
            symbolTypeCache["RAPID/robtarget"]["components"].push({
                name: "trans",
                type: symbolTypeCache["RAPID/pos"]
            });
            symbolTypeCache["RAPID/robtarget"]["components"].push({
                name: "rot",
                type: symbolTypeCache["RAPID/orient"]
            });
            symbolTypeCache["RAPID/robtarget"]["components"].push({
                name: "robconf",
                type: symbolTypeCache["RAPID/confdata"]
            });
            symbolTypeCache["RAPID/robtarget"]["components"].push({
                name: "extax",
                type: symbolTypeCache["RAPID/extjoint"]
            });
            symbolTypeCache["RAPID/zonedata"] = getEmptyDataType();
            symbolTypeCache["RAPID/zonedata"]["type"] = "zonedata";
            symbolTypeCache["RAPID/zonedata"]["url"] = "RAPID/zonedata";
            symbolTypeCache["RAPID/zonedata"]["isRecord"] = true;
            symbolTypeCache["RAPID/zonedata"]["numberOfComponents"] = 7;
            symbolTypeCache["RAPID/zonedata"]["components"] = [];
            symbolTypeCache["RAPID/zonedata"]["components"].push({
                name: "finep",
                type: symbolTypeCache["RAPID/bool"]
            });
            symbolTypeCache["RAPID/zonedata"]["components"].push({
                name: "pzone_tcp",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/zonedata"]["components"].push({
                name: "pzone_ori",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/zonedata"]["components"].push({
                name: "pzone_eax",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/zonedata"]["components"].push({
                name: "zone_ori",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/zonedata"]["components"].push({
                name: "zone_leax",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/zonedata"]["components"].push({
                name: "zone_reax",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/wobjdata"] = getEmptyDataType();
            symbolTypeCache["RAPID/wobjdata"]["type"] = "wobjdata";
            symbolTypeCache["RAPID/wobjdata"]["url"] = "RAPID/wobjdata";
            symbolTypeCache["RAPID/wobjdata"]["isRecord"] = true;
            symbolTypeCache["RAPID/wobjdata"]["numberOfComponents"] = 5;
            symbolTypeCache["RAPID/wobjdata"]["components"] = [];
            symbolTypeCache["RAPID/wobjdata"]["components"].push({
                name: "robhold",
                type: symbolTypeCache["RAPID/bool"]
            });
            symbolTypeCache["RAPID/wobjdata"]["components"].push({
                name: "ufprog",
                type: symbolTypeCache["RAPID/bool"]
            });
            symbolTypeCache["RAPID/wobjdata"]["components"].push({
                name: "ufmec",
                type: symbolTypeCache["RAPID/string"]
            });
            symbolTypeCache["RAPID/wobjdata"]["components"].push({
                name: "uframe",
                type: symbolTypeCache["RAPID/pose"]
            });
            symbolTypeCache["RAPID/wobjdata"]["components"].push({
                name: "oframe",
                type: symbolTypeCache["RAPID/pose"]
            });
            symbolTypeCache["RAPID/loaddata"] = getEmptyDataType();
            symbolTypeCache["RAPID/loaddata"]["type"] = "loaddata";
            symbolTypeCache["RAPID/loaddata"]["url"] = "RAPID/loaddata";
            symbolTypeCache["RAPID/loaddata"]["isRecord"] = true;
            symbolTypeCache["RAPID/loaddata"]["numberOfComponents"] = 6;
            symbolTypeCache["RAPID/loaddata"]["components"] = [];
            symbolTypeCache["RAPID/loaddata"]["components"].push({
                name: "mass",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/loaddata"]["components"].push({
                name: "cog",
                type: symbolTypeCache["RAPID/pos"]
            });
            symbolTypeCache["RAPID/loaddata"]["components"].push({
                name: "aom",
                type: symbolTypeCache["RAPID/orient"]
            });
            symbolTypeCache["RAPID/loaddata"]["components"].push({
                name: "ix",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/loaddata"]["components"].push({
                name: "iy",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/loaddata"]["components"].push({
                name: "iz",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/tooldata"] = getEmptyDataType();
            symbolTypeCache["RAPID/tooldata"]["type"] = "tooldata";
            symbolTypeCache["RAPID/tooldata"]["url"] = "RAPID/tooldata";
            symbolTypeCache["RAPID/tooldata"]["isRecord"] = true;
            symbolTypeCache["RAPID/tooldata"]["numberOfComponents"] = 3;
            symbolTypeCache["RAPID/tooldata"]["components"] = [];
            symbolTypeCache["RAPID/tooldata"]["components"].push({
                name: "robhold",
                type: symbolTypeCache["RAPID/bool"]
            });
            symbolTypeCache["RAPID/tooldata"]["components"].push({
                name: "tframe",
                type: symbolTypeCache["RAPID/pose"]
            });
            symbolTypeCache["RAPID/tooldata"]["components"].push({
                name: "tload",
                type: symbolTypeCache["RAPID/loaddata"]
            });
            symbolTypeCache["RAPID/speeddata"] = getEmptyDataType();
            symbolTypeCache["RAPID/speeddata"]["type"] = "speeddata";
            symbolTypeCache["RAPID/speeddata"]["url"] = "RAPID/speeddata";
            symbolTypeCache["RAPID/speeddata"]["isRecord"] = true;
            symbolTypeCache["RAPID/speeddata"]["numberOfComponents"] = 4;
            symbolTypeCache["RAPID/speeddata"]["components"] = [];
            symbolTypeCache["RAPID/speeddata"]["components"].push({
                name: "v_tcp",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/speeddata"]["components"].push({
                name: "v_ori",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/speeddata"]["components"].push({
                name: "v_leax",
                type: symbolTypeCache["RAPID/num"]
            });
            symbolTypeCache["RAPID/speeddata"]["components"].push({
                name: "v_reax",
                type: symbolTypeCache["RAPID/num"]
            });
        };
        rd.removeSymbolTypes = function(task, module = "") {
            let symbolUrl = `RAPID/${task}/`;
            if (typeof module === "string" && module !== "") symbolUrl += module;
            let newDictionary = {};
            for (let item in symbolTypeCache) {
                if (item.startsWith(symbolUrl) == false) {
                    newDictionary[item] = symbolTypeCache[item];
                }
            }
            symbolTypeCache = newDictionary;
        };
        rd.getCachedSymbolTypeNames = function() {
            let keys = Object.keys(symbolTypeCache);
            return keys;
        };
        rd.getCachedSymbolType = function(type) {
            if (typeof symbolTypeCache[type] !== "undefined") return symbolTypeCache[type];
            return undefined;
        };
        rd.RapidData = new function() {
            this.Type = new function() {
                this.getType = function(rapidData) {
                    if (typeof rapidData.getDataType === "undefined") {
                        RWS.writeDebug("rapidData is not a valid Data object", 3);
                        return Promise.reject("rapidData is not a valid Data object");
                    }
                    return processData(rapidData);
                };
                function parseJSON(json) {
                    try {
                        return JSON.parse(json);
                    } catch (error) {
                        return undefined;
                    }
                }
                function copyProperties(fromObject) {
                    if (fromObject instanceof Object) {
                        let toObject = getEmptyDataType();
                        for (const property in fromObject) {
                            if (fromObject.hasOwnProperty(property)) {
                                if (Array.isArray(fromObject[property])) {
                                    toObject[property] = [];
                                    for (let iii = 0; iii < fromObject[property].length; iii++) {
                                        if (typeof fromObject[property][iii] === "number") {
                                            toObject[property].push(fromObject[property][iii]);
                                        } else {
                                            let dt = copyProperties(fromObject[property][iii]);
                                            toObject[property].push(dt);
                                        }
                                    }
                                } else {
                                    toObject[property] = fromObject[property];
                                }
                            }
                        }
                        return toObject;
                    } else {
                        throw new Error("Not a supported datatype.");
                    }
                }
                function processData(data) {
                    return getProperties(data.getTitle()).then(item => {
                        let datatype = processDataType(item);
                        return Promise.resolve(datatype);
                    }).catch(err => Promise.reject(`Failed to parse data. >>> ${err}`));
                }
                async function processDataType(item) {
                    let datatype = getEmptyDataType();
                    if (symbolTypeCache.hasOwnProperty(item.symburl)) {
                        datatype = copyProperties(symbolTypeCache[item.symburl]);
                        return datatype;
                    }
                    switch (item.symtyp) {
                      case "atm":
                        datatype["isAtomic"] = true;
                        datatype["type"] = item.name;
                        datatype["url"] = item.symburl;
                        symbolTypeCache[item.symburl] = copyProperties(datatype);
                        break;

                      case "con":
                      case "var":
                      case "per":
                        let subitem1 = await getProperties(item.typurl);
                        datatype = await processDataType(subitem1);
                        datatype["type"] = item.dattyp;
                        datatype["url"] = item.symburl;
                        datatype["isArray"] = item.ndim !== "0";
                        if (datatype["isArray"] === true) {
                            datatype["dimensions"] = [];
                            let splits = item.dim.trim().split(" ");
                            for (const s of splits) {
                                datatype["dimensions"].push(parseInt(s));
                            }
                        }
                        symbolTypeCache[item.symburl] = copyProperties(datatype);
                        break;

                      case "ali":
                        datatype["type"] = item.name;
                        datatype["isAlias"] = true;
                        datatype["aliasTypeUrl"] = item.typurl;
                        if (symbolTypeCache.hasOwnProperty(item.typurl) === false) {
                            let subitem2 = await getProperties(item.typurl);
                            await processDataType(subitem2);
                        }
                        datatype["url"] = item.symburl;
                        symbolTypeCache[item.symburl] = copyProperties(datatype);
                        break;

                      case "rcp":
                        let subitem3 = await getProperties(item.typurl);
                        datatype = await processDataType(subitem3);
                        datatype["type"] = item.dattyp;
                        datatype["url"] = item.symburl;
                        symbolTypeCache[item.symburl] = copyProperties(datatype);
                        break;

                      case "rec":
                        datatype["type"] = item.name;
                        datatype["isRecord"] = true;
                        datatype["numberOfComponents"] = parseInt(item.ncom);
                        try {
                            let x1 = await getRecordComponents(item.symburl);
                            datatype["components"] = x1;
                        } catch (err) {
                            console.warn(err);
                        }
                        datatype["url"] = item.symburl;
                        symbolTypeCache[item.symburl] = copyProperties(datatype);
                        break;

                      default:
                        datatype["type"] = "unknown";
                    }
                    return datatype;
                }
                function getProperties(symbolUrl) {
                    let url = "/rw/rapid/symbol/" + encodeURIComponent(symbolUrl) + "/properties";
                    return RWS.Network.get(url).then(x1 => {
                        let obj = parseJSON(x1.responseText);
                        if (obj.hasOwnProperty("_embedded")) {
                            for (const item of obj._embedded.resources) {
                                switch (item._type) {
                                  case "rap-sympropconstant":
                                  case "rap-sympropvar":
                                  case "rap-symproppers":
                                  case "rap-sympropalias":
                                  case "rap-symproprecord":
                                  case "rap-sympropreccomp-li":
                                  case "rap-sympropatomic":
                                    return Promise.resolve(item);

                                  default:
                                    continue;
                                }
                            }
                        } else if (obj.hasOwnProperty("state")) {
                            for (const item of obj.state) {
                                switch (item._type) {
                                  case "rap-sympropconstant":
                                  case "rap-sympropvar":
                                  case "rap-symproppers":
                                  case "rap-sympropalias":
                                  case "rap-symproprecord":
                                  case "rap-sympropreccomp-li":
                                  case "rap-sympropatomic":
                                    return Promise.resolve(item);

                                  default:
                                    continue;
                                }
                            }
                        }
                        return Promise.reject("No valid datatype found.");
                    }).catch(x2 => Promise.reject(x2));
                }
                async function getRecordComponents(symbolUrl) {
                    const doSearch = (url, body, symbols) => {
                        if (url === "") return Promise.resolve(symbols);
                        return RWS.Network.post(url, body).then(async res => {
                            let obj = null;
                            try {
                                obj = JSON.parse(res.responseText);
                            } catch (error) {
                                return Promise.reject("Could not parse JSON response from RWS");
                            }
                            if (obj._links.hasOwnProperty("next")) {
                                url = "/rw/rapid/" + obj._links["next"].href;
                            } else {
                                url = "";
                            }
                            if (obj.hasOwnProperty("_embedded") && obj["_embedded"].hasOwnProperty("resources")) {
                                for (const item of obj._embedded.resources) {
                                    if (item._type === "rap-sympropreccomp-li" && item.symburl.startsWith(symbolUrl + "/")) {
                                        symbols.push(item);
                                    }
                                }
                            }
                            return doSearch(url, body, symbols);
                        }).catch(err => Promise.reject(err));
                    };
                    let components = [];
                    try {
                        let url = "/rw/rapid/symbols/search";
                        let body = "";
                        let splits = symbolUrl.split("/");
                        if (splits.length <= 2) body = `view=block&blockurl=RAPID&symtyp=rcp&recursive=TRUE&skipshared=FALSE&onlyused=FALSE`; else body = `view=block&blockurl=${encodeURIComponent(symbolUrl)}&symtyp=rcp&recursive=FALSE&skipshared=FALSE&onlyused=FALSE`;
                        let items = await doSearch(url, body, []);
                        let temp = items.sort((x1, x2) => parseInt(x1.comnum) - parseInt(x2.comnum));
                        for (const item of temp) {
                            let subType = await processDataType(item);
                            components.push({
                                name: item.name,
                                type: subType
                            });
                        }
                    } catch (err) {
                        return Promise.reject(`Could not read record components >>> ${err}`);
                    }
                    return Promise.resolve(components);
                }
            }();
            this.Value = new function() {
                this.parseRawValue = function(rapidType, value) {
                    if (rapidType === null || typeof rapidType !== "object") {
                        let err = "rapidType is not a valid data type object";
                        RWS.writeDebug(err, 3);
                        return Promise.reject(err);
                    }
                    if (value === null || typeof value !== "string") {
                        let err = "value is not a valid string";
                        RWS.writeDebug(err, 3);
                        return Promise.reject(err);
                    }
                    return parseData(rapidType, value);
                };
                async function parseData(rapidType, dataValue) {
                    try {
                        let aliasType = {};
                        if (rapidType.isAlias) {
                            if (symbolTypeCache.hasOwnProperty(rapidType.aliasTypeUrl)) {
                                aliasType = symbolTypeCache[rapidType.aliasTypeUrl];
                            } else {
                                return Promise.reject("Could not parse data. Illegal alias value.");
                            }
                        }
                        if (rapidType.isArray) {
                            let tempType = rapidType;
                            if (rapidType.isAlias) {
                                tempType.isAlias = false;
                                tempType.aliasTypeUrl = "";
                                tempType.isArray = aliasType.isArray;
                                tempType.isAtomic = aliasType.isAtomic;
                                tempType.isRecord = aliasType.isRecord;
                                if (tempType.isRecord) tempType.components = aliasType.components;
                                tempType.type = aliasType.type;
                            }
                            if (rapidType.dimensions.length === 1) {
                                return await parseArray(tempType, dataValue);
                            }
                            return await parseMatrix(tempType, dataValue);
                        }
                        if (rapidType.isRecord || rapidType.isAlias && aliasType.isRecord) {
                            let dataType = rapidType.isAlias ? aliasType : rapidType;
                            return await parseRecord(dataType, dataValue);
                        }
                        if (rapidType.isAtomic || rapidType.isAlias && aliasType.isAtomic) {
                            let dataType = rapidType.isAlias ? aliasType : rapidType;
                            switch (dataType.type) {
                              case "num":
                              case "dnum":
                                return Promise.resolve(parseFloat(dataValue));

                              case "string":
                                return Promise.resolve(RWS.RapidData.String.cleanupString(dataValue));

                              case "bool":
                                let b = dataValue.toUpperCase() == "TRUE";
                                return Promise.resolve(b);

                              default:
                                return Promise.reject("Could not parse data. Illegal atomic value.");
                            }
                        }
                        return Promise.reject("Unknown data type.");
                    } catch (err) {
                        return Promise.reject(`parseData failed >>> ${err}`);
                    }
                }
                async function parseArray(dataType, valueString) {
                    let s = valueString.replace(/^\[/g, "").replace(/\]$/g, "");
                    if (dataType.isRecord) {
                        let recordValues = await parseRecordArray(dataType, valueString.trim());
                        return Promise.resolve(recordValues);
                    }
                    if (dataType.isAtomic) {
                        switch (dataType.type) {
                          case "num":
                          case "dnum":
                            let numSplits = s.split(",");
                            let numValues = [];
                            for (const value of numSplits) {
                                numValues.push(parseFloat(value));
                            }
                            return Promise.resolve(numValues);

                          case "string":
                            let stringValues = await parseStringArray(valueString.trim());
                            return Promise.resolve(stringValues);

                          case "bool":
                            let boolSplits = s.split(",");
                            let boolValues = [];
                            for (const value of boolSplits) {
                                let b = value.toUpperCase() == "TRUE";
                                boolValues.push(b);
                            }
                            return Promise.resolve(boolValues);

                          default:
                            return Promise.reject("Could not parse data. Illegal array value.");
                        }
                    }
                }
                async function parseMatrix(dataType, valueString) {
                    if (dataType.isRecord) {
                        let matrixValues = await parseRecordMatrix(dataType, valueString.trim());
                        return Promise.resolve(matrixValues);
                    }
                    switch (dataType.type) {
                      case "num":
                      case "dnum":
                        let numValues = parseNumMatrix(valueString, dataType.dimensions);
                        return Promise.resolve(numValues);

                      case "string":
                        let stringValues = parseStringMatrix(valueString.trim(), dataType.dimensions);
                        return Promise.resolve(stringValues);

                      case "bool":
                        let boolValues = parseBoolMatrix(valueString, dataType.dimensions);
                        return Promise.resolve(boolValues);

                      default:
                        return Promise.reject("Could not parse data. Illegal array value.");
                    }
                }
                const groupObjects = (collection, count) => collection.reduce((acc, curr, idx) => (idx % count == 0 ? acc.push([ curr ]) : acc[acc.length - 1].push(curr)) && acc, []);
                function parseBoolMatrix(valueString, dimensions) {
                    let boolMatrix = valueString.replace(/\[/g, "").replace(/\]/g, "").split(",");
                    for (let iii = 0; iii < boolMatrix.length; iii++) {
                        boolMatrix[iii] = boolMatrix[iii].toUpperCase() == "TRUE";
                    }
                    for (let iii = dimensions.length; iii >= 1; iii--) {
                        boolMatrix = groupObjects(boolMatrix, dimensions[iii - 1]);
                    }
                    return boolMatrix[0];
                }
                function parseNumMatrix(valueString, dimensions) {
                    let numMatrix = valueString.replace(/\[/g, "").replace(/\]/g, "").split(",");
                    for (let iii = 0; iii < numMatrix.length; iii++) {
                        numMatrix[iii] = parseFloat(numMatrix[iii]);
                    }
                    for (let iii = dimensions.length; iii >= 1; iii--) {
                        numMatrix = groupObjects(numMatrix, dimensions[iii - 1]);
                    }
                    return numMatrix[0];
                }
                function parseStringMatrix(valueString, dimensions) {
                    let stringMatrix = parseStringArray(valueString);
                    for (let iii = dimensions.length; iii >= 1; iii--) {
                        stringMatrix = groupObjects(stringMatrix, dimensions[iii - 1]);
                    }
                    return stringMatrix[0];
                }
                function parseStringArray(valueString) {
                    let text = valueString.trim();
                    let extractedStrings = [];
                    let even = true;
                    let n = 0;
                    let start = -1;
                    while (n >= 0) {
                        n = text.indexOf('"', n);
                        if (n >= 0) {
                            if (start === -1) start = n;
                            even = even === false;
                            if (even === true && (text[n + 1] === "]" || text[n + 1] === ",")) {
                                let s = text.substring(start + 1, n);
                                extractedStrings.push(s);
                                start = -1;
                            }
                            n++;
                        }
                    }
                    return extractedStrings;
                }
                function getRandomString(length, text) {
                    const r = max => {
                        return Math.floor(Math.random() * Math.floor(max));
                    };
                    const x = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                    let c = "";
                    for (let iii = 0; iii < length; iii++) c += x[r(x.length)];
                    if (text === null || text === "") return c;
                    while (text.includes(c) == true) {
                        for (let iii = 0; iii < length; iii++) c += x[r(x.length)];
                    }
                    return c;
                }
                async function getElements(valueString) {
                    try {
                        let rndStr = getRandomString(5, valueString);
                        const rndTemplate = index => {
                            return `${rndStr}_${index}_`;
                        };
                        let text = valueString.trim();
                        let replacedStrings = {};
                        let idx = 0;
                        let even = true;
                        let n = 0;
                        let start = -1;
                        while (n >= 0) {
                            n = text.indexOf('"', n);
                            if (n >= 0) {
                                if (start === -1) start = n;
                                even = even === false;
                                if (even === true && (text[n + 1] === "]" || text[n + 1] === ",")) {
                                    let s = text.substring(start, n + 1);
                                    let r = rndTemplate(idx++);
                                    replacedStrings[r] = s;
                                    text = text.replace(s, r);
                                    n += r.length - s.length;
                                    start = -1;
                                }
                                n++;
                            }
                        }
                        let components = text.replace(/\[/g, "").replace(/\]/g, "").split(",");
                        let retVal = {
                            components: components,
                            replacedStrings: replacedStrings
                        };
                        return Promise.resolve(retVal);
                    } catch (err) {
                        return Promise.reject(`getComponents failed >>> ${err}`);
                    }
                }
                async function parseRecordArray(dataType, valueString) {
                    try {
                        let elements = await getElements(valueString);
                        let array = [];
                        for (let iii = 0; iii < dataType.dimensions[0]; iii++) {
                            let record = {};
                            for (let jjj = 0; jjj < dataType.components.length; jjj++) {
                                record[dataType.components[jjj].name] = await parseComponentData(dataType.components[jjj].type, elements.components, elements.replacedStrings);
                            }
                            array.push(record);
                        }
                        return Promise.resolve(array);
                    } catch (err) {
                        return Promise.reject(`parseRecordArray failed >>> ${err}`);
                    }
                }
                async function parseRecordMatrix(dataType, valueString) {
                    try {
                        let elements = await getElements(valueString);
                        let count = 1;
                        for (let x1 = 0; x1 < dataType.dimensions.length; x1++) {
                            count *= dataType.dimensions[x1];
                        }
                        let matrix = [];
                        for (let x2 = 0; x2 < count; x2++) {
                            let record = {};
                            for (let x3 = 0; x3 < dataType.components.length; x3++) {
                                record[dataType.components[x3].name] = await parseComponentData(dataType.components[x3].type, elements.components, elements.replacedStrings);
                            }
                            matrix.push(record);
                        }
                        for (let x4 = dataType.dimensions.length; x4 >= 1; x4--) {
                            matrix = groupObjects(matrix, dataType.dimensions[x4 - 1]);
                        }
                        return Promise.resolve(matrix[0]);
                    } catch (err) {
                        return Promise.reject(`parseRecordMatrix failed >>> ${err}`);
                    }
                }
                async function parseRecord(dataType, valueString) {
                    try {
                        if (dataType.isAlias) {
                            if (symbolTypeCache.hasOwnProperty(dataType.aliasTypeUrl)) {
                                let type = symbolTypeCache[dataType.aliasTypeUrl];
                                return parseRecord(type, valueString);
                            }
                            return Promise.reject("Could not parse record data. Illegal alias value.");
                        }
                        let elements = await getElements(valueString);
                        let record = {};
                        for (let iii = 0; iii < dataType.components.length; iii++) {
                            record[dataType.components[iii].name] = await parseComponentData(dataType.components[iii].type, elements.components, elements.replacedStrings);
                        }
                        return Promise.resolve(record);
                    } catch (err) {
                        return Promise.reject(`parseRecord failed >>> ${err}`);
                    }
                }
                async function parseComponentData(dataType, components, replacedStrings) {
                    try {
                        if (dataType.isAlias) {
                            if (symbolTypeCache.hasOwnProperty(dataType.aliasTypeUrl)) {
                                let type = symbolTypeCache[dataType.aliasTypeUrl];
                                return parseComponentData(type, components, replacedStrings);
                            }
                            return Promise.reject("Could not parse data. Illegal alias value.");
                        }
                        if (dataType.isRecord) {
                            let record = {};
                            for (let iii = 0; iii < dataType.components.length; iii++) {
                                record[dataType.components[iii].name] = await parseComponentData(dataType.components[iii].type, components, replacedStrings);
                            }
                            return Promise.resolve(record);
                        }
                        if (dataType.isAtomic) {
                            let component = components.shift();
                            switch (dataType.type) {
                              case "num":
                              case "dnum":
                                return Promise.resolve(parseFloat(component));

                              case "string":
                                return Promise.resolve(RWS.RapidData.String.cleanupString(replacedStrings[component]));

                              case "bool":
                                let b = component.toUpperCase() == "TRUE";
                                return Promise.resolve(b);

                              default:
                                return Promise.reject("Could not parse data. Illegal atomic value.");
                            }
                        }
                        return Promise.reject("Unknown data type.");
                    } catch (err) {
                        return Promise.reject(`parseComponentData failed >>> ${err}`);
                    }
                }
                this.setValue = function(rapidData, value) {
                    if (typeof rapidData.getDataType === "undefined") {
                        let err = "rapidData is not a valid Data object";
                        RWS.writeDebug(err, 3);
                        return Promise.reject(err);
                    }
                    return rapidData.setValue(value);
                };
            }();
            this.String = new function() {
                this.cleanupString = function(rapidString) {
                    let jsString = "";
                    try {
                        jsString = rapidString.replace(/^"/g, "").replace(/"$/g, "");
                        jsString = jsString.replace(/\\\\/g, "\\");
                        jsString = jsString.replace(/""/g, '"');
                    } catch (err) {
                        jsString = "";
                    }
                    return jsString;
                };
                this.stringify = function(value, s = "") {
                    try {
                        if (typeof value !== "object") {
                            let temp = value.toString();
                            if (typeof value === "string") {
                                temp = temp.replace(/\\/g, "\\\\");
                                temp = temp.replace(/\"/g, '""');
                                temp = `"${temp}"`;
                            }
                            s += temp;
                        } else {
                            s += "[";
                            for (let item in value) {
                                s = this.stringify(value[item], s) + ",";
                            }
                            s = s.slice(0, -1);
                            s += "]";
                        }
                        return s;
                    } catch (error) {
                        RWS.writeDebug(`stringify failed to make a string of '${value.toString()}' >>> ${error}`);
                    }
                };
            }();
        }();
        rd.constructedRapidData = true;
    })(RWS);
}