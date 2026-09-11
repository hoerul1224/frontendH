// src/pages/McuCurrentStatusCharts.jsx

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import API from '../api';
import WorkStatusMultiSelect from '../components/WorkStatusMultiSelect';

const HEALTH_DEGREES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];

const HEALTH_DEGREE_FILTER_OPTIONS = [
  { value: '', label: 'Semua Derajat' },
  ...HEALTH_DEGREES.map((degree) => ({ value: degree, label: degree })),
];

const FITNESS_STATUS = [
  { key: 'laik', label: 'Laik Kerja' },
  { key: 'laik_dengan_catatan', label: 'Laik Kerja dengan Catatan' },
  { key: 'laik_dengan_restriksi', label: 'Laik Kerja dengan Penyesuaian' },
  { key: 'tidak_laik', label: 'Tidak Laik Kerja' },
];

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const WORK_STATUS_OPTIONS = [
  'Direksi & Manajemen',
  'PWTT',
  'PWT',
  'TKJP',
  'Tamu',
];

const COLORS = {
  mcu: '#00529C',    // Biru - Pasti Prima
  review: '#8CC63F', // Hijau - Green Energy Station
  sudah: '#8CC63F',  // Hijau
  belum: '#ED1C24',  // Merah - Pasti Pas
};

const MCU_PERCENT_LABEL_STYLE = {
  fill: '#ffffff',
  fontSize: 10,
  fontWeight: 600,
};

const REVIEW_PERCENT_LABEL_STYLE = {
  fill: '#ffffff',
  fontSize: 10,
  fontWeight: 600,
};

// Grouped bar reusable untuk MCU vs Review Dokter Perusahaan
function GroupedBarCard({ title, data, loading, error }) {
  return (
    <div className="dcu-chart-card mcu-health-chart-card">
      <h3>{title}</h3>

      {loading ? (
        <p className="empty-state">Memuat...</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 24, right: 15, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="label"
              stroke="#cfe0ff"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={data.length > 4 ? -15 : 0}
              textAnchor={data.length > 4 ? 'end' : 'middle'}
              height={data.length > 4 ? 60 : 30}
            />
            <YAxis stroke="#cfe0ff" allowDecimals={false} />
            <Tooltip
              formatter={(value, name, props) => [
                name === 'mcu'
                  ? `${value} pekerja (${props.payload.mcuPercent}%)`
                  : `${value} pekerja (${props.payload.reviewPercent}%)`,
                name === 'mcu' ? 'MCU' : 'Review Dokter Perusahaan',
              ]}
              contentStyle={{
                background: '#102d72',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: '#fff',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) =>
                value === 'mcu' ? 'MCU' : 'Review Dokter Perusahaan'
              }
            />
            <Bar dataKey="mcu" fill={COLORS.mcu} radius={[5, 5, 0, 0]}>
              <LabelList
                dataKey="mcuPercent"
                position="top"
                formatter={(v) => `${v}%`}
                style={MCU_PERCENT_LABEL_STYLE}
              />
            </Bar>
            <Bar dataKey="review" fill={COLORS.review} radius={[5, 5, 0, 0]}>
              <LabelList
                dataKey="reviewPercent"
                position="top"
                formatter={(v) => `${v}%`}
                style={REVIEW_PERCENT_LABEL_STYLE}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function McuCurrentStatusCharts() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [workStatusFilter, setWorkStatusFilter] = useState([]);
  const [healthDegreeFilter, setHealthDegreeFilter] = useState('');

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await API.get(
          '/mcu/admin/current-status-summary',
          {
            params: {
              year,
              workStatus:
                workStatusFilter.length > 0
                  ? workStatusFilter.join(',')
                  : undefined,
              healthDegree: healthDegreeFilter || undefined,
            },
          }
        );

        if (!cancelled) {
          setSummary(response.data);
        }
      } catch (err) {
        console.error('Gagal mengambil status terkini MCU:', err);

        if (!cancelled) {
          setError('Data belum dapat dimuat.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [year, workStatusFilter, healthDegreeFilter]);

  const charts = useMemo(() => {
    // --- Derajat Kesehatan Aktual: MCU vs Review Dokter Perusahaan ---
    const healthDegreeGroupedRaw = HEALTH_DEGREES.map((degree) => ({
      label: degree,
      mcu:
        summary?.healthDegreeCurrentMCU?.find(
          (item) => item.label === degree
        )?.count || 0,
      review:
        summary?.healthDegreeCurrentFollowUp?.find(
          (item) => item.label === degree
        )?.count || 0,
    }));
    const healthDegreeMcuTotal = healthDegreeGroupedRaw.reduce(
      (sum, item) => sum + item.mcu,
      0
    );
    const healthDegreeReviewTotal = healthDegreeGroupedRaw.reduce(
      (sum, item) => sum + item.review,
      0
    );
    const healthDegreeGrouped = healthDegreeGroupedRaw.map((item) => ({
      ...item,
      mcuPercent:
        healthDegreeMcuTotal > 0
          ? Math.round((item.mcu / healthDegreeMcuTotal) * 100)
          : 0,
      reviewPercent:
        healthDegreeReviewTotal > 0
          ? Math.round((item.review / healthDegreeReviewTotal) * 100)
          : 0,
    }));

    // --- Kelaikan Kerja Aktual: MCU vs Review Dokter Perusahaan ---
    const fitnessGroupedRaw = FITNESS_STATUS.map((status) => ({
      label: status.label,
      mcu:
        summary?.fitnessCurrentMCU?.find(
          (item) => item.label === status.key
        )?.count || 0,
      review:
        summary?.fitnessCurrentFollowUp?.find(
          (item) => item.label === status.key
        )?.count || 0,
    }));
    const fitnessMcuTotal = fitnessGroupedRaw.reduce(
      (sum, item) => sum + item.mcu,
      0
    );
    const fitnessReviewTotal = fitnessGroupedRaw.reduce(
      (sum, item) => sum + item.review,
      0
    );
    const fitnessGrouped = fitnessGroupedRaw.map((item) => ({
      ...item,
      mcuPercent:
        fitnessMcuTotal > 0
          ? Math.round((item.mcu / fitnessMcuTotal) * 100)
          : 0,
      reviewPercent:
        fitnessReviewTotal > 0
          ? Math.round((item.review / fitnessReviewTotal) * 100)
          : 0,
    }));

    // --- Donat Sudah/Belum TL MCU ---
    const tlStatusRaw = summary?.tlStatus || [
      { label: 'Sudah TL MCU', count: 0 },
      { label: 'Belum TL MCU', count: 0 },
    ];

    const tlTotal = tlStatusRaw.reduce((sum, item) => sum + item.count, 0);

    const tlStatusPie = tlStatusRaw.map((item) => ({
      name: item.label,
      value: item.count,
      percent: tlTotal > 0 ? Math.round((item.count / tlTotal) * 100) : 0,
    }));

    const sudahTlPercent =
      tlStatusPie.find((item) => item.name === 'Sudah TL MCU')?.percent || 0;

    const monthlyTrend = (summary?.monthlyVerified || []).map(
      (item, index) => ({
        label: MONTH_LABELS[index],
        count: item.count,
      })
    );

    return {
      healthDegreeGrouped,
      fitnessGrouped,
      tlStatusPie,
      sudahTlPercent,
      monthlyTrend,
    };
  }, [summary]);

  return (
    <section className="mcu-health-section">
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <select
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#0f2d7a',
            color: '#cfe0ff',
            fontSize: 13,
          }}
        >
          {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <WorkStatusMultiSelect
          options={WORK_STATUS_OPTIONS}
          selected={workStatusFilter}
          onChange={setWorkStatusFilter}
        />

        <select
          value={healthDegreeFilter}
          onChange={(event) => setHealthDegreeFilter(event.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#0f2d7a',
            color: '#cfe0ff',
            fontSize: 13,
          }}
        >
          {HEALTH_DEGREE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Baris 1: Donat % TL MCU (kecil) + Bar Derajat Kesehatan (MCU vs Review), sejajar dalam 1 card */}
      <div
        className="dcu-chart-card mcu-health-chart-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 16,
        }}
      >
        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : error ? (
          <p className="empty-state">{error}</p>
        ) : (
          <>
            {/* Kiri: Donat % TL MCU */}
            <div style={{ flex: '1 1 240px', minWidth: 220 }}>
              <div
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {charts.sudahTlPercent}% Sudah TL MCU
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={charts.tlStatusPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    label={({ payload }) => `${payload.percent}%`}
                    labelLine={false}
                  >
                    <Cell fill={COLORS.sudah} />
                    <Cell fill={COLORS.belum} />
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} record (${props.payload.percent}%)`,
                      '',
                    ]}
                    contentStyle={{
                      background: '#102d72',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Kanan: Bar Derajat Kesehatan Pekerja Aktual (MCU vs Review Dokter Perusahaan) */}
            <div style={{ flex: '2 1 420px', minWidth: 320 }}>
              <h3>Derajat Kesehatan Pekerja Aktual</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={charts.healthDegreeGrouped}
                  margin={{ top: 24, right: 15, left: 0, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#cfe0ff"
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis stroke="#cfe0ff" allowDecimals={false} />
                  <Tooltip
                    formatter={(value, name, props) => [
                      name === 'mcu'
                        ? `${value} pekerja (${props.payload.mcuPercent}%)`
                        : `${value} pekerja (${props.payload.reviewPercent}%)`,
                      name === 'mcu' ? 'MCU' : 'Review Dokter Perusahaan',
                    ]}
                    contentStyle={{
                      background: '#102d72',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) =>
                      value === 'mcu' ? 'MCU' : 'Review Dokter Perusahaan'
                    }
                  />
                  <Bar dataKey="mcu" fill={COLORS.mcu} radius={[5, 5, 0, 0]}>
                    <LabelList
                      dataKey="mcuPercent"
                      position="top"
                      formatter={(v) => `${v}%`}
                      style={MCU_PERCENT_LABEL_STYLE}
                    />
                  </Bar>
                  <Bar dataKey="review" fill={COLORS.review} radius={[5, 5, 0, 0]}>
                    <LabelList
                      dataKey="reviewPercent"
                      position="top"
                      formatter={(v) => `${v}%`}
                      style={REVIEW_PERCENT_LABEL_STYLE}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* 3. Kelaikan Kerja Pekerja Aktual (MCU vs Review Dokter Perusahaan) — full width di bawah */}
      <GroupedBarCard
        title="Kelaikan Kerja Pekerja Aktual"
        data={charts.fitnessGrouped}
        loading={loading}
        error={error}
      />
    </section>
  );
}