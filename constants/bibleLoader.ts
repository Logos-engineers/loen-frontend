/**
 * bibleLoader.ts
 * Static import map for all 66 Bible books.
 * Uses explicit require() calls (not dynamic) to be safe for Expo/React Native bundler.
 */

export type BibleVerse = {
  verse: number;
  text: string;
};

export type BibleChapter = {
  chapter: number;
  verses: BibleVerse[];
};

export type BibleDoc = {
  code: string;
  name: string;
  totalChapters: number;
  chapters: BibleChapter[];
};

// ─── Static import map ──────────────────────────────────────────────────────
const BIBLE_MAP: Record<string, BibleDoc> = {
  GEN: require('../assets/bible/GEN.json'),
  EXO: require('../assets/bible/EXO.json'),
  LEV: require('../assets/bible/LEV.json'),
  NUM: require('../assets/bible/NUM.json'),
  DEU: require('../assets/bible/DEU.json'),
  JOS: require('../assets/bible/JOS.json'),
  JDG: require('../assets/bible/JDG.json'),
  RUT: require('../assets/bible/RUT.json'),
  '1SA': require('../assets/bible/1SA.json'),
  '2SA': require('../assets/bible/2SA.json'),
  '1KI': require('../assets/bible/1KI.json'),
  '2KI': require('../assets/bible/2KI.json'),
  '1CH': require('../assets/bible/1CH.json'),
  '2CH': require('../assets/bible/2CH.json'),
  EZR: require('../assets/bible/EZR.json'),
  NEH: require('../assets/bible/NEH.json'),
  EST: require('../assets/bible/EST.json'),
  JOB: require('../assets/bible/JOB.json'),
  PSA: require('../assets/bible/PSA.json'),
  PRO: require('../assets/bible/PRO.json'),
  ECC: require('../assets/bible/ECC.json'),
  SNG: require('../assets/bible/SNG.json'),
  ISA: require('../assets/bible/ISA.json'),
  JER: require('../assets/bible/JER.json'),
  LAM: require('../assets/bible/LAM.json'),
  EZK: require('../assets/bible/EZK.json'),
  DAN: require('../assets/bible/DAN.json'),
  HOS: require('../assets/bible/HOS.json'),
  JOL: require('../assets/bible/JOL.json'),
  AMO: require('../assets/bible/AMO.json'),
  OBA: require('../assets/bible/OBA.json'),
  JON: require('../assets/bible/JON.json'),
  MIC: require('../assets/bible/MIC.json'),
  NAM: require('../assets/bible/NAM.json'),
  HAB: require('../assets/bible/HAB.json'),
  ZEP: require('../assets/bible/ZEP.json'),
  HAG: require('../assets/bible/HAG.json'),
  ZEC: require('../assets/bible/ZEC.json'),
  MAL: require('../assets/bible/MAL.json'),
  MAT: require('../assets/bible/MAT.json'),
  MRK: require('../assets/bible/MRK.json'),
  LUK: require('../assets/bible/LUK.json'),
  JHN: require('../assets/bible/JHN.json'),
  ACT: require('../assets/bible/ACT.json'),
  ROM: require('../assets/bible/ROM.json'),
  '1CO': require('../assets/bible/1CO.json'),
  '2CO': require('../assets/bible/2CO.json'),
  GAL: require('../assets/bible/GAL.json'),
  EPH: require('../assets/bible/EPH.json'),
  PHP: require('../assets/bible/PHP.json'),
  COL: require('../assets/bible/COL.json'),
  '1TH': require('../assets/bible/1TH.json'),
  '2TH': require('../assets/bible/2TH.json'),
  '1TI': require('../assets/bible/1TI.json'),
  '2TI': require('../assets/bible/2TI.json'),
  TIT: require('../assets/bible/TIT.json'),
  PHM: require('../assets/bible/PHM.json'),
  HEB: require('../assets/bible/HEB.json'),
  JAS: require('../assets/bible/JAS.json'),
  '1PE': require('../assets/bible/1PE.json'),
  '2PE': require('../assets/bible/2PE.json'),
  '1JN': require('../assets/bible/1JN.json'),
  '2JN': require('../assets/bible/2JN.json'),
  '3JN': require('../assets/bible/3JN.json'),
  JUD: require('../assets/bible/JUD.json'),
  REV: require('../assets/bible/REV.json'),
};

export function getBibleBook(code: string): BibleDoc | null {
  return BIBLE_MAP[code] ?? null;
}

export function getAllBooks(): BibleDoc[] {
  return Object.values(BIBLE_MAP);
}
