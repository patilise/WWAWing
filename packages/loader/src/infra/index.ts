import { WWAData } from "@wwawing/common-interface";
import { IEventEmitter } from "@wwawing/event-emitter";

export class WWAConsts {
    // TODO: WWA本体のものと共通化して common-interface におく
    static ITEMBOX_SIZE: number = 12;
    static MAP_ATR_MAX: number = 60;
    static OBJ_ATR_MAX: number = 60;
    static OLD_MAP_ATR_MAX: number = 40;
    static OLD_OBJ_ATR_MAX: number = 40;
    static ATR_CROP1: number = 1;
    static ATR_CROP2: number = 2;
    static ATR_TYPE: number = 3;
    static ATR_JUMP_X: number = 16;
    static ATR_JUMP_Y: number = 17;

    static MAP_LOCALGATE: number = 2;
    static OBJECT_LOCALGATE: number = 18;

    static SYSTEM_MESSAGE_NUM: number = 20;

    static IMGPOS_DEFAULT_YESNO_X: number = 3;
    static IMGPOS_DEFAULT_YESNO_Y: number = 1;

    static IMGPOS_DEFAULT_PLAYER_X: number = 2;
    static IMGPOS_DEFAULT_PLAYER_Y: number = 0;

    static IMGPOS_DEFAULT_CLICKABLE_ITEM_SIGN_X: number = 0;
    static IMGPOS_DEFAULT_CLICKABLE_ITEM_SIGN_Y: number = 0;
    
    // TODO: common-interface と共通化できないか考える
    static IMGPOS_DEFAULT_STATUS_X: number = 3;
    static IMGPOS_DEFAULT_STATUS_Y: number = 2;
    static IMGRELPOS_ENERGY_ICON_X: number = 0;
    static IMGRELPOS_STRENGTH_ICON_X: number = 1;
    static IMGRELPOS_DEFENCE_ICON_X: number = 2;
    static IMGRELPOS_GOLD_ICON_X: number = 3;

    static IMGPOS_DEFAULT_WIDE_CELL_X: number = 4;
    static IMGPOS_DEFAULT_WIDE_CELL_Y: number = 3;
    static IMGPOS_DEFAULT_ITEMBOX_X: number = 1;
    static IMGPOS_DEFAULT_ITEMBOX_Y: number = 2;

    static IMGPOS_DEFAULT_FRAME_X: number = 0;
    static IMGPOS_DEFAULT_FRAME_Y: number = 1;

    static IMGPOS_DEFAULT_BATTLE_EFFECT_X: number = 3;
    static IMGPOS_DEFAULT_BATTLE_EFFECT_Y: number = 3;

    static DEFAULT_DISABLE_SAVE: boolean = false;
    static DEFAULT_OLDMAP: boolean = false;
    static DEFAULT_OBJECT_NO_COLLAPSE: boolean = false;

    static DEFAULT_FRAME_COLOR_R = 0xff;
    static DEFAULT_FRAME_COLOR_G = 0xff;
    static DEFAULT_FRAME_COLOR_B = 0xff;
    static DEFAULT_FRAMEOUT_COLOR_R = 0x60;
    static DEFAULT_FRAMEOUT_COLOR_G = 0x60;
    static DEFAULT_FRAMEOUT_COLOR_B = 0x60;
    static DEFAULT_STR_COLOR_R = 0x0;
    static DEFAULT_STR_COLOR_G = 0x0;
    static DEFAULT_STR_COLOR_B = 0x0;
    static DEFAULT_STATUS_COLOR_R = 0x0;
    static DEFAULT_STATUS_COLOR_G = 0x0;
    static DEFAULT_STATUS_COLOR_B = 0x0;

    static DEFAULT_MOVES = 0;
    static DEFAULT_SPEED_INDEX = 3;

    static USER_VAR_NUM = 256;
}

export class LoaderError implements Error {
    name: string;
    message: string;
}

export class LoaderProgress {
    current: number;
    total: number;
    stage: LoadStage;
}

export enum PartsType {
    MAP = 1, OBJECT = 0
}

export enum LoadStage {
    INIT = 0, MAP_LOAD = 1, OBJ_LOAD = 2, MAP_ATTR = 3, OBJ_ATTR = 4, RAND_PARTS = 5, MESSAGE = 6
}

/**
 * すべてundefinedのWWADataをつくる
 */
export function createDefaultWWAData(): WWAData {
    // TODO: strict:trueになったらバリデーションを導入するのでこの処理は不要になる
    return {
        version: undefined,
        gameoverX: undefined,
        gameoverY: undefined,
        playerX: undefined,
        playerY: undefined,
        mapPartsMax: undefined,
        objPartsMax: undefined,
        isOldMap: undefined,
        isOldMove: undefined,
        statusEnergyMax: undefined,
        statusEnergy: undefined,
        statusStrength: undefined,
        statusDefence: undefined,
        statusGold: undefined,
        itemBox: undefined,
        mapWidth: undefined,
        messageNum: undefined,
        map: undefined,
        mapObject: undefined,
        mapCompressed: undefined,
        mapObjectCompressed: undefined,
        mapAttribute: undefined,
        objectAttribute: undefined,
        worldPassword: undefined,
        message: undefined,
        worldName: undefined,
        worldPassNumber: undefined,
        charCGName: undefined,
        mapCGName: undefined,
        systemMessage: undefined,
        moves: undefined,
        yesnoImgPosX: undefined,
        yesnoImgPosY: undefined,
        playerImgPosX: undefined,
        playerImgPosY: undefined,
        clickableItemSignImgPosX: undefined,
        clickableItemSignImgPosY: undefined,
        disableSaveFlag: undefined,
        compatibleForOldMapFlag: undefined,
        objectNoCollapseDefaultFlag: undefined,
        delPlayerFlag: undefined,
        bgm: undefined,
        effectCoords: undefined,
        effectWaits: undefined,
        imgStatusEnergyX: undefined,
        imgStatusEnergyY: undefined,
        imgStatusStrengthX: undefined,
        imgStatusStrengthY: undefined,
        imgStatusDefenceX: undefined,
        imgStatusDefenceY: undefined,
        imgStatusGoldX: undefined,
        imgStatusGoldY: undefined,
        imgWideCellX: undefined,
        imgWideCellY: undefined,
        imgItemboxX: undefined,
        imgItemboxY: undefined,
        imgFrameX: undefined,
        imgFrameY: undefined,
        imgBattleEffectX: undefined,
        imgBattleEffectY: undefined,
        imgClickX: undefined,
        imgClickY: undefined,
        frameColorR: undefined,
        frameColorG: undefined,
        frameColorB: undefined,
        frameOutColorR: undefined,
        frameOutColorG: undefined,
        frameOutColorB: undefined,
        fontColorR: undefined,
        fontColorG: undefined,
        fontColorB: undefined,
        statusColorR: undefined,
        statusColorG: undefined,
        statusColorB: undefined,
        checkOriginalMapString: undefined,
        checkString: undefined,
        isItemEffectEnabled: undefined,
        frameCount: undefined,
        gamePadButtonItemTable: undefined,
        userVar: undefined,
        permitChangeGameSpeed: undefined,
        gameSpeedIndex: undefined,
        playTime: undefined,
        isVisibleStatusEnergy: undefined,
        isVisibleStatusStrength: undefined,
        isVisibleStatusDefence: undefined,
        isVisibleStatusGold: undefined,
        isGameOverDisabled: undefined,
        gameOverPolicy: "default",
        bgmDelayDurationMs: undefined,
        customSystemMessages: {},
    };
}

export interface Progress {
  current: number;
  total: number;
  stage: LoadStage;
}

export interface LoaderError {
  name: string;
  message: string;
}

export interface WWALoaderEventEmitter extends IEventEmitter {
  dispatch(eventName: "mapData", data: WWAData): void;
  dispatch(eventName: "progress", data: Progress): void;
  dispatch(eventName: "error", data: LoaderError): void;
  addListener(eventName: "mapData", callback: (data: WWAData) => any): (data: WWAData) => any;
  addListener(eventName: "progress", callback: (data: Progress) => any):  (data: Progress) => any;
  addListener(eventName: "error", callback: (data: LoaderError) => any):  (data: LoaderError) => any;
  removeListener(eventName: "mapData", callback: (...arg: any[]) => any): void;
  removeListener(eventName: "progress", callback: (...arg: any[]) => any): void;
  removeListener(eventName: "error", callback: (...arg: any[]) => any): void;
}
