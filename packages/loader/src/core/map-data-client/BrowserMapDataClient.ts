import { BaseMapDataClient, MapDataClientCallback } from "./BaseMapDataClient";

/**
 * ブラウザで使うマップデータを取得するクライアント
 */
export class BrowserMapDataClient extends BaseMapDataClient {
  constructor(private uri: string) {
    super();
  }
  public request(callback: MapDataClientCallback): void {
    const xhr: XMLHttpRequest = new XMLHttpRequest();
    try {
      xhr.open("GET", this.uri, true);
      xhr.responseType = "arraybuffer";

      xhr.onloadend = () => {
        try {
          if (xhr.status === 200 || xhr.status === 304) {
            callback(undefined, xhr.response)
          } else if (xhr.status === 404) {
            throw new Error(
              "マップデータ「" +
              this.uri +
              "」が見つかりませんでした。\n" +
              "HTTPステータスコードは " +
              xhr.status +
              "です。"
            );
          } else if (xhr.status === 403) {
            throw new Error(
              "マップデータ「" +
              this.uri +
              "」を読み取る権限がないようです。\n" +
              "管理者の方へ: マップデータのパーミッションを確認してください。\n" +
              "HTTPステータスコードは " +
              xhr.status +
              "です。"
            );
          } else {
            throw new Error(
              "マップデータ「" +
              this.uri +
              "」の読み込みに失敗しました。\n" +
              "HTTPステータスコードは " +
              xhr.status +
              "です。"
            );
          }
        } catch (error) {
          callback(error)
        }
      };
      xhr.send(null);
    } catch (e) {
      callback(new Error(
        "ロードエラー: ローカルテストの場合は、ブラウザが対応していない可能性があります。\n" +
        e.message
      ));
    }
  }
}
