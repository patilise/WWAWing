import { WWA } from "./wwa_main";
import { Camera } from "./wwa_camera";
import { type WWAData } from "@wwawing/common-interface";
import type { JsonResponseErrorKind } from "./json_api_client";

export { type WWAData };

export class EquipmentStatus {
    public strength: number;
    public defence: number;
    public add(s: EquipmentStatus): EquipmentStatus {
        this.strength += s.strength;
        this.defence += s.defence;
        return this;
    }
    public plus(s: EquipmentStatus): EquipmentStatus {
        return new EquipmentStatus(
            this.strength + s.strength,
            this.defence + s.defence);

    }
    public minus(s: EquipmentStatus): EquipmentStatus {
        return new EquipmentStatus(
            this.strength - s.strength,
            this.defence - s.defence);

    }
    public equals(e: EquipmentStatus): boolean {
        return this.strength === e.strength && this.defence === e.defence;
    }
    public constructor(s: number, d: number) {
        this.strength = s;
        this.defence = d;
    }

}


export class Status extends EquipmentStatus {
    public energy: number;
    public gold: number;

    public add(s: EquipmentStatus): Status {
        if (s instanceof Status) {
            this.energy += (<Status>s).energy;
            this.gold += (<Status>s).gold;
        }
        this.strength += s.strength;
        this.defence += s.defence;
        return this;
    }

    public plus(s: EquipmentStatus): Status {
        if (s instanceof Status) {
            return new Status(
                this.energy + (<Status>s).energy,
                this.strength + s.strength,
                this.defence + s.defence,
                this.gold + (<Status>s).gold);
        }
        return new Status(
            this.energy,
            this.strength + s.strength,
            this.defence + s.defence,
            this.gold);
    }
    public minus(s: EquipmentStatus): Status {
        if (s instanceof Status) {
            return new Status(
                this.energy - (<Status>s).energy,
                this.strength - s.strength,
                this.defence - s.defence,
                this.gold - (<Status>s).gold);
        }
        return new Status(
            this.energy,
            this.strength - s.strength,
            this.defence - s.defence,
            this.gold);
    }
    public equals(e: Status): boolean {
        return this.energy === e.energy && this.strength === e.strength && this.defence === e.defence && this.gold === e.gold;
    }

    public calculateScore(scoreOption: ScoreOptions): number {
        type Key = keyof ScoreRates;
        // TODO: this[key] など型が効いていない部分があるが、一旦目を瞑る。
        return (Object.keys(scoreOption.rates) as Key[]).reduce((prev, key) =>  prev + scoreOption.rates[key] * this[key], 0);
    }

    public constructor( e: number, s: number, d: number, g: number) {
        super(s, d);
        this.energy = e;
        this.gold = g;
    }

}
/**
Coordは座標(coordinate)を示す変数２つ組です。
パーツ座標や、画面座標を用いるのに使用します。
*/
export class Coord {
    public x: number;
    public y: number;
    public equals(coord: Coord): boolean {
        return this.x === coord.x && this.y === coord.y;
    }
    public substract(c: Coord): Coord {
        return new Coord(this.x - c.x, this.y - c.y);
    }
    public clone(): Coord {
        return new Coord(this.x, this.y);
    }
    public convertIntoPosition(wwa: WWA): Position {
        return new Position(wwa, this.x, this.y, 0, 0);
    }
    public getDirectionTo(dest: Coord): Direction {
        if (this.x < dest.x) {
            if (this.y > dest.y) {
                return Direction.RIGHT_UP;
            }
            if (this.y === dest.y) {
                return Direction.RIGHT;
            }
            return Direction.RIGHT_DOWN;
        }
        if (this.x === dest.x) {
            if (this.y > dest.y) {
                return Direction.UP;
            }
            if (this.y === dest.y) {
                return Direction.NO_DIRECTION;
            }
            return Direction.DOWN;
        }

        if (this.y > dest.y) {
            return Direction.LEFT_UP;
        }
        if (this.y === dest.y) {
            return Direction.LEFT;
        }
        return Direction.LEFT_DOWN;
    }

    public toString(): string {
        return "(" + this.x + ", " + this.y + ")";
    }

    public constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export class Position {
    private _wwa: WWA;
    private _partsCoord: Coord;
    private _offsetCoord: Coord;
    public getPartsCoord(): Coord {
        return this._partsCoord;
    }
    public getOffsetCoord(): Coord {
        return this._offsetCoord;
    }
    public getScreenTopPosition(): Position {
        var newX = Math.floor(this._partsCoord.x / (WWAConsts.H_PARTS_NUM_IN_WINDOW - 1)) * (WWAConsts.H_PARTS_NUM_IN_WINDOW - 1);
        var newY = Math.floor(this._partsCoord.y / (WWAConsts.V_PARTS_NUM_IN_WINDOW - 1)) * (WWAConsts.V_PARTS_NUM_IN_WINDOW - 1);
        return new Position(this._wwa, newX, newY, 0, 0);
    }

    public getDefaultCameraPosition(): Position {
        var pos = this.getScreenTopPosition();
        var coord = pos.getPartsCoord();
        var width = this._wwa.getMapWidth();
        var newCoord = pos.getPartsCoord().clone();

        if (coord.x === width - 1) {
            newCoord.x--;
        }
        if (coord.y === width - 1) {
            newCoord.y--;
        }

        return newCoord.convertIntoPosition(this._wwa).getScreenTopPosition();
    }

    public getNextJustPosition(dir?: Direction): Position {
        // 方向指定時は、その方向の次のPartsCoordを返す
        if (dir !== void 0) {
            var p = this._partsCoord;
            return new Position(this._wwa, p.x + vx[dir], p.y + vy[dir], 0, 0);
        }

        // 方向未指定時は、offsetの方向の次のPartsCoordを返す。
        var x: number = this._partsCoord.x, y: number = this._partsCoord.y;
        if (this._offsetCoord.x < 0) {
            x--;
        } else if (this._offsetCoord.x > 0) {
            x++;
        }
        if (this._offsetCoord.y < 0) {
            y--;
        } else if (this._offsetCoord.y > 0) {
            y++;
        }
        return new Position(this._wwa, x, y, 0, 0);
    }

    public getNextFramePosition(dir: Direction, speedX: number, speedY: number): Position {
        var nx = this._partsCoord.x;
        var ny = this._partsCoord.y;
        var nox = this._offsetCoord.x + (vx[dir] * speedX);
        var noy = this._offsetCoord.y + (vy[dir] * speedY);
        if (nox < 0) {
            var dx = Math.floor(Math.abs(nox) / WWAConsts.CHIP_SIZE);
            nx -= dx;
            nox = (nox + dx * WWAConsts.CHIP_SIZE) % WWAConsts.CHIP_SIZE;
        }
        if (noy < 0) {
            var dy = Math.floor(Math.abs(noy) / WWAConsts.CHIP_SIZE);
            ny -= dy;
            noy = (noy + dy * WWAConsts.CHIP_SIZE) % WWAConsts.CHIP_SIZE;
        }

        if (nox >= WWAConsts.CHIP_SIZE) {
            nx += Math.floor(nox / WWAConsts.CHIP_SIZE);
            nox = (nox + WWAConsts.CHIP_SIZE) % WWAConsts.CHIP_SIZE;
        }
        if (noy >= WWAConsts.CHIP_SIZE) {
            ny += Math.floor(noy / WWAConsts.CHIP_SIZE);
            noy = (noy + WWAConsts.CHIP_SIZE) % WWAConsts.CHIP_SIZE;
        }
        return new Position(this._wwa, nx, ny, nox, noy);
    }


    public isJustPosition(): boolean {
        return this._offsetCoord.x == 0 && this._offsetCoord.y == 0;
    }

    public isScreenTopPosition(): boolean {
        var stp = this.getScreenTopPosition();
        return this.equals(stp);
    }

    public equals(pos: Position): boolean {
        return (
            this._partsCoord.equals(pos.getPartsCoord()) &&
            this._offsetCoord.equals(pos.getOffsetCoord())
        );
    }

    public isInCameraRange(camera: Camera, exceptRightBottomEdge: boolean = false): boolean {
        var camPos = camera.getPosition()._partsCoord;
        var x = this._partsCoord.x;
        var y = this._partsCoord.y;
        var m = exceptRightBottomEdge ? 1 : 0;
        return (camPos.x <= x && x < camPos.x + WWAConsts.H_PARTS_NUM_IN_WINDOW - m &&
            camPos.y <= y && y < camPos.y + WWAConsts.V_PARTS_NUM_IN_WINDOW - m);
    }

    public hasLocalGate(): boolean {
        return (
            this._wwa.getMapTypeByPosition(this) === WWAConsts.MAP_LOCALGATE ||
            this._wwa.getObjectTypeByPosition(this) === WWAConsts.OBJECT_LOCALGATE
        );
    }

    public clone(): Position {
        return new Position(this._wwa, this._partsCoord.x, this._partsCoord.y, this._offsetCoord.x, this._offsetCoord.y);
    }

    public constructor(wwa: WWA, x: number, y: number, offsetX: number = 0, offsetY: number = 0) {
        this._wwa = wwa;
        if (this._wwa === void 0) {
            throw new Error("WWAのインスタンスが存在しません. ");
        }
        var w = this._wwa.getMapWidth();
        if (x < 0 || x >= w || x >= w - 1 && offsetX > 0 || y < 0 || y >= w || y >= w - 1 && offsetY > 0) {
            throw new Error("範囲外の座標です!! parts:(" + x + ", " + y + "), offset:(" + offsetX + ", " + offsetY + "), mapWidth = " + w);
        }
        this._partsCoord = new Coord(x, y);
        this._offsetCoord = new Coord(offsetX, offsetY);
    }

}

export class Face {
    public destPos: Coord;
    public srcPos: Coord;
    public srcSize: Coord;
    constructor(destPos: Coord, srcPos: Coord, srcSize: Coord) {
        this.destPos = destPos.clone();
        this.srcPos = srcPos.clone();
        this.srcSize = srcSize.clone();
    }
}
export class DrawPartsData {
    public partsIDObj: number;
    public x: number;
    public y: number;
    public isStatic: boolean;
    public isFighting: boolean;
    constructor(partsIDObj: number, x: number, y: number, isStatic: boolean, isFighting: boolean) {
        this.partsIDObj = partsIDObj;
        this.x = x;
        this.y = y;
        this.isStatic = isStatic;
        this.isFighting = isFighting;
    }
}


export enum ControlPanelBottomButton {
    GOTO_WWA = 0,
    BATTLE_REPORT = 1,
    GAME_END = 2
};

/**
 * 向きに合わせた数字
 * テンキーに合わせた付番
 * ```
 *     ^
 *   7 8 9 
 * < 4 5 6 >
 *   1 2 3
 *     v
 * ```
 */
export enum Direction {
    // 0 は使わない
    UNUSED = 0,

    // プレイヤーの向き
    LEFT = 4,
    RIGHT = 6,
    DOWN = 2,
    UP = 8,

    // ここから下はプレイヤー使用不可
    LEFT_DOWN = 1,
    LEFT_UP = 7,
    RIGHT_DOWN = 3,
    RIGHT_UP = 9,

    // 向きなしは、マクロ$movesで「プレイヤーの動きなしに物体を動かす」時に使う
    NO_DIRECTION = 5
};

// テンキーベースの方向 (Direction) から2次元のベクトルに変換 (Y軸下向き)
export const vx = [ 0, -1, 0, 1, -1, 0, 1, -1, 0, 1];
export const vy = [ 0, 1, 1, 1, 0, 0, 0, -1, -1, -1]

export enum YesNoState {
    YES,
    NO,
    UNSELECTED
}

export enum AppearanceTriggerType {
    MAP,
    OBJECT,
    //        USE_ITEM,
    CHOICE_YES,
    CHOICE_NO
}

export enum ItemMode {
    NORMAL = 0,
    CAN_USE = 1,
    NOT_DISAPPEAR = 2
}

export enum PartsType {
    MAP = 1,
    OBJECT = 0
}

export class UserDevice {
    public os: number;
    public browser: number;
    public device: number;
    public constructor() {
        var ua: string = window.navigator.userAgent;
        this.os = this._getOS(ua);
        this.browser = this.getBrowser(ua);
        this.device = this.getDevice();
    }
    private _getOS(ua: string): number{
        if (ua.match(/xbox/i)) {
            return OS_TYPE.XBOX;
        }
        if (ua.match(/windows/i)) {
            return OS_TYPE.WINDOWS;
        }
        if (ua.match(/macintosh/i)) {
            // iPadOS において、デフォルトで Safari は PC向けサイトを表示する設定になっている。
            // その場合、 ユーザエージェント は Macintosh 扱いとなる。
            // ここでは、touchStart イベントが実装されているかどうかを見て iPadOS か macOSかを判定する。
            // (2020-06-07 現在、タッチパネルが搭載されたmac端末は発売されていないため、macOS を iPad に誤検知することは起こりにくいはず。)
            return "ontouchstart" in document ? OS_TYPE.IOS : OS_TYPE.MACINTOSH;
        }
        if (ua.match(/iphone|ipad|ipod/i)) {
            return OS_TYPE.IOS;
        }
        if (ua.match(/oculus/i)) {
            return OS_TYPE.OCULUS;
        }
        if (ua.match(/android/i)) {
            return OS_TYPE.ANDROID;
        }
        if (ua.match(/nintendo/i)) {
            return OS_TYPE.NINTENDO;
        }
        if (ua.match(/playstation/i)) {
            return OS_TYPE.PLAY_STATION;
        }
        if (ua.match(/linux/i)) {
            return OS_TYPE.LINUX;
        }
        return OS_TYPE.OTHERS;
    }

   private getBrowser(ua: string): number{
        // 現行 Edge は Chromium なので、 Chrome 扱いする。
        if (ua.match(/chrome/i)) {
            return BROWSER_TYPE.CHROME;
        }
        if (ua.match(/firefox/i)) {
            return BROWSER_TYPE.FIREFOX;
        }
        if (ua.match(/safari/i)) {
            return BROWSER_TYPE.SAFARI;
        }
        return BROWSER_TYPE.OTHERS;
    }
    private getDevice(): number {
        switch (this.os) {
            case OS_TYPE.WINDOWS:
            case OS_TYPE.MACINTOSH:
            case OS_TYPE.LINUX:
                return DEVICE_TYPE.PC;
            case OS_TYPE.IOS:
            case OS_TYPE.ANDROID:
                return DEVICE_TYPE.SP;
            case OS_TYPE.OCULUS:
                return DEVICE_TYPE.VR;
            case OS_TYPE.NINTENDO:
            case OS_TYPE.PLAY_STATION:
            case OS_TYPE.XBOX:
                return DEVICE_TYPE.GAME;
        }
        return DEVICE_TYPE.OTHERS;
    }
}

export enum OS_TYPE {
    WINDOWS = 1,
    MACINTOSH = 2,
    LINUX = 3,
    ANDROID = 4,
    IOS = 5,
    NINTENDO = 6,
    PLAY_STATION = 7,
    OCULUS = 8,
    XBOX = 9,
    OTHERS = 9999
}

export enum DEVICE_TYPE {
    PC = 1,
    SP = 2,
    VR = 3,
    GAME = 4,
    OTHERS = 9999
}

export enum BROWSER_TYPE {
    CHROME = 1,
    FIREFOX = 2,
    SAFARI = 3,
    OTHERS = 9999
}

export enum ChoiceCallInfo {
    NONE,
    CALL_BY_MAP_PARTS,
    CALL_BY_OBJECT_PARTS,
    CALL_BY_ITEM_USE,
    CALL_BY_QUICK_SAVE,
    CALL_BY_QUICK_LOAD,
    CALL_BY_RESTART_GAME,
    CALL_BY_GOTO_WWA,
    CALL_BY_PASSWORD_SAVE,
    CALL_BY_PASSWORD_LOAD,
    CALL_BY_END_GAME,
    CALL_BY_SUSPEND,
    CALL_BY_LOG_QUICK_SAVE,
    CALL_BY_LOG_QUICK_LOAD
}

export enum SidebarButton {
    QUICK_LOAD = 0,
    QUICK_SAVE = 1,
    RESTART_GAME = 2,
    GOTO_WWA = 3
}

export enum SpeedChange {
    UP = 0,
    DOWN = 1
}

export enum LoadType {
    QUICK_LOAD,
    RESTART_GAME,
    PASSWORD
}
export enum MoveType {
    STATIC = 0,
    CHASE_PLAYER = 1,
    RUN_OUT = 2,
    HANG_AROUND = 3
}

export enum SecondCandidateMoveType {
    MODE_X,
    MODE_Y,
    UNDECIDED
}
export var sidebarButtonCellElementID = ["cell-load", "cell-save", "cell-restart", "cell-gotowwa"];


export enum MacroType {
    UNDEFINED = 0,
    IMGPLAYER = 1,
    IMGYESNO = 2,
    HPMAX = 3,
    SAVE = 4,
    ITEM = 5,
    DEFAULT = 6,
    OLDMAP = 7,
    PARTS = 8,
    MOVE = 9,
    MAP = 10,
    DIRMAP = 11,
    IMGFRAME = 12,
    IMGBOM = 13,
    DELPLAYER = 14,
    FACE = 15,
    EFFECT = 16,
    GAMEOVER = 17,
    IMGCLICK = 18,
    STATUS = 19,
    EFFITEM = 20,
    COLOR = 21,
    WAIT = 22,
    SOUND = 23,
    JUMPGATE = 24,
    RECPOSITION = 25,
    JUMPRECPOSITION = 26,
    CONSOLE_LOG = 27,
    COPY_HP_TO = 28,
    SET_HP = 29,
    COPY_HPMAX_TO = 30,
    SET_HPMAX = 31,
    COPY_AT_TO = 32,
    SET_AT = 33,
    COPY_DF_TO = 34,
    SET_DF = 35,
    COPY_MONEY_TO = 36,
    SET_MONEY = 37,
    COPY_STEP_COUNT_TO = 38,
    VAR_SET_VAL = 39,
    VAR_SET = 40,
    VAR_ADD = 41,
    VAR_SUB = 42,
    VAR_MUL = 43,
    VAR_DIV = 44,
    VAR_SET_RAND = 45,
    SHOW_STR = 46,
    GAME_SPEED = 47,
    IF = 50,
    SET_SPEED = 51,
    COPY_TIME_TO = 52,
    HIDE_STATUS = 53,
    VAR_MAP = 54,
    VAR_MOD = 55,
    NO_GAMEOVER = 56,
    ELSE_IF = 57,
    ELSE = 58,
    END_IF = 59,
    SET = 60,
    MAP2 = 61,
    SHOW_STR2 = 62,
    CONSOLE_LOG2 = 63,
    DELAYBGM = 64,
    SYSMSG = 65,
    GAMEPAD_BUTTON = 100,
    OLDMOVE = 101,
    LEGACY_IF = 10050
}

export type ConditionalExecuteMacroType = MacroType.IF | MacroType.ELSE_IF | MacroType.ELSE | MacroType.END_IF;
export type PreprocessMacroType = ConditionalExecuteMacroType | MacroType.SHOW_STR | MacroType.SHOW_STR2;

export var macrotable = {
    "": 0,
    "$imgplayer": 1,
    "$imgyesno": 2,
    "$hpmax": 3,
    "$save": 4,
    "$item": 5,
    "$default": 6,
    "$oldmap": 7,
    "$parts": 8,
    "$move": 9,
    "$map": 10,
    "$dirmap": 11,
    "$imgframe": 12,
    "$imgbom": 13,
    "$delplayer": 14,
    "$face": 15,
    "$effect": 16,
    "$gameover": 17,
    "$imgclick": 18,
    "$status": 19,
    "$effitem": 20,
    "$color": 21,
    "$wait": 22,
    "$sound": 23,
    "$jumpgate": 24,
    "$rec_pos": 25,
    "$jump_rec_pos": 26,
    "$console_log": 27,
    "$copy_hp_to": 28,
    "$set_hp": 29,
    "$copy_hpmax_to": 30,
    "$set_hpmax": 31,
    "$copy_at_to": 32,
    "$set_at": 33,
    "$copy_df_to": 34,
    "$set_df": 35,
    "$copy_money_to": 36,
    "$set_money": 37,
    "$copy_step_count_to": 38,
    "$var_set_val": 39,
    "$var_set": 40,
    "$var_add": 41,
    "$var_sub": 42,
    "$var_mul": 43,
    "$var_div": 44,
    "$var_set_rand": 45,
    "$show_str": 46,
    "$game_speed": 47,
    "$if": 50,
    "$set_speed": 51,
    "$copy_time_to": 52,
    "$hide_status": 53,
    "$var_map": 54,
    "$var_mod": 55,
    "$no_gameover": 56,
    "$else_if": 57,
    "$else": 58,
    "$endif": 59,
    "$set": 60,
    "$map2": 61,
    "$show_str2": 62,
    "$console_log2": 63,
    "$delaybgm": 64,
    "$sysmsg": 65,
    "$gamepad_button" : 100,
    "$oldmove": 101
}


export enum MacroStatusIndex {
    ENERGY = 0,
    STRENGTH = 1,
    DEFENCE = 2,
    GOLD = 3,
    MOVES = 4
}

export enum MacroImgFrameIndex {
    ENERGY = 0,
    STRENGTH = 1,
    DEFENCE = 2,
    GOLD = 3,
    WIDE_CELL_ROW = 4,
    ITEM_BG = 5,
    MAIN_FRAME = 6
}

export enum SystemSound {
    DECISION = 1,
    ATTACK = 3,
    BGM_LB = 70,
    NO_SOUND = 99
}

export const speedList = [1, 2, 5, 8, 10, 20];
export const speedNameList = ["超低速", "低速", "準低速", "中速", "高速", "超高速"];
export const StatusKind = ["energy", "strength", "defence", "gold"] as const;
export type StatusKind = typeof StatusKind[number];
export class WWAConsts {
    static WWA_HOME: string = "http://wwajp.com";

    static ITEMBOX_SIZE: number = 12;
    static MAP_ATR_MAX: number = 60;
    static OBJ_ATR_MAX: number = 60;
    static OLD_MAP_ATR_MAX: number = 40;
    static OLD_OBJ_ATR_MAX: number = 40;
    /*
    static ATR_CROP1: number = 1;
    static ATR_CROP2: number = 2;
    */
    static ATR_TYPE: number = 3;
    static ATR_MODE: number = 4;
    static ATR_STRING: number = 5;
    static ATR_X: number = 6;
    static ATR_Y: number = 7;
    static ATR_X2: number = 8;
    static ATR_Y2: number = 9;
    static ATR_ENERGY: number = 10;
    static ATR_STRENGTH: number = 11;
    static ATR_DEFENCE: number = 12;
    static ATR_GOLD: number = 13;
    static ATR_ITEM: number = 14;
    static ATR_NUMBER: number = 15;
    static ATR_JUMP_X: number = 16;
    static ATR_MOVE: number = 16;
    static ATR_JUMP_Y: number = 17;
    static ATR_SOUND: number = 19;

    static ATR_APPERANCE_BASE: number = 20;
    static REL_ATR_APPERANCE_ID: number = 0;
    static REL_ATR_APPERANCE_X: number = 1;
    static REL_ATR_APPERANCE_Y: number = 2;
    static REL_ATR_APPERANCE_TYPE: number = 3;
    static REL_ATR_APPERANCE_UNIT_LENGTH: number = 4;

    static ATR_RANDOM_BASE: number = 10;
    static RANDOM_ATR_NUM: number = 10;
    static RANDOM_ITERATION_MAX: number = 10;

    static MAP_STREET: number = 0;
    static MAP_WALL: number = 1;
    static MAP_LOCALGATE: number = 2;
    static MAP_URLGATE: number = 4;

    static OBJECT_NORMAL: number = 0;
    static OBJECT_MESSAGE: number = 1;
    static OBJECT_URLGATE: number = 2;
    static OBJECT_STATUS: number = 3;
    static OBJECT_ITEM: number = 4;
    static OBJECT_DOOR: number = 5;
    static OBJECT_MONSTER: number = 6;
    static OBJECT_SCORE: number = 11;
    static OBJECT_SELL: number = 14;
    static OBJECT_BUY: number = 15;
    static OBJECT_RANDOM: number = 16;
    static OBJECT_SELECT: number = 17;
    static OBJECT_LOCALGATE: number = 18;

    static SYSTEM_MESSAGE_NUM: number = 20;

    static IMGPOS_DEFAULT_YESNO_X: number = 3;
    static IMGPOS_DEFAULT_YESNO_Y: number = 1;

    static IMGRELPOS_YESNO_YES_X: number = 0;
    static IMGRELPOS_YESNO_NO_X: number = 1;
    static IMGRELPOS_YESNO_YESP_X: number = 2;
    static IMGRELPOS_YESNO_NOP_X: number = 3;

    static IMGPOS_DEFAULT_CLICKABLE_ITEM_SIGN_X: number = 0;
    static IMGPOS_DEFAULT_CLICKABLE_ITEM_SIGN_Y: number = 0;

    static IMGPOS_DEFAULT_FRAME_X: number = 0;
    static IMGPOS_DEFAULT_FRAME_Y: number = 1;

    static IMGPOS_DEFAULT_BATTLE_EFFECT_X: number = 3;
    static IMGPOS_DEFAULT_BATTLE_EFFECT_Y: number = 3;

    static DEFAULT_DISABLE_SAVE: boolean = false;
    static DEFAULT_OLDMAP: boolean = false;
    static DEFAULT_OBJECT_NO_COLLAPSE: boolean = false;

    static SPLASH_SCREEN_DISP_MILLS: number = 100; // ms
    static DEFAULT_FRAME_INTERVAL: number = 20; // ms
    static GAMEOVER_FRAME_INTERVAL: number = 50; // ms

    static YESNO_PRESS_DISP_FRAME_NUM: number = 20; // f
    static WAIT_TIME_FRAME_NUM: number = 6; // f


    static CHIP_SIZE: number = 40;
    static MAP_WINDOW_WIDTH: number = 440;
    static MAP_WINDOW_HEIGHT: number = 440;
    static H_PARTS_NUM_IN_WINDOW: number = WWAConsts.MAP_WINDOW_WIDTH / WWAConsts.CHIP_SIZE;
    static V_PARTS_NUM_IN_WINDOW: number = WWAConsts.MAP_WINDOW_HEIGHT / WWAConsts.CHIP_SIZE;

    static MIN_SPEED_INDEX = 0;
    static MAX_SPEED_INDEX = speedList.length - 1;
    static QUICK_BATTLE_SPEED_INDECIES = [speedList.length - 2, speedList.length - 1];

    static ANIMATION_REP_HALF_FRAME: number = 22;
    static PLAYER_LOOKING_AROUND_START_FRAME: number = WWAConsts.ANIMATION_REP_HALF_FRAME * 4;

    static RELATIVE_COORD_BIAS: number = 10000;
    static RELATIVE_COORD_LOWER: number = WWAConsts.RELATIVE_COORD_BIAS - 1000;
    static PLAYER_COORD: number = WWAConsts.RELATIVE_COORD_BIAS - 1000;

    static LOCALGATE_PLAYER_WAIT_FRAME: number = 5

    static STATUS_CHANGED_EFFECT_FRAME_NUM: number = 20;

    static PASSABLE_OBJECT: number = 1;

    static APPERANCE_PARTS_MIN_INDEX: number = 0;
    static APPERANCE_PARTS_MAX_INDEX: number = 9;
    static APPERANCE_PARTS_MIN_INDEX_NO: number = 5;
    static APPERANCE_PARTS_MAX_INDEX_YES: number = 4;

    static FADEOUT_SPEED: number = 8;

    static STATUS_MINUS_BORDER: number = 30000;

    static ITEMBOX_IS_FULL: number = -1;

    static BATTLE_INTERVAL_FRAME_NUM: number = 10; // f [200/20]
    static BATTLE_SPEED_CHANGE_TURN_NUM: number = 40; // モンスターターンを含む, バトルを早送りにするまでのターン数

    static RANDOM_MOVE_ITERATION_NUM: number = 50;
    static RANDOM_MOVE_ITERATION_NUM_BEFORE_V31: number = 8;

    static BATTLE_ESTIMATE_MONSTER_TYPE_MAX: number = 8;

    static SOUND_MAX: number = 100;

    static ITEM_BORDER_IMG_DATA_URL: string =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAArklEQVRYR" +
        "+2Y0QqAIAxFt///aENJHwxxuJUSxzeh3S7HXaNpEkly4FIRzba0GEyHeVTN7jqDWvb7V4Y1NLibZIY0" +
        "NbiL5G3MZLCe / 1fn3XJgJYjB7mgg6O1VCEKwXo79JeklY62nB62kRs9BEIKkeNIDhISQEBJC4k0BB" +
        "CF4D7D4cV9shf99ixdB + MrM0y3fa3zV05D45GOqhwPMGPkYlccIOEY2VKUN0UNVXxC7ADj7mDi9aF" +
        "ZZAAAAAElFTkSuQmCC";

    static LOAD_STAGE_MAX_EXCEPT_AUDIO = 7;

    static WWA_STYLE_TAG_ID = "wwa-additional-style";
    static DEFAULT_FRAME_COLOR_R = 0xff;
    static DEFAULT_FRAME_COLOR_G = 0xff;
    static DEFAULT_FRAME_COLOR_B = 0xff;
    static DEFAULT_FRAMEOUT_COLOR_R = 0x60;
    static DEFAULT_FRAMEOUT_COLOR_G = 0x60;
    static DEFAULT_FRAMEOUT_COLOR_B = 0x60;
    static DEFAULT_STRBACK_COLOR_R = 0x0;
    static DEFAULT_STRBACK_COLOR_G = 0x0;
    static DEFAULT_STRBACK_COLOR_B = 0x0;
    static DEFAULT_STATUS_COLOR_R = 0x0;
    static DEFAULT_STATUS_COLOR_G = 0x0;
    static DEFAULT_STATUS_COLOR_B = 0x0;

    static KEYPRESS_MESSAGE_CHANGE_FRAME_NUM = 20;

    static WWAP_SERVER_OLD = "http://wwawing.com/wwap";
    static WWAP_SERVER = "https://wwaphoenix.github.io";
    static WWAP_SERVER_AUDIO_DIR = "audio";
    static WWAP_SERVER_TITLE_IMG = "cover_p.gif";
    static WWAP_SERVER_LOADER_NO_WORKER = "wwaload.noworker.js";

    static SCREEN_WIDTH = 560;
    static SCREEN_HEIGHT = 440;
    static LOADING_FONT = "Times New Roman";

    static MSG_STR_WIDTH = 16;

    static ITEM_EFFECT_SPEED_PIXEL_PER_FRAME = 20;

    static ITEMBOX_TOP_Y = 140;

    static USER_VAR_NUM = 256;
    /**
     * ユーザ変数の最大値. MAX_SAFE_INTEGER (2^53 - 1) 相当だが、IE11を考慮して数値を直接コーディングしている。
     * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
     */
    static USER_VAR_NUM_MAX_VALUE = 9007199254740991;
    /**
     * ユーザ変数の最小値. MIN_SAFE_INTEGER (-(2^53 -1)) 相当だが、IE11を考慮して数値を直接コーディングしている。
     * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_SAFE_INTEGER
     */
    static USET_VAR_NUM_MIN_VALUE = -9007199254740991; 
    static CONTROLL_WAIT_FRAME: number = 6;//メニューでのキー入力待機フレーム数

    /**
     * ゲーム内ユーザ変数ビューワで1度に表示できる変数の数
     */
    static INLINE_USER_VAR_VIEWER_DISPLAY_NUM = 10;

}
export class WWASaveConsts {
    static QUICK_SAVE_MAX: number = 4;//保存可能なクイックセーブデータ数
    static QUICK_SAVE_THUMNAIL_WIDTH: number = 99;//セーブデータサムネイル横幅
    static QUICK_SAVE_THUMNAIL_HEIGHT: number = 99;//セーブデータサムネイル縦幅
    static SAVE_INTERVAL_MOVE: number = 200; //この歩数ごとにオートセーブ
    static INDEXEDDB_DB_NAME: string = "WWA_WING_DB";   //IndexedDBに保存するDBの名称
    static INDEXEDDB_TABLE_NAME: string = "SAVE_TABLE"; //IndexedDBに保存するテーブルの名称
    static DATE_LAST_SAVE_TEXT_COLOR: string = "rgba(255,255,0,1)";
}

export class WWAButtonTexts {
    static EMPTY_LOAD: string = "";
    static EMPTY_SAVE: string = "";
    static PASSWORD: string         = "Password";
    static QUICK_SAVE: string       = "Quick Save";
    static QUICK_LOAD: string       = "Quick Load";
    static BATTLE_REPORT: string    = "Battle Report";
    static GAME_END: string         = "Game End";
    static GOTO_WWA: string         = "Goto WWA";
    static RESTART_GAME: string     = "Restart Game";
}

export class LoaderResponse {
    error: LoaderError;
    progress: LoaderProgress;
    wwaData: WWAData;
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

export enum LoadStage {
    INIT = 0,
    MAP_LOAD = 1,
    OBJ_LOAD = 2,
    MAP_ATTR = 3,
    OBJ_ATTR = 4,
    RAND_PARTS = 5,
    MESSAGE = 6,
    GAME_INIT = 7,
    AUDIO = 8,
    FINISH = 9
}

export var loadMessages = [
    "ロードの準備をしています。",
    "背景パーツを読み込んでいます。",
    "物体パーツを読み込んでます。",
    "背景パーツの属性を読み込んでます。",
    "物体パーツの属性を読み込んでます。",
    "ランダムパーツを置換しています。",
    "メッセージを読み込んでます。",
    "Welcome to WWA Wing!"
]; // Welcome は実際には表示されません。詰め物程度に。

export var loadMessagesClassic = [
    "Welcome to WWA Wing!",
    "Now Map Data Loading .....",
    "Now CG Data Loading .....",
    "Now Making chara CG ....."
];

export enum LoadingMessagePosition {
    LINE = 30, // 1行分のサイズだけど描画位置でよく利用するのでPositionに入る
    TITLE_X = 100,
    TITLE_Y = 70,
    LOADING_X = 50,
    LOADING_Y = 140,
    ERROR_X = 10,
    ERROR_Y = 180,
    FOOTER_X = 160,
    FOOTER_Y = 360,
    WORLD_Y = FOOTER_Y - LINE, // マップデータのバージョンを表示する領域を確保したいので1行分減らす
    COPYRIGHT_Y = FOOTER_Y + LINE
}

export enum LoadingMessageSize {
    TITLE = 32,
    LOADING = 22,
    FOOTER = 18,
    ERRROR = 16
}

export enum ChangeStyleType {
    COLOR_FRAME = 0,
    COLOR_FRAMEOUT = 1,
    COLOR_STR = 2,
    //        COLOR_STRBACK = 3,
    COLOR_STATUS_STR = 4,
    //        COLOR_STATUS_STRBACK = 5
};

export enum SelectorType {
    MESSAGE_WINDOW = 0,
    SIDEBAR = 1
};

export enum IDTable {
    BITSHIFT = 16,
    BITMASK = 0xFFFF
};

/**
 * ステータスの計算方法の種類
 * all: 素手 + 装備品
 * bare: 素手のみ
 * equipment 装備品のみ
 */
export type StatusSolutionKind = "all" | "bare" | "equipment";

export type UserVarNameListRequestErrorKind = JsonResponseErrorKind | "notObject" | "noFileSpecified";

/**
 * スコア表示で使用されるオプション
 */
export interface ScoreOptions {
    rates: ScoreRates
}

/**
 * スコア表示で使用するレート
 */
export interface ScoreRates {
    energy: number;
    strength: number;
    defence: number;
    gold: number;
}

/**
 * メッセージを表示しているパーツ
 */
export interface TriggerParts {
    id: number;
    type: PartsType;
    position: Coord;
}
