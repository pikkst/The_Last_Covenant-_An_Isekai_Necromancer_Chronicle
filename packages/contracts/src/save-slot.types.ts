export type SaveSlotStatus = 'ACTIVE' | 'ARCHIVED';

export interface SaveSlot {
  id: string;
  accountId: string;
  name: string;
  status: SaveSlotStatus;
  contentVersion: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  currentRevision: number;
}

export interface SaveRevision {
  id: string;
  saveSlotId: string;
  revision: number;
  data: string;
  checksum: string;
  contentVersion: string;
  createdAt: string;
}

export interface SaveCheckpoint {
  id: string;
  saveSlotId: string;
  revisionId: string;
  label: string | null;
  createdAt: string;
}

export interface CreateSaveSlotRequest {
  name: string;
  initialData?: string;
}

export interface UpdateSaveSlotRequest {
  name?: string;
  status?: SaveSlotStatus;
}

export interface SaveSlotListParams {
  cursor?: string;
  limit?: number;
  status?: SaveSlotStatus;
}

export interface SaveSlotListResponse {
  items: SaveSlot[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface WriteSaveRequest {
  data: string;
  expectedRevision: number;
}

export interface CreateCheckpointRequest {
  label?: string;
}

export interface SaveExport {
  slot: SaveSlot;
  revisions: SaveRevision[];
  checkpoints: SaveCheckpoint[];
}
