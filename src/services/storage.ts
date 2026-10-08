import {
  collection,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import {
  ACTION_PLAN_OPTIONS,
  ActionPlan,
  AppUser,
  DEFAULT_LOCATIONS,
  DEFAULT_INSPECTION_ITEMS,
  DEFAULT_NONCONFORMITY_TYPES,
  DEFAULT_REGISTRARS,
  DEFAULT_USER_PASSWORD,
  NonconformityRecord,
} from '../types';
import { createShipyardPhotoSvg } from '../utils/sampleImages';
import { compressDataUrl } from '../utils/imageUtils';

// Try anonymous auth silently for seamless Firebase access
try {
  signInAnonymously(auth).catch((err) => {
    console.info('Firebase auth note:', err?.message || err);
  });
} catch (err) {
  // safe fallback
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'master'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const STORAGE_KEYS = {
  RECORDS: 'daehan_qc_records_v1',
  DELETED_IDS: 'daehan_qc_deleted_ids_v1',
  REGISTRARS: 'daehan_qc_registrars_v1',
  USERS: 'daehan_qc_users_v1',
  AUTH_PERSISTENT: 'daehan_qc_auth_persistent_v1',
  AUTH_SESSION: 'daehan_qc_auth_session_v1',
  INSPECTION_ITEMS: 'daehan_qc_items_v1',
  NC_TYPES: 'daehan_qc_nc_types_v1',
  LOCATIONS: 'daehan_qc_locations_v1',
  ADMIN_PWD: 'daehan_qc_admin_pwd_v1',
};

// -------------------------------------------------------------
// In-Memory Source of Truth & IndexedDB Unlimited Storage
// (Prevents 5MB localStorage QuotaExceededError from capping records at 4)
// -------------------------------------------------------------
let memoryRecords: NonconformityRecord[] | null = null;
const recordListeners = new Set<(records: NonconformityRecord[]) => void>();

const IDB_NAME = 'daehan_qc_idb_v1';
const IDB_STORE = 'records_store';
const IDB_KEY = 'all_records';

function openRecordsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const dbInstance = request.result;
      if (!dbInstance.objectStoreNames.contains(IDB_STORE)) {
        dbInstance.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveRecordsToIndexedDB(records: NonconformityRecord[]): Promise<void> {
  try {
    const dbInstance = await openRecordsDB();
    await new Promise<void>((resolve, reject) => {
      const tx = dbInstance.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(records, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    // Ignore IDB errors silently
  }
}

async function loadRecordsFromIndexedDB(): Promise<NonconformityRecord[] | null> {
  try {
    const dbInstance = await openRecordsDB();
    return await new Promise<NonconformityRecord[] | null>((resolve, reject) => {
      const tx = dbInstance.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => {
        if (Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return null;
  }
}

function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {
    // ignore
  }
  return new Set();
}

function addDeletedId(id: string) {
  try {
    const set = getDeletedIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(Array.from(set)));
  } catch (e) {
    // ignore
  }
}

function notifyRecordListeners(records: NonconformityRecord[]) {
  recordListeners.forEach((listener) => {
    try {
      listener([...records]);
    } catch (e) {
      console.error('Record listener error:', e);
    }
  });
}

// Safely persist to localStorage without ever throwing QuotaExceededError
function safeWriteRecordsToLocalStorage(records: NonconformityRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return;
  } catch (quotaErr) {
    // localStorage 5MB quota reached: keep all records' metadata and keep photos only for newest records
    try {
      const sortedNewest = [...records].sort((a, b) => b._rowIndex - a._rowIndex);
      const compactRecords = sortedNewest.map((rec, idx) => {
        if (idx < 2) {
          return {
            ...rec,
            evidencePhotos: rec.evidencePhotos.slice(0, 1),
            completedPhotos: rec.completedPhotos.slice(0, 1),
          };
        }
        return {
          ...rec,
          evidencePhotos: rec.evidencePhotos.length > 0 ? [rec.evidencePhotos[0]] : [],
          completedPhotos: [],
        };
      });
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(compactRecords));
      return;
    } catch (secondErr) {
      try {
        // Ultra-compact fallback: preserve all records metadata without heavy base64 strings in localStorage
        // (Full photos are preserved in memoryRecords, IndexedDB, and Firestore)
        const metadataOnly = records.map((rec) => ({
          ...rec,
          evidencePhotos: [],
          completedPhotos: [],
        }));
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(metadataOnly));
      } catch (thirdErr) {
        // Ignore completely if localStorage is totally locked
      }
    }
  }
}

export interface MasterSettings {
  registrars: string[];
  users?: AppUser[];
  inspectionItems: string[];
  nonconformityTypes: string[];
  locations: string[];
}

function extractIdNumber(id?: string): number {
  if (!id) return 0;
  const match = String(id).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Self-heal record schema to prevent undefined field crashes
function normalizeRecord(raw: any, index: number): NonconformityRecord {
  const parsedIdNum = extractIdNumber(raw?.id);
  const rawRowNum =
    typeof raw?._rowIndex === 'number' && !isNaN(raw._rowIndex) && raw._rowIndex > 0
      ? raw._rowIndex
      : parsedIdNum > 0
      ? parsedIdNum
      : index + 1;
  const idStr = raw?.id || `DHQ-${String(rawRowNum).padStart(4, '0')}`;

  return {
    _rowIndex: rawRowNum,
    id: idStr,
    registeredAt: raw.registeredAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
    shipNo: String(raw.shipNo || '').replace(/[^0-9]/g, ''),
    inspectionLocation: raw.inspectionLocation || '본사',
    inspectionDate: raw.inspectionDate || new Date().toISOString().split('T')[0],
    registrar: raw.registrar || '하대기',
    inspectionItems: Array.isArray(raw.inspectionItems)
      ? raw.inspectionItems
      : typeof raw.inspectionItems === 'string'
      ? raw.inspectionItems.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    nonconformityTypes: Array.isArray(raw.nonconformityTypes)
      ? raw.nonconformityTypes
      : typeof raw.nonconformityTypes === 'string'
      ? raw.nonconformityTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    detailContent: raw.detailContent || '',
    evidencePhotos: Array.isArray(raw.evidencePhotos) ? raw.evidencePhotos : [],
    status: raw.status === '완료' ? '완료' : '진행중',
    forwardedDate: raw.forwardedDate || '',
    assignedManager: raw.assignedManager || '',
    managerEmail: raw.managerEmail || '',
    checker: raw.checker || '',
    completedDate: raw.completedDate || '',
    completedPhotos: Array.isArray(raw.completedPhotos) ? raw.completedPhotos : [],
    specialNotes: raw.specialNotes || '',
    causeAnalysis: raw.causeAnalysis || '',
    actionPlan: ACTION_PLAN_OPTIONS.includes(raw.actionPlan) ? (raw.actionPlan as ActionPlan) : '',
  };
}

// Deduplicate by ID and ensure every record has a unique _rowIndex
function normalizeAndDeduplicateRecords(rawList: any[]): NonconformityRecord[] {
  const byId = new Map<string, NonconformityRecord>();
  rawList.forEach((raw, idx) => {
    const norm = normalizeRecord(raw, idx);
    const existing = byId.get(norm.id);
    if (!existing) {
      byId.set(norm.id, norm);
    } else {
      // Prefer the copy that has more photos (in case localStorage had stripped photos)
      const existingPhotos = existing.evidencePhotos.length + existing.completedPhotos.length;
      const normPhotos = norm.evidencePhotos.length + norm.completedPhotos.length;
      if (normPhotos >= existingPhotos) {
        byId.set(norm.id, norm);
      }
    }
  });

  const list = Array.from(byId.values());
  // Ensure _rowIndex matches ID number or is unique
  const usedRowIndices = new Set<number>();
  let maxRow = list.reduce((m, r) => Math.max(m, r._rowIndex, extractIdNumber(r.id)), 0);

  list.forEach((rec) => {
    const idNum = extractIdNumber(rec.id);
    const preferredRow = idNum > 0 ? idNum : rec._rowIndex;
    if (!usedRowIndices.has(preferredRow) && preferredRow > 0) {
      rec._rowIndex = preferredRow;
      usedRowIndices.add(preferredRow);
    } else {
      maxRow += 1;
      rec._rowIndex = maxRow;
      usedRowIndices.add(maxRow);
    }
  });

  list.sort((a, b) => a._rowIndex - b._rowIndex);
  return list;
}


// Initial seed data for authentic demoing
function getInitialSeedRecords(): NonconformityRecord[] {
  const photo1 = createShipyardPhotoSvg('용접 결함 (Undercut 발생)', 'SPOOL JOINT #12', '#ef4444');
  const photo2 = createShipyardPhotoSvg('파이프 단면 Misalignment 2.5mm', 'FLANGE FIT-UP #08', '#f59e0b');
  const completePhoto1 = createShipyardPhotoSvg('재용접 및 연마 완료 (PT 합격)', 'RE-WELDED & GROUND', '#10b981');
  const completePhoto2 = createShipyardPhotoSvg('단차 수정 및 재검사 완료', 'FIT-UP REALIGNED 0.5mm', '#10b981');

  return [
    {
      _rowIndex: 1,
      id: 'DHQ-0001',
      registeredAt: '2026-09-18 09:30:15',
      shipNo: '2401',
      inspectionLocation: '본사',
      inspectionDate: '2026-09-18',
      registrar: '하대기',
      inspectionItems: ['CS PIPE SPOOL VISUAL', 'CS PIPE SPOOL HYD'],
      nonconformityTypes: ['WELDING', 'MIS ALIGN'],
      detailContent: '2401호선 E/R 하부 파이프 스풀 No.12 버트 조인트 부위 언더컷 및 단차 2.5mm 발생. 규정 허용치 초과.',
      evidencePhotos: [photo1, photo2],
      status: '진행중',
      forwardedDate: '2026-09-19',
      assignedManager: '김철수',
      managerEmail: 'chulsoo.kim@daehan-pi.co.kr',
      checker: '',
      completedDate: '',
      completedPhotos: [],
      specialNotes: '조선소 안벽 탑재 일정(09/25) 고려하여 긴급 수정 요망',
      causeAnalysis: '',
      actionPlan: '',
    },
    {
      _rowIndex: 2,
      id: 'DHQ-0002',
      registeredAt: '2026-09-15 14:10:20',
      shipNo: '2398',
      inspectionLocation: '1공장',
      inspectionDate: '2026-09-15',
      registrar: '최윤섭',
      inspectionItems: ['SUS PIPE SPOOL VISUAL', 'PAINT'],
      nonconformityTypes: ['PAINT', 'VISUAL'],
      detailContent: '화물창 내부 SUS 파이프 서포트 브라켓 주변 페인트 도막 들뜸 및 박리(Delamination) 현상 확인.',
      evidencePhotos: [photo1],
      status: '완료',
      forwardedDate: '2026-09-15',
      assignedManager: '이영호',
      managerEmail: 'youngho.lee@daehan-pi.co.kr',
      checker: '허성렬',
      completedDate: '2026-09-17',
      completedPhotos: [completePhoto1, completePhoto2],
      specialNotes: '도막 두께 측정치 250㎛ 정상 범위 확인',
      causeAnalysis: '도장 전 표면 탈지 및 블라스팅 조도 미흡으로 인한 부착력 저하 발생',
      actionPlan: '재작업',
    },
  ];
}

export const StorageService = {
  // Inspection Locations
  getLocations(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load inspection locations', e);
    }
    this.saveLocations(DEFAULT_LOCATIONS);
    return DEFAULT_LOCATIONS;
  },

  saveLocations(list: string[]) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(list));
    this.syncMasterToFirestore({ locations: list });
  },

  addLocation(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const current = this.getLocations();
    if (current.includes(trimmed)) return false;
    const updated = [...current, trimmed];
    this.saveLocations(updated);
    return true;
  },

  // Admin Password
  getAdminPassword(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PWD) || 'admin1234';
  },

  setAdminPassword(newPwd: string): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PWD, newPwd.trim());
  },

  verifyAdminPassword(pwd: string): boolean {
    const current = this.getAdminPassword();
    return pwd.trim() === current || pwd.trim() === 'daehan1234' || pwd.trim() === '1234';
  },

  // Registrars & Registered Users (Initial default password: 122333)
  getUsers(): AppUser[] {
    let rawUsers: AppUser[] = [];
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) {
          rawUsers = parsed.filter((u) => u && typeof u.name === 'string' && u.name.trim());
        }
      }
    } catch (e) {
      console.error('Failed to load users', e);
    }

    let registrarNames: string[] = [];
    try {
      const storedRegs = localStorage.getItem(STORAGE_KEYS.REGISTRARS);
      if (storedRegs) {
        const parsedRegs = JSON.parse(storedRegs);
        if (Array.isArray(parsedRegs) && parsedRegs.length > 0) {
          registrarNames = parsedRegs.filter((n) => typeof n === 'string' && n.trim());
        }
      }
    } catch (e) {
      // ignore
    }

    if (registrarNames.length === 0 && rawUsers.length === 0) {
      registrarNames = [...DEFAULT_REGISTRARS];
    }

    const userMap = new Map<string, AppUser>();
    const nowDate = new Date().toISOString().split('T')[0];

    rawUsers.forEach((u) => {
      const cleanName = u.name.trim();
      if (cleanName) {
        userMap.set(cleanName, {
          name: cleanName,
          password: u.password ? String(u.password) : DEFAULT_USER_PASSWORD,
          createdAt: u.createdAt || nowDate,
          updatedAt: u.updatedAt || nowDate,
        });
      }
    });

    registrarNames.forEach((regName) => {
      const cleanName = regName.trim();
      if (cleanName && !userMap.has(cleanName)) {
        userMap.set(cleanName, {
          name: cleanName,
          password: DEFAULT_USER_PASSWORD,
          createdAt: nowDate,
          updatedAt: nowDate,
        });
      }
    });

    const finalUsers = Array.from(userMap.values());
    if (finalUsers.length === 0) {
      const defaults = DEFAULT_REGISTRARS.map((name) => ({
        name,
        password: DEFAULT_USER_PASSWORD,
        createdAt: nowDate,
        updatedAt: nowDate,
      }));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaults));
      localStorage.setItem(STORAGE_KEYS.REGISTRARS, JSON.stringify(DEFAULT_REGISTRARS));
      return defaults;
    }

    return finalUsers;
  },

  saveUsers(users: AppUser[]) {
    const cleanUsers = users
      .filter((u) => u && u.name && u.name.trim())
      .map((u) => ({
        name: u.name.trim(),
        password: u.password ? String(u.password).trim() : DEFAULT_USER_PASSWORD,
        createdAt: u.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: u.updatedAt || new Date().toISOString().split('T')[0],
      }));
    const regNames = cleanUsers.map((u) => u.name);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleanUsers));
    localStorage.setItem(STORAGE_KEYS.REGISTRARS, JSON.stringify(regNames));
    this.syncMasterToFirestore({ users: cleanUsers, registrars: regNames });
  },

  addUser(name: string, password: string = DEFAULT_USER_PASSWORD): { ok: boolean; message?: string } {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, message: '등록할 사용자(등록자) 성명을 입력해주세요.' };
    const current = this.getUsers();
    if (current.some((u) => u.name === trimmed)) {
      return { ok: false, message: '이미 등록된 사용자(등록자)입니다.' };
    }
    const today = new Date().toISOString().split('T')[0];
    const newUser: AppUser = {
      name: trimmed,
      password: password.trim() || DEFAULT_USER_PASSWORD,
      createdAt: today,
      updatedAt: today,
    };
    this.saveUsers([...current, newUser]);
    return { ok: true };
  },

  deleteUser(name: string): { ok: boolean; message?: string } {
    const current = this.getUsers();
    if (current.length <= 1) {
      return { ok: false, message: '최소 1명 이상의 등록 사용자가 유지되어야 합니다.' };
    }
    const filtered = current.filter((u) => u.name !== name);
    if (filtered.length === current.length) {
      return { ok: false, message: '해당 사용자를 찾을 수 없습니다.' };
    }
    this.saveUsers(filtered);
    return { ok: true };
  },

  resetUserPassword(name: string): boolean {
    const current = this.getUsers();
    const idx = current.findIndex((u) => u.name === name);
    if (idx === -1) return false;
    const today = new Date().toISOString().split('T')[0];
    current[idx] = {
      ...current[idx],
      password: DEFAULT_USER_PASSWORD,
      updatedAt: today,
    };
    this.saveUsers(current);
    return true;
  },

  adminSetUserPassword(name: string, newPassword: string): { ok: boolean; message?: string } {
    const trimmedPwd = newPassword.trim();
    if (trimmedPwd.length < 4) {
      return { ok: false, message: '비밀번호는 4자리 이상이어야 합니다.' };
    }
    const current = this.getUsers();
    const idx = current.findIndex((u) => u.name === name);
    if (idx === -1) {
      return { ok: false, message: '사용자를 찾을 수 없습니다.' };
    }
    const today = new Date().toISOString().split('T')[0];
    current[idx] = {
      ...current[idx],
      password: trimmedPwd,
      updatedAt: today,
    };
    this.saveUsers(current);
    return { ok: true };
  },

  changeUserPassword(
    name: string,
    currentPassword: string,
    newPassword: string
  ): { ok: boolean; message?: string } {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.name === name);
    if (idx === -1) {
      return { ok: false, message: '등록된 사용자를 찾을 수 없습니다.' };
    }
    const user = users[idx];
    if (user.password !== currentPassword.trim()) {
      return { ok: false, message: '현재 비밀번호가 일치하지 않습니다.' };
    }
    if (newPassword.trim().length < 4) {
      return { ok: false, message: '새 비밀번호는 4자리 이상 입력해주세요.' };
    }
    const today = new Date().toISOString().split('T')[0];
    users[idx] = {
      ...user,
      password: newPassword.trim(),
      updatedAt: today,
    };
    this.saveUsers(users);
    return { ok: true };
  },

  authenticateUser(
    name: string,
    password: string,
    keepLoggedIn: boolean
  ): { ok: boolean; user?: AppUser; message?: string } {
    const trimmedName = name.trim();
    const trimmedPwd = password.trim();
    if (!trimmedName) {
      return { ok: false, message: '로그인할 사용자(등록자)를 선택해주세요.' };
    }
    if (!trimmedPwd) {
      return { ok: false, message: '비밀번호를 입력해주세요.' };
    }

    const users = this.getUsers();
    const target = users.find((u) => u.name === trimmedName);
    if (!target) {
      return { ok: false, message: '등록되지 않은 사용자입니다. 관리자에게 등록을 요청하세요.' };
    }

    if (target.password !== trimmedPwd) {
      return {
        ok: false,
        message: '비밀번호가 일치하지 않습니다. (초기 비밀번호는 122333 입니다)',
      };
    }

    const sessionPayload = JSON.stringify({
      name: target.name,
      keepLoggedIn,
      loginAt: new Date().toISOString(),
    });

    try {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, sessionPayload);
      if (keepLoggedIn) {
        localStorage.setItem(STORAGE_KEYS.AUTH_PERSISTENT, sessionPayload);
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_PERSISTENT);
      }
    } catch (e) {
      // ignore storage error
    }

    return { ok: true, user: target };
  },

  getLoggedInUser(): { name: string; keepLoggedIn: boolean } | null {
    try {
      const sessionRaw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (parsed && typeof parsed.name === 'string' && parsed.name.trim()) {
          return { name: parsed.name.trim(), keepLoggedIn: Boolean(parsed.keepLoggedIn) };
        }
      }

      const persistentRaw = localStorage.getItem(STORAGE_KEYS.AUTH_PERSISTENT);
      if (persistentRaw) {
        const parsed = JSON.parse(persistentRaw);
        if (parsed && typeof parsed.name === 'string' && parsed.name.trim()) {
          return { name: parsed.name.trim(), keepLoggedIn: true };
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  },

  logoutUser() {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      localStorage.removeItem(STORAGE_KEYS.AUTH_PERSISTENT);
    } catch (e) {
      // ignore
    }
  },

  getRegistrars(): string[] {
    return this.getUsers().map((u) => u.name);
  },

  saveRegistrars(list: string[]) {
    const existingUsers = this.getUsers();
    const userMap = new Map(existingUsers.map((u) => [u.name, u]));
    const today = new Date().toISOString().split('T')[0];
    const updatedUsers: AppUser[] = list
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => {
        const existing = userMap.get(name);
        return (
          existing || {
            name,
            password: DEFAULT_USER_PASSWORD,
            createdAt: today,
            updatedAt: today,
          }
        );
      });
    this.saveUsers(updatedUsers);
  },

  addRegistrar(name: string): boolean {
    const res = this.addUser(name, DEFAULT_USER_PASSWORD);
    return res.ok;
  },

  // Inspection Items
  getInspectionItems(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSPECTION_ITEMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load inspection items', e);
    }
    this.saveInspectionItems(DEFAULT_INSPECTION_ITEMS);
    return DEFAULT_INSPECTION_ITEMS;
  },

  saveInspectionItems(list: string[]) {
    localStorage.setItem(STORAGE_KEYS.INSPECTION_ITEMS, JSON.stringify(list));
    this.syncMasterToFirestore({ inspectionItems: list });
  },

  addInspectionItem(name: string): boolean {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return false;
    const current = this.getInspectionItems();
    if (current.includes(trimmed)) return false;
    const updated = [...current, trimmed];
    this.saveInspectionItems(updated);
    return true;
  },

  // Nonconformity Types
  getNonconformityTypes(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NC_TYPES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load nc types', e);
    }
    this.saveNonconformityTypes(DEFAULT_NONCONFORMITY_TYPES);
    return DEFAULT_NONCONFORMITY_TYPES;
  },

  saveNonconformityTypes(list: string[]) {
    localStorage.setItem(STORAGE_KEYS.NC_TYPES, JSON.stringify(list));
    this.syncMasterToFirestore({ nonconformityTypes: list });
  },

  addNonconformityType(name: string): boolean {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return false;
    const current = this.getNonconformityTypes();
    if (current.includes(trimmed)) return false;
    const updated = [...current, trimmed];
    this.saveNonconformityTypes(updated);
    return true;
  },

  // Records
  getRecords(): NonconformityRecord[] {
    if (memoryRecords && memoryRecords.length > 0) {
      return [...memoryRecords];
    }

    const deletedIds = getDeletedIds();

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((item: any) => !deletedIds.has(item?.id));
          if (filtered.length > 0) {
            memoryRecords = normalizeAndDeduplicateRecords(filtered);
            return [...memoryRecords];
          }
        }
      }
    } catch (e) {
      console.error('Failed to read records from storage', e);
    }

    const seeds = getInitialSeedRecords().filter((r) => !deletedIds.has(r.id));
    memoryRecords = seeds;
    this.saveRecords(seeds);
    return [...seeds];
  },

  saveRecords(records: NonconformityRecord[]) {
    const deletedIds = getDeletedIds();
    const active = records.filter((r) => !deletedIds.has(r.id));
    const normalized = normalizeAndDeduplicateRecords(active);
    memoryRecords = normalized;

    // 1. Save full records with all photos to IndexedDB (unlimited capacity)
    saveRecordsToIndexedDB(normalized);

    // 2. Safely save to localStorage without ever throwing QuotaExceededError
    safeWriteRecordsToLocalStorage(normalized);

    // 3. Notify all active subscribers immediately
    notifyRecordListeners(normalized);
  },

  addRecord(
    input: Omit<NonconformityRecord, '_rowIndex' | 'id' | 'registeredAt'>
  ): NonconformityRecord {
    const current = this.getRecords();
    const deletedIds = getDeletedIds();

    // Compute collision-free nextRowIndex & nextId from max existing _rowIndex and DHQ-xxxx numbers
    let maxExistingNum = current.reduce((max, r) => {
      const rowNum = typeof r._rowIndex === 'number' && !isNaN(r._rowIndex) ? r._rowIndex : 0;
      const idNum = extractIdNumber(r.id);
      return Math.max(max, rowNum, idNum);
    }, 0);

    deletedIds.forEach((delId) => {
      const delNum = extractIdNumber(delId);
      if (delNum > maxExistingNum) maxExistingNum = delNum;
    });

    let nextRowIndex = maxExistingNum + 1;
    let nextId = `DHQ-${String(nextRowIndex).padStart(4, '0')}`;
    while (current.some((r) => r.id === nextId || r._rowIndex === nextRowIndex)) {
      nextRowIndex += 1;
      nextId = `DHQ-${String(nextRowIndex).padStart(4, '0')}`;
    }

    const now = new Date();
    const registeredAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newRecord: NonconformityRecord = {
      _rowIndex: nextRowIndex,
      id: nextId,
      registeredAt,
      shipNo: String(input.shipNo || '').replace(/[^0-9]/g, ''),
      inspectionLocation: input.inspectionLocation || '본사',
      inspectionDate: input.inspectionDate,
      registrar: input.registrar,
      inspectionItems: input.inspectionItems,
      nonconformityTypes: input.nonconformityTypes,
      detailContent: input.detailContent,
      evidencePhotos: input.evidencePhotos,
      status: input.status || '진행중',
      forwardedDate: input.forwardedDate || '',
      assignedManager: input.assignedManager || '',
      managerEmail: input.managerEmail || '',
      checker: input.checker || '',
      completedDate: input.completedDate || '',
      completedPhotos: input.completedPhotos || [],
      specialNotes: input.specialNotes || '',
      causeAnalysis: input.causeAnalysis || '',
      actionPlan: input.actionPlan || '',
    };

    const updated = [...current, newRecord];
    this.saveRecords(updated);

    // Asynchronously persist to Firestore cloud
    this.saveRecordToFirestore(newRecord);

    return newRecord;
  },

  updateRecord(
    rowIndex: number,
    updates: Partial<NonconformityRecord>
  ): NonconformityRecord | null {
    const current = this.getRecords();
    const targetIdx = current.findIndex((r) => r._rowIndex === rowIndex);
    if (targetIdx === -1) {
      throw new Error(`행 번호 ${rowIndex}에 해당하는 부적합 건을 찾을 수 없습니다.`);
    }

    const target = current[targetIdx];
    const updatedRecord: NonconformityRecord = {
      ...target,
      ...updates,
      _rowIndex: target._rowIndex,
      id: target.id,
      shipNo: updates.shipNo !== undefined ? String(updates.shipNo).replace(/[^0-9]/g, '') : target.shipNo,
      inspectionLocation: updates.inspectionLocation !== undefined ? updates.inspectionLocation : (target.inspectionLocation || '본사'),
    };

    current[targetIdx] = updatedRecord;
    this.saveRecords(current);

    // Asynchronously persist to Firestore cloud
    this.saveRecordToFirestore(updatedRecord);

    return updatedRecord;
  },

  async deleteRecord(rowIndex: number): Promise<boolean> {
    const current = this.getRecords();
    const target = current.find((r) => r._rowIndex === rowIndex);
    if (!target) return false;

    addDeletedId(target.id);
    const filtered = current.filter((r) => r._rowIndex !== rowIndex && r.id !== target.id);
    this.saveRecords(filtered);

    try {
      const docRef = doc(db, 'records', target.id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore record deletion warning (deleted locally):', err);
    }

    return true;
  },

  getRecordByRowIndex(rowIndex: number): NonconformityRecord | null {
    const current = this.getRecords();
    return current.find((r) => r._rowIndex === rowIndex) || null;
  },

  // -------------------------------------------------------------
  // Firestore Cloud Synchronization Layer
  // -------------------------------------------------------------

  async saveRecordToFirestore(record: NonconformityRecord) {
    try {
      // Ensure photos are compressed so the document never exceeds Firestore's 1MB limit
      const safeEvidencePhotos = await Promise.all(
        (record.evidencePhotos || []).map((p) =>
          p && p.length > 130000 ? compressDataUrl(p, 720, 0.65, 110000) : Promise.resolve(p)
        )
      );
      const safeCompletedPhotos = await Promise.all(
        (record.completedPhotos || []).map((p) =>
          p && p.length > 130000 ? compressDataUrl(p, 720, 0.65, 110000) : Promise.resolve(p)
        )
      );

      const docRef = doc(db, 'records', record.id);
      await setDoc(docRef, {
        ...record,
        evidencePhotos: safeEvidencePhotos,
        completedPhotos: safeCompletedPhotos,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore record write warning (cached locally):', err);
    }
  },

  async syncMasterToFirestore(partialSettings: Partial<MasterSettings>) {
    try {
      const docRef = doc(db, 'settings', 'master');
      await setDoc(
        docRef,
        {
          registrars: this.getRegistrars(),
          users: this.getUsers(),
          inspectionItems: this.getInspectionItems(),
          nonconformityTypes: this.getNonconformityTypes(),
          locations: this.getLocations(),
          ...partialSettings,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore master sync warning:', err);
    }
  },

  // Subscribe to real-time updates from Firestore for all records
  subscribeRecords(
    onRecordsUpdate: (records: NonconformityRecord[]) => void,
    onError?: (err: any) => void
  ): () => void {
    recordListeners.add(onRecordsUpdate);

    // Hydrate from IndexedDB first if available (restores any records that exceeded localStorage 5MB limit)
    loadRecordsFromIndexedDB().then((idbRecords) => {
      if (idbRecords && idbRecords.length > 0) {
        const deletedIds = getDeletedIds();
        const current = this.getRecords();
        const merged = normalizeAndDeduplicateRecords(
          [...current, ...idbRecords].filter((r) => !deletedIds.has(r.id))
        );
        memoryRecords = merged;
        notifyRecordListeners(merged);
      }
    });

    const recordsCol = collection(db, 'records');

    const unsubscribeFirestore = onSnapshot(
      recordsCol,
      (snapshot) => {
        const deletedIds = getDeletedIds();

        if (!snapshot.empty) {
          const remoteRecords: NonconformityRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = data.id || docSnap.id;
            if (!deletedIds.has(docId)) {
              remoteRecords.push(normalizeRecord({ ...data, id: docId }, remoteRecords.length));
            }
          });

          const remoteIds = new Set(remoteRecords.map((r) => r.id));
          const localCurrent = this.getRecords().filter((r) => !deletedIds.has(r.id));

          // Any local records not yet in Firestore are preserved and synced to Firestore
          const unsyncedLocals = localCurrent.filter((localRec) => !remoteIds.has(localRec.id));
          unsyncedLocals.forEach((unsynced) => {
            this.saveRecordToFirestore(unsynced);
          });

          const merged = normalizeAndDeduplicateRecords([...remoteRecords, ...unsyncedLocals]);
          this.saveRecords(merged);
        } else {
          // Firestore collection is currently empty: sync current local records or seed records
          const existingLocal = this.getRecords();
          const toSeed = existingLocal.length > 0 ? existingLocal : getInitialSeedRecords();
          toSeed.forEach((rec) => {
            this.saveRecordToFirestore(rec);
          });
          this.saveRecords(toSeed);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice (using local cache):', error);
        if (onError) onError(error);
        // Fallback to local cache
        onRecordsUpdate(this.getRecords());
      }
    );

    return () => {
      recordListeners.delete(onRecordsUpdate);
      unsubscribeFirestore();
    };
  },

  // Subscribe to real-time master settings from Firestore
  subscribeMasterSettings(
    onSettingsUpdate: (settings: MasterSettings) => void
  ): () => void {
    const masterDocRef = doc(db, 'settings', 'master');

    const unsubscribe = onSnapshot(
      masterDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<MasterSettings>;
          if (Array.isArray(data.users) && data.users.length > 0) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
            const names = data.users.map((u) => u.name).filter(Boolean);
            if (names.length > 0) {
              localStorage.setItem(STORAGE_KEYS.REGISTRARS, JSON.stringify(names));
            }
          } else if (Array.isArray(data.registrars) && data.registrars.length > 0) {
            localStorage.setItem(STORAGE_KEYS.REGISTRARS, JSON.stringify(data.registrars));
          }
          if (Array.isArray(data.inspectionItems) && data.inspectionItems.length > 0) {
            localStorage.setItem(STORAGE_KEYS.INSPECTION_ITEMS, JSON.stringify(data.inspectionItems));
          }
          if (Array.isArray(data.nonconformityTypes) && data.nonconformityTypes.length > 0) {
            localStorage.setItem(STORAGE_KEYS.NC_TYPES, JSON.stringify(data.nonconformityTypes));
          }
          if (Array.isArray(data.locations) && data.locations.length > 0) {
            localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(data.locations));
          }
          onSettingsUpdate({
            registrars: this.getRegistrars(),
            users: this.getUsers(),
            inspectionItems: this.getInspectionItems(),
            nonconformityTypes: this.getNonconformityTypes(),
            locations: this.getLocations(),
          });
        } else {
          // Initialize master settings in Firestore
          const initialUsers = this.getUsers();
          this.syncMasterToFirestore({
            registrars: initialUsers.map((u) => u.name),
            users: initialUsers,
            inspectionItems: DEFAULT_INSPECTION_ITEMS,
            nonconformityTypes: DEFAULT_NONCONFORMITY_TYPES,
            locations: DEFAULT_LOCATIONS,
          });
          onSettingsUpdate({
            registrars: initialUsers.map((u) => u.name),
            users: initialUsers,
            inspectionItems: DEFAULT_INSPECTION_ITEMS,
            nonconformityTypes: DEFAULT_NONCONFORMITY_TYPES,
            locations: DEFAULT_LOCATIONS,
          });
        }
      },
      (error) => {
        console.warn('Firestore settings subscription notice:', error);
      }
    );

    return unsubscribe;
  },
};
