
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-Filesystemdialog-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Filesystemdialog_A")) {
        o.Filesystemdialog_A = class {
            constructor() {}
            static select(selectionMode = `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`, fileSystemObjectType = `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`, textHeading = null, validFileEndings = null, defaultFolderPath = `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}`) {
                if (selectionMode !== `${FPComponents.Filesystemdialog_A.SelectionMode.Single}` && selectionMode !== `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
                    throw new Error("FpComponents.Filesystemdialog_A.select() - Argument: 'selectionMode' is invalid");
                }
                if (fileSystemObjectType !== `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}` && fileSystemObjectType !== `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`) {
                    throw new Error("FpComponents.Filesystemdialog_A.select() - Argument: 'fileSystemObjectType' is invalid.");
                }
                return new Promise(async (resolve, reject) => {
                    let bgDiv;
                    let dialogHeading;
                    let rootFolderDivs = [];
                    let dropDownSort;
                    let btnParent;
                    let btnRefresh;
                    let btnFolderSelectDiv;
                    let btnFolderSelect;
                    let pathBreadCrumbsDiv;
                    let folderContentTable;
                    let selectionLabelDiv;
                    let selectionCountDiv;
                    let selectionNameDiv;
                    let btnCancel;
                    let btnConfirm;
                    let selectionDropdown;
                    let currentFolderPath = `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}`;
                    let multiSelectFolders = false;
                    let prevSelectedSortIndex = -1;
                    let fullPathSingleSelect = "";
                    createConstantDom();
                    createDynamicDom();
                    setupCommonEventListeners();
                    updateSelectionStates();
                    await updateCurrentFolder(currentFolderPath);
                    await updateCurrentFolder(defaultFolderPath);
                    btnCancel.onclick = () => {
                        resolve(null);
                        bgDiv.remove();
                    };
                    btnConfirm.onclick = () => {
                        if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
                            resolve(selectionDropdown.model.items);
                        } else {
                            resolve([ fullPathSingleSelect ]);
                        }
                        bgDiv.remove();
                    };
                    function createConstantDom() {
                        bgDiv = document.createElement("div");
                        bgDiv.className = "fp-components-filesystemdialog-bg";
                        bgDiv.style.display = "flex";
                        let mainDiv = document.createElement("div");
                        mainDiv.className = "fp-components-filesystemdialog-main";
                        let topDiv = document.createElement("div");
                        topDiv.className = "fp-components-filesystemdialog-top";
                        dialogHeading = document.createElement("div");
                        dialogHeading.className = "fp-components-filesystemdialog-heading";
                        let midDiv = document.createElement("div");
                        midDiv.className = "fp-components-filesystemdialog-mid";
                        let midLeftDiv = document.createElement("div");
                        midLeftDiv.className = "fp-components-filesystemdialog-mid-left";
                        let rootFoldersDiv = document.createElement("div");
                        rootFoldersDiv.className = "fp-components-filesystemdialog-root-folder";
                        let rootFolderTopicDiv = document.createElement("div");
                        rootFolderTopicDiv.className = "fp-components-filesystemdialog-root-folder-topic";
                        rootFolderTopicDiv.textContent = "Root folders";
                        let rootFolderListDiv = document.createElement("div");
                        rootFolderListDiv.className = "fp-components-filesystemdialog-root-folder-list";
                        let rootFolderHomeIcon = document.createElement("img");
                        rootFolderHomeIcon.src = "fp-components/img/folder.png";
                        rootFolderHomeIcon.className = "fp-components-filesystemdialog-root-folder-icon";
                        let rootFolderHomeDiv = document.createElement("div");
                        rootFolderHomeDiv.className = "fp-components-filesystemdialog-root-folder-list-item";
                        let rootFolderHomeLabel = document.createElement("div");
                        rootFolderHomeLabel.className = "fp-components-filesystemdialog-root-folder-label";
                        rootFolderHomeLabel.textContent = "HOME";
                        rootFolderHomeDiv.appendChild(rootFolderHomeIcon);
                        rootFolderHomeDiv.appendChild(rootFolderHomeLabel);
                        let rootFolderTempIcon = document.createElement("img");
                        rootFolderTempIcon.src = "fp-components/img/folder.png";
                        rootFolderTempIcon.className = "fp-components-filesystemdialog-root-folder-icon";
                        let rootFolderTempDiv = document.createElement("div");
                        rootFolderTempDiv.className = "fp-components-filesystemdialog-root-folder-list-item";
                        let rootFolderTempLabel = document.createElement("div");
                        rootFolderTempLabel.className = "fp-components-filesystemdialog-root-folder-label";
                        rootFolderTempLabel.textContent = "TEMP";
                        rootFolderTempDiv.appendChild(rootFolderTempIcon);
                        rootFolderTempDiv.appendChild(rootFolderTempLabel);
                        let rootFolderBackupIcon = document.createElement("img");
                        rootFolderBackupIcon.src = "fp-components/img/folder.png";
                        rootFolderBackupIcon.className = "fp-components-filesystemdialog-root-folder-icon";
                        let rootFolderBackupDiv = document.createElement("div");
                        rootFolderBackupDiv.className = "fp-components-filesystemdialog-root-folder-list-item";
                        let rootFolderBackupLabel = document.createElement("div");
                        rootFolderBackupLabel.className = "fp-components-filesystemdialog-root-folder-label";
                        rootFolderBackupLabel.textContent = "BACKUP";
                        rootFolderBackupDiv.appendChild(rootFolderBackupIcon);
                        rootFolderBackupDiv.appendChild(rootFolderBackupLabel);
                        let midRightDiv = document.createElement("div");
                        midRightDiv.className = "fp-components-filesystemdialog-mid-right";
                        let navigationDiv = document.createElement("div");
                        navigationDiv.className = "fp-components-filesystemdialog-navigation";
                        let dropDownSortDiv = document.createElement("div");
                        dropDownSortDiv.className = "fp-components-filesystemdialog-sort";
                        dropDownSort = new FPComponents.Dropdown_A();
                        dropDownSort.attachToElement(dropDownSortDiv);
                        dropDownSort.selected = 0;
                        prevSelectedSortIndex = -1;
                        dropDownSort.model = {
                            items: [ "Name", "Byte size", "Created", "Modified" ]
                        };
                        let btnParentDiv = document.createElement("div");
                        btnParentDiv.className = "fp-components-filesystemdialog-navigation-button";
                        btnParent = new FPComponents.Button_A();
                        btnParent.text = "Navigate up";
                        btnParent.attachToElement(btnParentDiv);
                        let btnRefreshDiv = document.createElement("div");
                        btnRefreshDiv.className = "fp-components-filesystemdialog-navigation-button";
                        btnRefresh = new FPComponents.Button_A();
                        btnRefresh.text = "Refresh";
                        btnRefresh.attachToElement(btnRefreshDiv);
                        btnFolderSelectDiv = document.createElement("div");
                        btnFolderSelectDiv.className = "fp-components-filesystemdialog-navigation-button";
                        btnFolderSelect = new FPComponents.Button_A();
                        btnFolderSelect.text = "Select folders";
                        btnFolderSelect.attachToElement(btnFolderSelectDiv);
                        pathBreadCrumbsDiv = document.createElement("div");
                        pathBreadCrumbsDiv.className = "fp-components-filesystemdialog-navigation-breadcrumbs";
                        let tableScrollDiv = document.createElement("div");
                        tableScrollDiv.className = "fp-components-filesystemdialog-table-scroll";
                        folderContentTable = document.createElement("table");
                        folderContentTable.className = "fp-components-filesystemdialog-folder-content";
                        let botDiv = document.createElement("div");
                        botDiv.className = "fp-components-filesystemdialog-bot";
                        let selectionDiv = document.createElement("div");
                        selectionDiv.className = "fp-components-filesystemdialog-file-selection";
                        selectionLabelDiv = document.createElement("div");
                        selectionLabelDiv.className = "fp-components-filesystemdialog-file-selection-label";
                        selectionLabelDiv.textContent = "Selected file:";
                        selectionCountDiv = document.createElement("div");
                        selectionCountDiv.className = "fp-components-filesystemdialog-file-selection-count";
                        selectionCountDiv.textContent = "[0]";
                        selectionNameDiv = document.createElement("div");
                        let mainButtonDiv = document.createElement("div");
                        mainButtonDiv.className = "fp-components-filesystemdialog-buttons";
                        let btnConfirmDiv = document.createElement("div");
                        btnConfirmDiv.className = "fp-components-filesystemdialog-button";
                        btnConfirm = new FPComponents.Button_A();
                        btnConfirm.text = "Confirm";
                        btnConfirm.highlight = true;
                        btnConfirm.attachToElement(btnConfirmDiv);
                        btnConfirm.enabled = false;
                        let btnCancelDiv = document.createElement("div");
                        btnCancelDiv.className = "fp-components-filesystemdialog-button";
                        btnCancel = new FPComponents.Button_A();
                        btnCancel.text = "Cancel";
                        btnCancel.attachToElement(btnCancelDiv);
                        rootFolderDivs = [];
                        rootFolderDivs.push(rootFolderHomeDiv);
                        rootFolderDivs.push(rootFolderTempDiv);
                        rootFolderDivs.push(rootFolderBackupDiv);
                        multiSelectFolders = false;
                        document.body.appendChild(bgDiv);
                        bgDiv.appendChild(mainDiv);
                        mainDiv.appendChild(topDiv);
                        topDiv.appendChild(dialogHeading);
                        mainDiv.appendChild(pathBreadCrumbsDiv);
                        mainDiv.appendChild(midDiv);
                        midDiv.appendChild(midLeftDiv);
                        midLeftDiv.appendChild(rootFoldersDiv);
                        rootFoldersDiv.appendChild(rootFolderTopicDiv);
                        rootFoldersDiv.appendChild(rootFolderListDiv);
                        rootFolderListDiv.appendChild(rootFolderHomeDiv);
                        rootFolderListDiv.appendChild(rootFolderTempDiv);
                        rootFolderListDiv.appendChild(rootFolderBackupDiv);
                        midDiv.appendChild(midRightDiv);
                        midRightDiv.appendChild(navigationDiv);
                        navigationDiv.appendChild(dropDownSortDiv);
                        navigationDiv.appendChild(btnParentDiv);
                        navigationDiv.appendChild(btnRefreshDiv);
                        navigationDiv.appendChild(btnFolderSelectDiv);
                        tableScrollDiv.appendChild(folderContentTable);
                        midRightDiv.appendChild(tableScrollDiv);
                        mainDiv.appendChild(botDiv);
                        botDiv.appendChild(selectionLabelDiv);
                        botDiv.appendChild(selectionCountDiv);
                        botDiv.appendChild(selectionNameDiv);
                        botDiv.appendChild(mainButtonDiv);
                        mainButtonDiv.appendChild(btnCancelDiv);
                        mainButtonDiv.appendChild(btnConfirmDiv);
                    }
                    function createDynamicDom() {
                        btnFolderSelectDiv.style.display = "none";
                        if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
                            selectionNameDiv.className = "fp-components-filesystemdialog-selection-name-dropdown";
                            selectionDropdown = new FPComponents.Dropdown_A();
                            selectionDropdown.attachToElement(selectionNameDiv);
                            selectionDropdown.model = {
                                items: []
                            };
                            selectionDropdown.leftTruncate = true;
                        } else {
                            selectionNameDiv.className = "fp-components-filesystemdialog-selection-name-field";
                        }
                        if (fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`) {
                            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                                textHeading === null ? dialogHeading.textContent = "Select a file" : dialogHeading.textContent = textHeading;
                                selectionLabelDiv.textContent = "Selected file";
                            } else {
                                textHeading === null ? dialogHeading.textContent = "Select files" : dialogHeading.textContent = textHeading;
                                selectionLabelDiv.textContent = "Selected files";
                            }
                        } else {
                            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                                textHeading === null ? dialogHeading.textContent = "Select a folder" : dialogHeading.textContent = textHeading;
                                selectionLabelDiv.textContent = "Selected folder";
                            } else {
                                textHeading === null ? dialogHeading.textContent = "Select folders" : dialogHeading.textContent = textHeading;
                                selectionLabelDiv.textContent = "Selected folders";
                                btnFolderSelectDiv.style.display = "block";
                                btnFolderSelectDiv.style.width = "150px";
                                btnFolderSelect.text = "Enable selection";
                                btnFolderSelect.onclick = () => {
                                    multiSelectFolders = !multiSelectFolders;
                                    if (multiSelectFolders) {
                                        btnFolderSelect.text = "Disable selection";
                                    } else {
                                        btnFolderSelect.text = "Enable selection";
                                    }
                                };
                            }
                        }
                    }
                    function setupCommonEventListeners() {
                        rootFolderDivs.forEach(clickedDiv => {
                            clickedDiv.onclick = async () => {
                                if (multiSelectFolders) {
                                    const rootFolderPath = "$" + clickedDiv.textContent;
                                    if (clickedDiv.className.includes("fp-components-filesystemdialog-root-folder-list-item-active")) {
                                        clickedDiv.className = "fp-components-filesystemdialog-root-folder-list-item";
                                        const index = selectionDropdown.model.items.indexOf(rootFolderPath);
                                        if (index >= 0) {
                                            selectionDropdown.model.items.splice(index, 1);
                                        }
                                        if (selectionDropdown.model.items.length > 0) {
                                            selectionDropdown.selected = 0;
                                        }
                                    } else {
                                        clickedDiv.className = "fp-components-filesystemdialog-root-folder-list-item-active";
                                        selected = true;
                                        if (!selectionDropdown.model.items.includes(rootFolderPath)) {
                                            selectionDropdown.model.items.push(rootFolderPath);
                                            const index = selectionDropdown.model.items.indexOf(rootFolderPath);
                                            selectionDropdown.selected = index;
                                        }
                                    }
                                    selectionDropdown.model = selectionDropdown.model;
                                    updateSelectionStates();
                                } else {
                                    switch (clickedDiv.textContent.toLowerCase()) {
                                      case "home":
                                        await updateCurrentFolder(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}`);
                                        break;

                                      case "temp":
                                        await updateCurrentFolder(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_TEMP}`);
                                        break;

                                      case "backup":
                                        await updateCurrentFolder(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_BACKUP}`);
                                        break;

                                      default:
                                        break;
                                    }
                                }
                            };
                        });
                        dropDownSort.onselection = (selectedIndex, selectedText) => {
                            sortFolderContent(selectedIndex, selectedText);
                        };
                        btnRefresh.onclick = async () => {
                            await updateCurrentFolder();
                        };
                        btnParent.onclick = () => {
                            navigateToParentFolder();
                        };
                        if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
                            selectionDropdown.onselection = async function(selectedIndex, selectedPath) {
                                await navigateToFolder(selectedPath);
                            };
                        } else {
                            selectionNameDiv.onclick = async function() {
                                await navigateToFolder(fullPathSingleSelect);
                            };
                        }
                    }
                    function updateSelectionStates() {
                        if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                            if (fullPathSingleSelect === null || fullPathSingleSelect === undefined) {
                                fullPathSingleSelect = "";
                            }
                            if (fullPathSingleSelect.length < 1) {
                                btnConfirm.enabled = false;
                            } else {
                                btnConfirm.enabled = true;
                            }
                            if (fullPathSingleSelect.length > 0) {
                                selectionCountDiv.textContent = "[1]";
                            } else {
                                selectionCountDiv.textContent = "[0]";
                            }
                        } else {
                            if (selectionDropdown.model.items.length < 1) {
                                btnConfirm.enabled = false;
                            } else {
                                btnConfirm.enabled = true;
                            }
                            if (selectionDropdown.selected < 0 || selectionDropdown.selected > selectionDropdown.model.items.length - 1) {
                                selectionDropdown.selected = 0;
                            }
                            selectionDropdown.enabled = selectionDropdown.model.items.length > 0;
                            selectionCountDiv.textContent = "[" + selectionDropdown.model.items.length + "]";
                        }
                    }
                    async function navigateToFolder(fileSystemObjectPath) {
                        try {
                            let targetFolder = fileSystemObjectPath.substring(0, fileSystemObjectPath.lastIndexOf("/"));
                            if (typeof targetFolder !== "string" || targetFolder.length < 1) {
                                targetFolder = fileSystemObjectPath;
                            }
                            if (targetFolder !== currentFolderPath) {
                                await updateCurrentFolder(targetFolder);
                            }
                        } catch (err) {
                            return;
                        }
                    }
                    async function updateCurrentFolder(newFolderPath = null) {
                        let prevFolderPath = currentFolderPath;
                        let directory = null;
                        let directoryContent = [];
                        if (newFolderPath !== null) {
                            try {
                                while (newFolderPath.length > 0 && (newFolderPath.charAt(newFolderPath.length - 1) === "\\" || newFolderPath.charAt(newFolderPath.length - 1) === "/")) {
                                    newFolderPath = newFolderPath.slice(0, newFolderPath.length - 1);
                                }
                                currentFolderPath = newFolderPath;
                            } catch (error) {}
                        }
                        try {
                            directory = await RWS.FileSystem.getDirectory(currentFolderPath);
                            directoryContent = await directory.getContents();
                            if (!newFolderPath.toLowerCase().includes(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}`.toLowerCase()) && !newFolderPath.toLowerCase().includes(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_TEMP}`.toLowerCase()) && !newFolderPath.toLowerCase().includes(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_BACKUP}`.toLowerCase())) {
                                throw new Error("Invalid root folder.");
                            }
                        } catch (errFetchContent) {
                            currentFolderPath = prevFolderPath;
                            return;
                        }
                        let isFile = fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`;
                        if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                            let exist = await fileSystemObjectExists(fullPathSingleSelect, isFile);
                            if (!exist) {
                                fullPathSingleSelect = "";
                                selectionNameDiv.textContent = fullPathSingleSelect;
                                updateSelectionStates();
                            }
                        } else {
                            let pathsToRemove = [];
                            for (let i = 0; i < selectionDropdown.model.items.length; i++) {
                                const fileSysObjPath = selectionDropdown.model.items[i];
                                let exist = await fileSystemObjectExists(fileSysObjPath, isFile);
                                if (!exist) {
                                    pathsToRemove.push(fileSysObjPath);
                                }
                            }
                            if (pathsToRemove.length > 0) {
                                pathsToRemove.forEach(fileSysObjPath => {
                                    let i = selectionDropdown.model.items.indexOf(fileSysObjPath);
                                    if (i >= 0) {
                                        selectionDropdown.model.items.splice(i, 1);
                                    }
                                });
                                selectionDropdown.model = selectionDropdown.model;
                                updateSelectionStates();
                            }
                        }
                        await displayDirectoryContent(directoryContent);
                        if (currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}` || currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_TEMP}` || currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_BACKUP}`) {
                            btnParent.enabled = false;
                        } else {
                            btnParent.enabled = true;
                        }
                        pathBreadCrumbsDiv.textContent = currentFolderPath;
                        if (fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`) {
                            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                                fullPathSingleSelect = currentFolderPath;
                                selectionNameDiv.textContent = fullPathSingleSelect.split("").reverse().join("");
                            }
                            updateSelectionStates();
                        }
                    }
                    async function fileSystemObjectExists(path, isFile = true) {
                        if (isFile) {
                            try {
                                let fileObj = await RWS.FileSystem.createFileObject(path);
                                if (fileObj.fileExists()) {
                                    return true;
                                }
                            } catch (error) {}
                            return false;
                        }
                        try {
                            await RWS.FileSystem.getDirectory(path);
                            return true;
                        } catch (error) {}
                        return false;
                    }
                    async function displayDirectoryContent(directoryContent) {
                        const fileSysObjArr = [];
                        const fileArr = directoryContent.files;
                        const dirArr = directoryContent.directories;
                        if (fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`) {
                            dirArr.forEach(dir => {
                                fileSysObjArr.push({
                                    type: `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`,
                                    content: dir
                                });
                            });
                            if (validFileEndings !== null && validFileEndings.length > 0) {
                                fileArr.forEach(file => {
                                    validFileEndings.forEach(fileEnding => {
                                        if (fileEnding.trim().length > 0) {
                                            if (file.name.toLowerCase().endsWith(fileEnding.toLowerCase())) {
                                                fileSysObjArr.push({
                                                    type: `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`,
                                                    content: file
                                                });
                                            }
                                        }
                                    });
                                });
                            } else {
                                fileArr.forEach(file => {
                                    fileSysObjArr.push({
                                        type: `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`,
                                        content: file
                                    });
                                });
                            }
                        } else {
                            dirArr.forEach(dir => {
                                fileSysObjArr.push({
                                    type: `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`,
                                    content: dir
                                });
                            });
                        }
                        clearCurrentFolderContent();
                        fileSysObjArr.forEach(fileSystemObject => {
                            const row = document.createElement("tr");
                            const fileSystemObjectName = `${fileSystemObject.content.name}`;
                            const tdIcon = document.createElement("td");
                            const iconDiv = document.createElement("div");
                            const icon = document.createElement("img");
                            icon.className = "fp-components-filesystemdialog-folder-content-object-icon";
                            row.appendChild(tdIcon);
                            tdIcon.appendChild(iconDiv);
                            iconDiv.appendChild(icon);
                            const td1 = document.createElement("td");
                            td1.className = "fp-components-filesystemdialog-folder-content-object-name";
                            td1.textContent = fileSystemObjectName;
                            row.appendChild(td1);
                            const td2 = document.createElement("td");
                            td2.style.wordBreakbreak = "break-all";
                            td2.style.paddingRight = "10px";
                            td2.className = "fp-components-filesystemdialog-folder-content-object-size";
                            row.appendChild(td2);
                            function getFormatedDate(obj) {
                                let str = JSON.stringify(fileSystemObject.content.modified);
                                str = str.replace(/["]/g, "");
                                str = str.replace(/[T]/g, ", ");
                                return str.substring(0, str.lastIndexOf("."));
                            }
                            const td3 = document.createElement("td");
                            td3.className = "fp-components-filesystemdialog-folder-content-object-last-created";
                            const createdDate = getFormatedDate(fileSystemObject.content.created);
                            td3.textContent = createdDate;
                            row.appendChild(td3);
                            const td4 = document.createElement("td");
                            td4.className = "fp-components-filesystemdialog-folder-content-object-last-modified";
                            const modifiedDate = getFormatedDate(fileSystemObject.content.modified);
                            td4.textContent = modifiedDate;
                            row.appendChild(td4);
                            if (fileSystemObject.type === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`) {
                                icon.src = "fp-components/img/file.png";
                                row.className = "fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-file-object";
                                td2.textContent = fileSystemObject.content.size;
                                if (fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`) {
                                    row.onclick = () => {
                                        let fileWasSelected = false;
                                        if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                                            for (let i = 0; i < folderContentTable.children.length; i++) {
                                                if (folderContentTable.children[i] !== row && folderContentTable.children[i].className.includes("fp-components-filesystemdialog-file-object")) {
                                                    folderContentTable.children[i].className = "fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-file-object";
                                                }
                                            }
                                        }
                                        if (row.className.includes("fp-components-filesystemdialog-folder-content-object-unselected")) {
                                            row.className = "fp-components-filesystemdialog-folder-content-object-selected fp-components-filesystemdialog-file-object";
                                            fileWasSelected = true;
                                        } else {
                                            row.className = "fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-file-object";
                                            fileWasSelected = false;
                                        }
                                        handleFileSelection(fileSystemObject.content.name, fileWasSelected);
                                    };
                                }
                            } else {
                                icon.src = "fp-components/img/folder.png";
                                row.className = "fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-folder-object";
                                td2.textContent = "-";
                                row.onclick = async () => {
                                    let folderWasSelected = false;
                                    if (multiSelectFolders) {
                                        if (row.className.includes("fp-components-filesystemdialog-folder-content-object-unselected")) {
                                            row.className = "fp-components-filesystemdialog-folder-content-object-selected fp-components-filesystemdialog-folder-object";
                                            folderWasSelected = true;
                                        } else {
                                            row.className = "fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-folder-object";
                                            folderWasSelected = false;
                                        }
                                    }
                                    await handleFolderSelection(fileSystemObject.content.name, folderWasSelected);
                                };
                            }
                            folderContentTable.appendChild(row);
                        });
                        const tableHeadingRow = document.createElement("tr");
                        tableHeadingRow.className = "fp-components-filesystemdialog-folder-content-table-heading-row";
                        const thIcon = document.createElement("th");
                        thIcon.style.width = "32px";
                        const thName = document.createElement("th");
                        thName.style.minWidth = "350px";
                        const thSize = document.createElement("th");
                        thSize.style.width = "100px";
                        const thCreated = document.createElement("th");
                        thCreated.style.width = "150px";
                        const thModified = document.createElement("th");
                        thModified.style.width = "150px";
                        thName.textContent = "Name";
                        thSize.textContent = "Byte size";
                        thCreated.textContent = "Created";
                        thModified.textContent = "Modified";
                        tableHeadingRow.appendChild(thIcon);
                        tableHeadingRow.appendChild(thName);
                        tableHeadingRow.appendChild(thSize);
                        tableHeadingRow.appendChild(thCreated);
                        tableHeadingRow.appendChild(thModified);
                        folderContentTable.insertBefore(tableHeadingRow, folderContentTable.firstChild);
                        if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}` && fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`) {
                            return;
                        }
                        for (let i = 1; i < folderContentTable.children.length; i++) {
                            const nameColumnindex = 1;
                            const row = folderContentTable.children[i];
                            const fileSysObjName = row.children[nameColumnindex].textContent;
                            const path = currentFolderPath + "/" + fileSysObjName;
                            let selectRow = false;
                            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                                if (fullPathSingleSelect === path) {
                                    selectRow = true;
                                }
                            } else {
                                if (selectionDropdown.model.items.includes(path)) {
                                    selectRow = true;
                                }
                            }
                            if (selectRow === true) {
                                if (row.className.includes("fp-components-filesystemdialog-file-object")) {
                                    row.className = "fp-components-filesystemdialog-folder-content-object-selected fp-components-filesystemdialog-file-object";
                                } else {
                                    row.className = "fp-components-filesystemdialog-folder-content-object-selected fp-components-filesystemdialog-folder-object";
                                }
                            }
                        }
                    }
                    function handleFileSelection(fileName, fileWasSelected) {
                        const filePath = currentFolderPath + "/" + fileName;
                        if (fileWasSelected) {
                            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                                fullPathSingleSelect = filePath;
                                selectionNameDiv.textContent = fullPathSingleSelect.split("").reverse().join("");
                            } else {
                                if (!selectionDropdown.model.items.includes(filePath)) {
                                    selectionDropdown.model.items.push(filePath);
                                    const index = selectionDropdown.model.items.indexOf(filePath);
                                    selectionDropdown.selected = index;
                                }
                            }
                        } else {
                            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                                fullPathSingleSelect = "";
                                selectionNameDiv.textContent = fullPathSingleSelect;
                            } else {
                                const index = selectionDropdown.model.items.indexOf(filePath);
                                if (index >= 0) {
                                    selectionDropdown.model.items.splice(index, 1);
                                }
                                if (selectionDropdown.model.items.length > 0) {
                                    selectionDropdown.selected = 0;
                                }
                            }
                        }
                        if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
                            selectionDropdown.model = selectionDropdown.model;
                        }
                        updateSelectionStates();
                    }
                    async function handleFolderSelection(folderName, folderWasSelected) {
                        if (!multiSelectFolders || selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                            await navigateToSubFolder(folderName);
                            return;
                        }
                        const folderPath = currentFolderPath + "/" + folderName;
                        if (folderWasSelected) {
                            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}}`) {
                                selectionDropdown.model.items = [];
                            }
                            if (!selectionDropdown.model.items.includes(folderPath)) {
                                selectionDropdown.model.items.push(folderPath);
                                const index = selectionDropdown.model.items.indexOf(folderPath);
                                selectionDropdown.selected = index;
                            }
                        } else {
                            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                                selectionDropdown.model.items = [];
                            } else {
                                const index = selectionDropdown.model.items.indexOf(folderPath);
                                if (index >= 0) {
                                    selectionDropdown.model.items.splice(index, 1);
                                }
                                if (selectionDropdown.model.items.length > 0) {
                                    selectionDropdown.selected = 0;
                                }
                            }
                        }
                        selectionDropdown.model = selectionDropdown.model;
                        updateSelectionStates();
                    }
                    function sortFolderContent(selectedIndex, selectedText) {
                        if (!folderContentTable || !folderContentTable.rows) {
                            return;
                        }
                        const columnIndex = selectedIndex + 1;
                        let fileRows = [];
                        let folderRows = [];
                        const rows = folderContentTable.rows;
                        for (let i = 1; i < rows.length; i++) {
                            if (rows[i].children[2].textContent === "-") {
                                folderRows.push(rows[i]);
                            } else {
                                fileRows.push(rows[i]);
                            }
                        }
                        folderRows.sort(compareCellsByColumnIndex(columnIndex));
                        fileRows.sort(compareCellsByColumnIndex(columnIndex));
                        if (prevSelectedSortIndex === columnIndex) {
                            folderRows = folderRows.reverse();
                            fileRows = fileRows.reverse();
                        }
                        while (folderContentTable.children.length > 1) {
                            folderContentTable.children[folderContentTable.children.length - 1].remove();
                        }
                        folderRows.forEach(row => {
                            folderContentTable.appendChild(row);
                        });
                        fileRows.forEach(row => {
                            folderContentTable.appendChild(row);
                        });
                        prevSelectedSortIndex = columnIndex;
                        function compareCellsByColumnIndex(columnIndex) {
                            return function(a, b) {
                                let str1 = a.children[columnIndex].textContent.toLowerCase();
                                let str2 = b.children[columnIndex].textContent.toLowerCase();
                                return compareCellValues(str1, str2);
                            };
                            function compareCellValues(str1, str2) {
                                try {
                                    let temp1 = parseInt(str1);
                                    let temp2 = parseInt(str2);
                                    if (typeof temp1 !== "number" || isNaN(temp1)) {
                                        temp1 = str1;
                                    }
                                    if (typeof temp2 !== "number" || isNaN(temp2)) {
                                        temp2 = str2;
                                    }
                                    return temp1 - temp2;
                                } catch (error) {
                                    return 0;
                                }
                            }
                        }
                    }
                    async function navigateToParentFolder() {
                        if (currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}` || currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_TEMP}` || currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_BACKUP}`) {
                            return;
                        }
                        await updateCurrentFolder(currentFolderPath.substring(0, currentFolderPath.lastIndexOf("/")));
                    }
                    async function navigateToSubFolder(folderName) {
                        try {
                            await RWS.FileSystem.getDirectory(currentFolderPath + "/" + folderName);
                        } catch (err) {
                            return;
                        }
                        await updateCurrentFolder(currentFolderPath + "/" + folderName);
                    }
                    function clearCurrentFolderContent() {
                        while (folderContentTable.firstChild) {
                            folderContentTable.firstChild.remove();
                        }
                    }
                });
            }
        };
        o.Filesystemdialog_A.SelectionMode = {
            Single: "single",
            Multi: "multi"
        };
        o.Filesystemdialog_A.FileSystemObjectType = {
            File: "file",
            Folder: "folder"
        };
        o.Filesystemdialog_A.ROOT_FOLDER_HOME = `$HOME`;
        o.Filesystemdialog_A.ROOT_FOLDER_TEMP = `$TEMP`;
        o.Filesystemdialog_A.ROOT_FOLDER_BACKUP = `$BACKUP`;
        o.Filesystemdialog_A.VERSION = "1.4.1";
    }
})(FPComponents);