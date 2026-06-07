import { positionRepository } from "../repositories/position.repository";
import {
  createPositionSchema,
  updatePositionSchema,
  type PositionDTO,
} from "../types/position";

// Bentuk baris dari database -> DTO yang dikirim ke frontend
type PositionRow = NonNullable<
  Awaited<ReturnType<typeof positionRepository.findById>>
>;

function toDTO(row: PositionRow): PositionDTO {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const positionService = {
  async list(): Promise<PositionDTO[]> {
    const rows = await positionRepository.findAll();
    return rows.map(toDTO);
  },

  async getById(id: string): Promise<PositionDTO> {
    const row = await positionRepository.findById(id);
    if (!row) throw new Error("Jabatan tidak ditemukan");
    return toDTO(row);
  },

  async create(input: unknown): Promise<PositionDTO> {
    const data = createPositionSchema.parse(input);

    const existing = await positionRepository.findByName(data.name);
    if (existing) throw new Error("Nama jabatan sudah digunakan");

    const created = await positionRepository.create(data);
    if (!created) throw new Error("Gagal membuat jabatan");
    return toDTO(created);
  },

  async update(id: string, input: unknown): Promise<PositionDTO> {
    const data = updatePositionSchema.parse(input);

    const current = await positionRepository.findById(id);
    if (!current) throw new Error("Jabatan tidak ditemukan");

    // jika nama diubah, pastikan tidak bentrok dengan jabatan lain
    if (data.name && data.name !== current.name) {
      const duplicate = await positionRepository.findByName(data.name);
      if (duplicate) throw new Error("Nama jabatan sudah digunakan");
    }

    // tidak ada field yang diubah -> kembalikan data saat ini
    if (Object.keys(data).length === 0) return toDTO(current);

    const updated = await positionRepository.update(id, data);
    if (!updated) throw new Error("Gagal memperbarui jabatan");
    return toDTO(updated);
  },

  async delete(id: string): Promise<boolean> {
    return positionRepository.delete(id);
  },
};
