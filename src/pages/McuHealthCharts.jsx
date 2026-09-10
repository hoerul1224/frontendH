// src/pages/McuHealthCharts.jsx

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import API from '../api';

const HEALTH_DEGREES = [
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
  'P7',
];

const FITNESS_STATUS = [
  {
    key: 'laik',
    label: 'Laik Kerja',
  },
  {
    key: 'laik_dengan_catatan',
    label: 'Laik dengan Catatan',
  },
  {
    key: 'laik_dengan_restriksi',
    label: 'Laik dengan Penyesuaian',
  },
  {
    key: 'tidak_laik',
    label: 'Tidak Laik Kerja',
  },
];

const WORK_STATUS_OPTIONS = [
  'Direksi & Manajemen',
  'PWTT',
  'PWT',
  'TKJP',
  'Tamu',
];

const COLORS = {
  mcu: '#38bdf8',
  review: '#818cf8',
  sudah: '#2dd4bf',
  belum: '#ef4444',
};

function GroupedBarCard({
  title,
  data,
  loading,
  error,
}) {
  return (
    <div className="dcu-chart-card mcu-health-chart-card">
      <h3>{title}</h3>

      {loading ? (
        <p className="empty-state">Memuat...</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 15,
              left: 0,
              bottom: 10,
            }}
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
              angle={data.length > 4 ? -20 : 0}
              textAnchor={
                data.length > 4 ? 'end' : 'middle'
              }
              height={data.length > 4 ? 50 : 30}
            />

            <YAxis
              stroke="#cfe0ff"
              allowDecimals={false}
            />

            <Tooltip
              formatter={(value, name) => [
                `${value} pekerja`,
                name === 'mcu' ? 'MCU' : 'Review',
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
                value === 'mcu' ? 'MCU' : 'Review'
              }
            />

            <Bar
              dataKey="mcu"
              fill={COLORS.mcu}
              radius={[5, 5, 0, 0]}
            />

            <Bar
              dataKey="review"
              fill={COLORS.review}
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function McuHealthCharts() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [workStatusFilter, setWorkStatusFilter] =
    useState('');

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
          '/mcu/admin/health-summary',
          {
            params: {
              year,
              workStatus: workStatusFilter || undefined,
            },
          }
        );

        if (!cancelled) {
          setSummary(response.data);
        }
      } catch (err) {
        console.error(
          'Gagal mengambil summary MCU:',
          err
        );

        if (!cancelled) {
          setError(
            'Data kesehatan MCU belum dapat dimuat.'
          );
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
  }, [year, workStatusFilter]);

  const charts = useMemo(() => {
    const healthDegreeGrouped = HEALTH_DEGREES.map(
      (degree) => ({
        label: degree,
        mcu:
          summary?.healthDegreeMCU?.find(
            (item) => item.label === degree
          )?.count || 0,
        review:
          summary?.healthDegreeFollowUp?.find(
            (item) => item.label === degree
          )?.count || 0,
      })
    );

    const fitnessGrouped = FITNESS_STATUS.map(
      (status) => ({
        label: status.label,
        mcu:
          summary?.fitnessMCU?.find(
            (item) => item.label === status.key
          )?.count || 0,
        review:
          summary?.fitnessFollowUp?.find(
            (item) => item.label === status.key
          )?.count || 0,
      })
    );

    const mcuStatusRaw = summary?.mcuStatus || [
      { label: 'Sudah MCU', count: 0 },
      { label: 'Belum MCU', count: 0 },
    ];

    const mcuStatusTotal = mcuStatusRaw.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const mcuStatusPie = mcuStatusRaw.map((item) => ({
      name: item.label,
      value: item.count,
      percent:
        mcuStatusTotal > 0
          ? Math.round(
              (item.count / mcuStatusTotal) * 100
            )
          : 0,
    }));

    const sudahPercent =
      mcuStatusPie.find((item) => item.name === 'Sudah MCU')
        ?.percent || 0;

    return {
      healthDegreeGrouped,
      fitnessGrouped,
      mcuStatusPie,
      sudahPercent,
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
          onChange={(event) =>
            setYear(Number(event.target.value))
          }
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#0f2d7a',
            color: '#cfe0ff',
            fontSize: 13,
          }}
        >
          {Array.from({ length: 5 }, (_, i) => currentYear - i).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>

        <select
          value={workStatusFilter}
          onChange={(event) =>
            setWorkStatusFilter(event.target.value)
          }
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#0f2d7a',
            color: '#cfe0ff',
            fontSize: 13,
          }}
        >
          <option value="">Semua Status Pekerja</option>
          {WORK_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="dcu-chart-card mcu-health-chart-card">
        <h3>Derajat Kesehatan Pekerja Berdasarkan MCU</h3>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : error ? (
          <p className="empty-state">{error}</p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ flex: '1 1 220px', minWidth: 220 }}>
              <div
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 26,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {charts.sudahPercent}% Sudah MCU
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={charts.mcuStatusPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    <Cell fill={COLORS.sudah} />
                    <Cell fill={COLORS.belum} />
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} pekerja (${props.payload.percent}%)`,
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

            <div style={{ flex: '2 1 320px', minWidth: 280 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={charts.healthDegreeGrouped}
                  margin={{ top: 10, right: 15, left: 0, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#cfe0ff"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="#cfe0ff" allowDecimals={false} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} pekerja`,
                      name === 'mcu' ? 'MCU' : 'Review',
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
                      value === 'mcu' ? 'MCU' : 'Review'
                    }
                  />
                  <Bar dataKey="mcu" fill={COLORS.mcu} radius={[5, 5, 0, 0]} />
                  <Bar dataKey="review" fill={COLORS.review} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-charts-row-2">
        <GroupedBarCard
          title="Kelaikan Kerja Berdasarkan MCU"
          data={charts.fitnessGrouped}
          loading={loading}
          error={error}
        />
      </div>
    </section>
  );
}