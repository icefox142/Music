/** Music genre enum / 音乐流派枚举 */
export const MusicGenre = {
  /** Pop / 流行 */
  POP: "POP",

  /** Rock / 摇滚 */
  ROCK: "ROCK",

  /** Hip Hop / 嘻哈 */
  HIP_HOP: "HIP_HOP",

  /** R&B / 节奏蓝调 */
  RNB: "RNB",

  /** Jazz / 爵士 */
  JAZZ: "JAZZ",

  /** Classical / 古典 */
  CLASSICAL: "CLASSICAL",

  /** Electronic / 电子 */
  ELECTRONIC: "ELECTRONIC",

  /** Country / 乡村 */
  COUNTRY: "COUNTRY",

  /** Reggae / 雷鬼 */
  REGGAE: "REGGAE",

  /** Blues / 布鲁斯 */
  BLUES: "BLUES",

  /** Metal / 金属 */
  METAL: "METAL",

  /** Folk / 民谣 */
  FOLK: "FOLK",

  /** Latin / 拉丁 */
  LATIN: "LATIN",

  /** Asian Pop / 亚流行 */
  ASIAN_POP: "ASIAN_POP",

  /** Other / 其他 */
  OTHER: "OTHER",
} as const;

/** Music genre type / 音乐流派类型 */
export type MusicGenreType = (typeof MusicGenre)[keyof typeof MusicGenre];

/** Music language enum / 音乐语言枚举 */
export const MusicLanguage = {
  /** Chinese / 中文 */
  CHINESE: "CHINESE",

  /** English / 英文 */
  ENGLISH: "ENGLISH",

  /** Japanese / 日语 */
  JAPANESE: "JAPANESE",

  /** Korean / 韩语 */
  KOREAN: "KOREAN",

  /** French / 法语 */
  FRENCH: "FRENCH",

  /** Spanish / 西班牙语 */
  SPANISH: "SPANISH",

  /** German / 德语 */
  GERMAN: "GERMAN",

  /** Italian / 意大利语 */
  ITALIAN: "ITALIAN",

  /** Portuguese / 葡萄牙语 */
  PORTUGUESE: "PORTUGUESE",

  /** Russian / 俄语 */
  RUSSIAN: "RUSSIAN",

  /** Instrumental / 纯音乐 */
  INSTRUMENTAL: "INSTRUMENTAL",

  /** Other / 其他 */
  OTHER: "OTHER",
} as const;

/** Music language type / 音乐语言类型 */
export type MusicLanguageType = (typeof MusicLanguage)[keyof typeof MusicLanguage];
