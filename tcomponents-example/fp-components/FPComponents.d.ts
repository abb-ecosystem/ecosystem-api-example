
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.4.1

declare function fpComponentsLoadCSS(href: string): void;
declare const FP_COMPONENTS_COMMON_VERSION: string;
declare const FP_COMPONENTS_KEYBOARD_ALPHA: object;
declare const FP_COMPONENTS_KEYBOARD_NUM: object;

declare function fpComponentsKeyboardShow(
    callback: (value: string | null) => void,
    initialText?: string,
    label?: string,
    variant?: typeof FP_COMPONENTS_KEYBOARD_ALPHA | typeof FP_COMPONENTS_KEYBOARD_NUM,
    regex?: RegExp,
    validator?: (value: string) => boolean
): void;

declare function fpComponentsEnableLog(): void;
declare function ghostFPComponentsLog(): void;
declare function solidFPComponentsLog(): void;
declare function lockScrollFPComponentsLog(): void;
declare function autoScrollFPComponentsLog(): void;
declare function clearFPComponentsLog(): void;
declare function raiseFPComponentsLog(): void;
declare function minimizeFPComponentsLog(): void;



declare namespace FPComponents {



    class Button_A {

        constructor();

        readonly parent: HTMLElement | null;
        onclick: (() => void) | null;
        enabled: boolean;
        text: string;
        highlight: boolean;
        icon: string | null;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;
    }



    class Checkbox_A {

        constructor();

        readonly parent: HTMLElement | null;
        onclick: ((checked: boolean) => void) | null;
        enabled: boolean;
        checked: boolean;
        desc: string | null;
        scale: number;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;
    }



    class Contextmenu_A {

        constructor();

        readonly parent: HTMLElement | null;
        model: {
            content: (
                { type: "label", label: string, } |
                { type: "button", label: string, onclick: () => void, icon?: string, enabled?: boolean } |
                { type: "gap" }
            )[]
        };
        enabled: boolean;

        show(): void;
        hide(): void;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Digital_A {

        constructor();

        readonly parent: HTMLElement | null;
        onclick: (() => void) | null;
        active: boolean;
        desc: string | null;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Dropdown_A {

        constructor();

        readonly parent: HTMLElement | null;
        onselection: ((index: number | null, obj: any) => void) | null;
        enabled: boolean;
        model: {
            items: {toString: ()=>string}[]
        } | null;
        desc: string | null;
        selected: number | null;
        leftTruncate: boolean;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Foldin_A {

        constructor();

        readonly parent: HTMLElement | null;
        width: string | number;
        contentId: string | null;

        show(): void;
        hide(): void;

        attachToBody(): void;

        static readonly VERSION: string;

    }



    class Hamburgermenu_A {

        constructor();

        readonly parent: HTMLElement | null;
        title: string | false | null;
        onchange: ((oldViewId: Hamburgermenu_A.ViewId | null, newViewId: Hamburgermenu_A.ViewId | null) => void) | null;
        readonly viewIdList: Hamburgermenu_A.ViewId[];
        activeView: Hamburgermenu_A.ViewId;
        alwaysVisible: boolean;

        getViewButtonLabel(id: Hamburgermenu_A.ViewId): string | null;
        setViewButtonLabel(id: Hamburgermenu_A.ViewId, label: string): void;
        addView(label: string, contentElement: HTMLElement | string, icon: string, active?: boolean): Hamburgermenu_A.ViewId;
        removeView(id: Hamburgermenu_A.ViewId): void;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }
    namespace Hamburgermenu_A {
        type ViewId = unknown;
    }



    class Input_A {

        constructor();

        readonly parent: HTMLElement | null;
        enabled: boolean;
        text: string;
        onchange: ((text: string) => void) | null;
        label: string | null;
        regex: RegExp | null;
        validator: ((text: string) => boolean) | null;
        variant: typeof FP_COMPONENTS_KEYBOARD_ALPHA | typeof FP_COMPONENTS_KEYBOARD_NUM | null;
        desc: string | null;


        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Levelmeter_A {

        constructor();

        readonly parent: HTMLElement | null;
        width: number | null;
        max: number | null;
        min: number | null;
        value: number | null;
        lim1: number | null;
        lim2: number | null;
        unit: string | null;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Linechart_A {

        constructor();

        readonly parent: HTMLElement | null;
        width: number | null;
        height: number | null;
        xMax: number | null;
        xMin: number | null;
        yMax: number | null;
        yMin: number | null;
        xStep: number | null;
        yStep: number | null;
        xLabels: [string,number][];
        yLabels: [string,number][];
        xAutoLabelStep: number | null;
        yAutoLabelStep: number | null;
        model: (
            {
                points: [number, number][],
                fill?: boolean,
                dots?: boolean,
                thickness?: number,
                red?: number,
                green?: number,
                blue?: number,
                hidden?: boolean,
                xMarker?: number | number[],
                yMarker?: number | number[],
                xFunc?: (x: number) => number,
                yFunc?: (y: number) => number,
                xFuncStep?: number,
                yFuncStep?: number
            } |
            {
                thickness?: number,
                red?: number,
                green?: number,
                blue?: number,
                hidden?: boolean,
                xMarker?: number | number[],
                yMarker?: number | number[],
                xFunc?: (x: number) => number,
                yFunc?: (y: number) => number,
                xFuncStep?: number,
                yFuncStep?: number
            }
        )[] | null;

        repaintLater(): void;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Menu_A {

        constructor();

        readonly parent: HTMLElement | null;
        model: {
            content: (
                {type: "label", label: string} |
                {type: "gap"} |
                {type: "button", label: string, onclick?: ()=>void, icon?: string, arrow?: boolean, flash?: boolean, flashColor?: string, enabled?: boolean}
            )[]
        } | Record<string, never>;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }

    

    class Piechart_A {

        constructor();

        readonly parent: HTMLElement | null;
        
        size: number;
        donut: boolean;
        showLabels: boolean;
        labelsBelow: boolean;
        model: (
            [number,string,string]
        )[];
        hue: number;
        multiHue: boolean;
        centerText: string | null;
        topText: string | null;
        bottomText: string | null;
        selected: number | null;
        onselection: (index: number|null, value: number|null)=>void;

        appendData(value: number, label: string, color?: string|null) : void;
        clearData() : void;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;        

    }



    class Popup_A {
        
        static message(header: string, message: string | string[], callback?: ((action: string) => void) | null, style?: string | null): void;
        static confirm(header: string, message: string | string[], callback?: ((action: string) => void) | null, style?: string | null): void;

        static custom(
            model: {
                header: Popup_A.ModelEntry[],
                content: Popup_A.ModelEntry[],
                footer: Popup_A.ModelEntry[],
            },
            callback?: ((action: any) => void) | null
        ): void;
        static close(): void;

        static readonly OK: string;
        static readonly CANCEL: string;
        static readonly NONE: string;
        static readonly STYLE: { INFORMATION: string, WARNING: string, DANGER: string }

        static readonly VERSION: string;

    }
    namespace Popup_A {
        type ModelEntry = {
            type: "text",
            text: string
        } |
        {
            type: "button",
            text: string,
            action: any,
            highlight?: boolean,
            closeDialog?: boolean
        }
    }

    class Filesystemdialog_A {

        static select(selectionMode?: Filesystemdialog_A.SelectionMode, fileSystemType?: Filesystemdialog_A.FileSystemObjectType, textHeading?: string|null, validFileEndings?: string[]|null, defaultFolderPath?:string|null): Promise<string[]|null>;

        static readonly ROOT_FOLDER_HOME: `$HOME`;
        static readonly ROOT_FOLDER_TEMP: `$TEMP`;
        static readonly ROOT_FOLDER_BACKUP: `$BACKUP`;

        static readonly VERSION: string;
    }

    namespace Filesystemdialog_A {
        
        enum SelectionMode {
            Single,
            Multi
        }

        enum FileSystemObjectType {
            File,
            Folder
        }
    }

    class Radio_A {

        constructor();

        readonly parent: HTMLElement | null;
        onclick: (() => void) | null;
        enabled: boolean;
        checked: boolean;
        desc: string | null;
        scale: number;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Slider_A {

        constructor();

        readonly parent: HTMLElement | null;
        min: number;
        max: number;
        value: number;
        label: string;
        displayLabel: boolean;
        displayValue: boolean;
        unit: string;
        tickStep: number;
        displayTicks: boolean;
        numberOfDecimals: number;
        width: number;
        enabled: boolean;
        ondrag: ((value: number) => void) | null;
        onrelease: ((value: number) => void) | null;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Switch_A {

        constructor();

        readonly parent: HTMLElement | null;
        onchange: ((active: boolean) => void) | null;
        enabled: boolean;
        active: boolean;
        scale: number;
        desc: string | null;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }



    class Tabcontainer_A {

        constructor();

        readonly parent: HTMLElement | null;
        onplus: (() => void) | null;
        onchange: ((oldTabId: Tabcontainer_A.ViewId | null, newTabId: Tabcontainer_A.ViewId | null) => void) | null;
        onuserclose: ((tabId: Tabcontainer_A.ViewId) => boolean) | null;
        plusEnabled: boolean;
        userTabClosing: boolean;
        hiddenTabs: boolean;
        readonly tabIdList: Tabcontainer_A.ViewId[];
        activeTab: Tabcontainer_A.ViewId | undefined | null;

        addTab(title: string, content: HTMLElement | string, makeActive?: boolean): Tabcontainer_A.ViewId;
        getTabTitle(tabId: Tabcontainer_A.ViewId): string | null;
        setTabTitle(tabId: Tabcontainer_A.ViewId, title: string): void;
        removeTab(tabId: Tabcontainer_A.ViewId): void;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }
    namespace Tabcontainer_A {
        type ViewId = unknown;
    }



    class Toggle_A {

        constructor();

        readonly parent: HTMLElement | null;
        model: (
            {
                text: string,
                icon?: string,
                toggledIcon?: string
            }
        )[] | null;
        multi: boolean;
        singleAllowNone: boolean;
        onclick: (
            (
                state: {
                    all: boolean[],
                    changed: [number, boolean][]
                }
            ) => void
        ) | null;

        setToggled(index: number, toggled?: boolean|null, noLimitations?: boolean): void;
        getToggledList(): boolean[];
        isToggled(index: number): boolean | undefined;

        attachToId(id: string): void;
        attachToElement(em: HTMLElement): void;

        static readonly VERSION: string;

    }

}


