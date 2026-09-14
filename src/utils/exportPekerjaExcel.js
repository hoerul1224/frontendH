// src/utils/exportPekerjaExcel.js
//
// Export "Data All Pekerja" — 1 baris per pekerja, dengan grup kolom
// berulang (Tanggal | DIAGNOSIS | DKP | Kelaikan Kerja) untuk setiap
// record MCU pekerja itu, diurutkan dari yang terlama ke terbaru.
//
// Meniru gaya visual sheet "Data All Pekerja" di file Excel master
// (Arial bold, background biru muda, border tipis, header center+wrap),
// TAPI header grup pakai "Pemeriksaan ke-N" (bukan nama bulan tetap),
// karena tanggal pemeriksaan aktual berbeda-beda per pekerja.
//
// PERLU: npm install exceljs

import ExcelJS from 'exceljs/dist/exceljs.min.js';
import API from '../api';

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFDCE6F1' }, // biru muda, mendekati warna template
};

const HEADER_FONT = { name: 'Arial', bold: true, size: 11 };
const DATA_FONT = { name: 'Arial', size: 11 };

const THIN_BORDER = {
  top: { style: 'thin' },
  bottom: { style: 'thin' },
  left: { style: 'thin' },
  right: { style: 'thin' },
};

const CENTER_WRAP = {
  horizontal: 'center',
  vertical: 'center',
  wrapText: true,
};

const BASE_COLUMNS = [
  { header: 'No', width: 5, key: 'no' },
  { header: 'Nomor Pekerja', width: 17, key: 'perwiraId' },
  { header: 'Nama Pekerja', width: 30, key: 'fullName' },
  { header: 'Lokasi Kerja', width: 14, key: 'workLocation' },
  { header: 'Departemen', width: 16, key: 'department' },
  { header: 'Status Pekerjaan', width: 18, key: 'employmentStatus' },
  { header: 'Area Kerja', width: 14, key: 'workClassification' },
  { header: 'Jenis Kelamin', width: 14, key: 'gender' },
  { header: 'Tanggal Lahir', width: 14, key: 'dateOfBirth' },
  { header: 'Usia', width: 16, key: 'age' },
  { header: 'Paket MCU', width: 14, key: 'paketMcu' },
  { header: 'Ket MCU', width: 10, key: 'ketMcu' },
  { header: 'Hasil MCU', width: 11, key: 'hasilMcu' },
  { header: 'Reviewed', width: 11, key: 'reviewed' },
  { header: 'Kelaikan kerja', width: 22, key: 'kelaikanKerja' },
  { header: 'Tindak Lanjut', width: 13, key: 'tindakLanjut' },
  { header: 'DKP POST FU', width: 13, key: 'dkpPostFu' },
];

const FITNESS_LABELS = {
  laik: 'Laik kerja',
  laik_dengan_catatan: 'Laik kerja dengan catatan',
  laik_dengan_restriksi: 'Laik kerja dengan penyesuaian',
  tidak_laik: 'Tidak laik kerja',
};

function fitnessLabel(status) {
  return FITNESS_LABELS[status] || status || '-';
}

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return '-';
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return '-';

  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (now.getDate() < dob.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `${years} Tahun,${months} Bulan`;
}

function combineDiagnosis(record) {
  return [record.diagnosis1, record.diagnosis2, record.diagnosis3]
    .filter(Boolean)
    .join(', ') || '-';
}

/**
 * Ambil semua data yang dibutuhkan (semua pekerja + semua record MCU),
 * lalu gabungkan jadi 1 baris per pekerja dengan riwayat record
 * MCU-nya terurut dari yang terlama ke terbaru.
 */
async function buildPekerjaRows() {
  const [usersRes, mcuRes] = await Promise.all([
    API.get('/auth/users'),
    API.get('/mcu/admin'),
  ]);

  const pekerjaUsers = usersRes.data.filter(
    (user) => user.role === 'pekerja'
  );

  const recordsByUserId = new Map();
  mcuRes.data.forEach((record) => {
    const userId = record.user?._id || record.user;
    if (!userId) return;
    const key = String(userId);
    if (!recordsByUserId.has(key)) {
      recordsByUserId.set(key, []);
    }
    recordsByUserId.get(key).push(record);
  });

  let maxHistoryCount = 0;

  const rows = pekerjaUsers.map((user, index) => {
    const history = (recordsByUserId.get(String(user._id)) || [])
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    maxHistoryCount = Math.max(maxHistoryCount, history.length);

    const latest = history.length > 0 ? history[history.length - 1] : null;
    const latestVerified = history
      .slice()
      .reverse()
      .find((record) => record.followUpStatus === 'terverifikasi');

    return {
      no: index + 1,
      perwiraId: user.perwiraId || '-',
      fullName: user.fullName || '-',
      workLocation: user.workLocation || '-',
      department: user.department || '-',
      employmentStatus: user.employmentStatus || '-',
      workClassification: user.workClassification || '-',
      gender: user.gender || '-',
      dateOfBirth: formatDate(user.dateOfBirth),
      age: calculateAge(user.dateOfBirth),
      paketMcu: user.employmentStatus || '-',
      ketMcu: history.length > 0 ? 'Sudah' : 'Belum',
      hasilMcu: latest?.healthDegree || '-',
      // ASUMSI: "Reviewed" disamakan dengan Hasil MCU (healthDegree
      // record terbaru) — sesuaikan kalau ternyata sumbernya beda.
      reviewed: latest?.healthDegree || '-',
      kelaikanKerja: latest ? fitnessLabel(latest.fitnessStatus) : '-',
      tindakLanjut: latest?.followUpDone ? 'SUDAH' : 'BELUM',
      dkpPostFu: latestVerified?.followUpHealthDegree || '-',
      history,
    };
  });

  return { rows, maxHistoryCount };
}

function styleHeaderCell(cell) {
  cell.font = HEADER_FONT;
  cell.fill = HEADER_FILL;
  cell.border = THIN_BORDER;
  cell.alignment = CENTER_WRAP;
}

export async function exportDataAllPekerjaExcel() {
  const { rows, maxHistoryCount } = await buildPekerjaRows();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data All Pekerja');

  const totalColumns = BASE_COLUMNS.length + maxHistoryCount * 4;

  // Set lebar kolom dasar
  BASE_COLUMNS.forEach((col, index) => {
    sheet.getColumn(index + 1).width = col.width;
  });

  // Lebar kolom grup riwayat (Tanggal, Diagnosis, DKP, Kelaikan Kerja)
  for (let i = 0; i < maxHistoryCount; i += 1) {
    const startCol = BASE_COLUMNS.length + i * 4 + 1;
    sheet.getColumn(startCol).width = 12; // Tanggal
    sheet.getColumn(startCol + 1).width = 30; // Diagnosis
    sheet.getColumn(startCol + 2).width = 10; // DKP
    sheet.getColumn(startCol + 3).width = 22; // Kelaikan Kerja
  }

  // Baris 1: kosong (spacer, meniru template)
  sheet.getRow(1).height = 6;

  // Baris 2: label grup "Pemeriksaan ke-N" (merge 4 kolom per grup)
  const groupHeaderRow = sheet.getRow(2);
  for (let i = 0; i < maxHistoryCount; i += 1) {
    const startCol = BASE_COLUMNS.length + i * 4 + 1;
    const endCol = startCol + 3;
    sheet.mergeCells(2, startCol, 2, endCol);
    const cell = groupHeaderRow.getCell(startCol);
    cell.value = `Pemeriksaan ke-${i + 1}`;
    styleHeaderCell(cell);
  }
  groupHeaderRow.height = 22;

  // Baris 3: header kolom
  const headerRow = sheet.getRow(3);
  BASE_COLUMNS.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    styleHeaderCell(cell);
  });
  for (let i = 0; i < maxHistoryCount; i += 1) {
    const startCol = BASE_COLUMNS.length + i * 4 + 1;
    ['Tanggal', 'DIAGNOSIS', 'DKP', 'Kelaikan Kerja'].forEach(
      (label, offset) => {
        const cell = headerRow.getCell(startCol + offset);
        cell.value = label;
        styleHeaderCell(cell);
      }
    );
  }
  headerRow.height = 28;

  sheet.mergeCells(1, 1, 1, totalColumns);

  // Baris data
  rows.forEach((row) => {
    const excelRow = sheet.addRow([]);

    BASE_COLUMNS.forEach((col, index) => {
      const cell = excelRow.getCell(index + 1);
      cell.value = row[col.key];
      cell.font = DATA_FONT;
    });

    row.history.forEach((record, historyIndex) => {
      const startCol = BASE_COLUMNS.length + historyIndex * 4 + 1;
      const values = [
        formatDate(record.date),
        combineDiagnosis(record),
        record.healthDegree || '-',
        fitnessLabel(record.fitnessStatus),
      ];
      values.forEach((value, offset) => {
        const cell = excelRow.getCell(startCol + offset);
        cell.value = value;
        cell.font = DATA_FONT;
      });
    });
  });

  sheet.views = [{ state: 'frozen', ySplit: 3 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Data_All_Pekerja_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}