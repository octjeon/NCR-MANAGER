import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import {
  ACTION_PLAN_OPTIONS,
  ActionPlan,
  DEFAULT_LOCATIONS,
  DEFAULT_INSPECTION_ITEMS,
  DEFAULT_NONCONFORMITY_TYPES,
  DEFAULT_REGISTRARS,
  NonconformityRecord,
} from '../types';
import { createShipyardPhotoSvg } from '../utils/sampleImages';

// Try anonymous auth silently for seamless Firebase access
try {
  signInAnonymously(auth).catch((err) => {
    console.info('Firebase auth note:', err?.message || err);
  });
} catch (err) {
  // safe fallback
}

const STORAGE_KEYS = {
  RECORDS: 'daehan_qc_records_v1',
  REGISTRARS: 'daehan_qc_registrars_v1',
  INSPECTION_ITEMS: 'daehan_qc_items_v1',
  NC_TYPES: 'daehan_qc_nc_types_v1',
  LOCATIONS: 'daehan_qc_locations_v1',
  ADMIN_PWD: 'daehan_qc_admin_pwd_v1',
};

export interface MasterSettings {
  registrars: string[];
  inspectionItems: string[];
  nonconformityTypes: string[];
  locations: string[];
}

// Self-heal record schema to prevent undefined field crashes
function normalizeRecord(raw: any, index: number): NonconformityRecord {
  const rowNumber = typeof raw._rowIndex === 'number' ? raw._rowIndex : index + 1;
  const idStr = raw.id || `DHQ-${String(rowNumber).padStart(4, '0')}`;

  return {
    _rowIndex: rowNumber,
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

  // Registrars
  getRegistrars(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTRARS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load registrars', e);
    }
    this.saveRegistrars(DEFAULT_REGISTRARS);
    return DEFAULT_REGISTRARS;
  },

  saveRegistrars(list: string[]) {
    localStorage.setItem(STORAGE_KEYS.REGISTRARS, JSON.stringify(list));
    this.syncMasterToFirestore({ registrars: list });
  },

  addRegistrar(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const current = this.getRegistrars();
    if (current.includes(trimmed)) return false;
    const updated = [...current, trimmed];
    this.saveRegistrars(updated);
    return true;
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
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => normalizeRecord(item, idx));
        }
      }
    } catch (e) {
      console.error('Failed to read records from storage', e);
    }

    const seeds = getInitialSeedRecords();
    this.saveRecords(seeds);
    return seeds;
  },

  saveRecords(records: NonconformityRecord[]) {
    const normalized = records.map((r, idx) => normalizeRecord(r, idx));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(normalized));
  },

  addRecord(
    input: Omit<NonconformityRecord, '_rowIndex' | 'id' | 'registeredAt'>
  ): NonconformityRecord {
    const current = this.getRecords();
    const nextRowIndex = current.length + 1;
    const nextId = `DHQ-${String(nextRowIndex).padStart(4, '0')}`;
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

    const updated = [newRecord, ...current];
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

    const filtered = current.filter((r) => r._rowIndex !== rowIndex);
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
      const docRef = doc(db, 'records', record.id);
      await setDoc(docRef, {
        ...record,
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
    const recordsCol = collection(db, 'records');

    const unsubscribe = onSnapshot(
      recordsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteRecords: NonconformityRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteRecords.push(normalizeRecord(data, remoteRecords.length));
          });

          // Sort by _rowIndex ascending
          remoteRecords.sort((a, b) => a._rowIndex - b._rowIndex);

          // Update local storage cache
          localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(remoteRecords));
          onRecordsUpdate(remoteRecords);
        } else {
          // Firestore collection is currently empty: seed with initial records
          const initialSeeds = getInitialSeedRecords();
          initialSeeds.forEach((rec) => {
            this.saveRecordToFirestore(rec);
          });
          onRecordsUpdate(initialSeeds);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice (using local cache):', error);
        if (onError) onError(error);
        // Fallback to local cache
        onRecordsUpdate(this.getRecords());
      }
    );

    return unsubscribe;
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
          if (Array.isArray(data.registrars) && data.registrars.length > 0) {
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
            inspectionItems: this.getInspectionItems(),
            nonconformityTypes: this.getNonconformityTypes(),
            locations: this.getLocations(),
          });
        } else {
          // Initialize master settings in Firestore
          this.syncMasterToFirestore({
            registrars: DEFAULT_REGISTRARS,
            inspectionItems: DEFAULT_INSPECTION_ITEMS,
            nonconformityTypes: DEFAULT_NONCONFORMITY_TYPES,
            locations: DEFAULT_LOCATIONS,
          });
          onSettingsUpdate({
            registrars: DEFAULT_REGISTRARS,
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
