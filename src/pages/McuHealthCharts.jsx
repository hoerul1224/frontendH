// src/pages/McuHealthCharts.jsx

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
    key: 'tidak_laik',
    label: 'Tidak Laik Kerja',
  },
];

const COLORS = {
  blue: '#38bdf8',
  green: '#2dd4bf',
  orange: '#f59e0b',
  purple: '#818cf8',
  red: '#ef4444',
};

function ChartCard({
  title,
  data,
  color,
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
        <ResponsiveContainer width="100%" height={250}>
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
              formatter={(value) => [
                `${value} pekerja`,
                'Jumlah',
              ]}
              contentStyle={{
                background: '#102d72',
                border:
                  '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: '#fff',
              }}
            />

            <Bar
              dataKey="jumlah"
              fill={color}
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function McuHealthCharts({
  month,
  year,
}) {
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
              month,
              year,
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
  }, [month, year]);

  const charts = useMemo(() => {
    const healthMcu = HEALTH_DEGREES.map(
      (degree) => ({
        label: degree,
        jumlah:
          summary?.healthDegreeMCU?.find(
            (item) => item.label === degree
          )?.count || 0,
      })
    );

    const fitnessMcu = FITNESS_STATUS.map(
      (status) => ({
        label: status.label,
        jumlah:
          summary?.fitnessMCU?.find(
            (item) => item.label === status.key
          )?.count || 0,
      })
    );

    const followUp = (
      summary?.followUpStatus || []
    ).map((item) => ({
      label: item.label,
      jumlah: item.count || 0,
    }));

    const healthFollowUp = HEALTH_DEGREES.map(
      (degree) => ({
        label: degree,
        jumlah:
          summary?.healthDegreeFollowUp?.find(
            (item) => item.label === degree
          )?.count || 0,
      })
    );

    const fitnessFollowUp = FITNESS_STATUS.map(
      (status) => ({
        label: status.label,
        jumlah:
          summary?.fitnessFollowUp?.find(
            (item) => item.label === status.key
          )?.count || 0,
      })
    );

    return {
      healthMcu,
      fitnessMcu,
      followUp,
      healthFollowUp,
      fitnessFollowUp,
    };
  }, [summary]);

  return (
    <section className="mcu-health-section">
      <h4 className="dashboard-section-title">
        DERAJAT KESEHATAN DAN KELAIKAN KERJA MCU
      </h4>

      <div className="dashboard-charts-row-2">
        <ChartCard
          title="Derajat Kesehatan Berdasarkan MCU"
          data={charts.healthMcu}
          color={COLORS.blue}
          loading={loading}
          error={error}
        />

        <ChartCard
          title="Kelaikan Kerja Berdasarkan MCU"
          data={charts.fitnessMcu}
          color={COLORS.green}
          loading={loading}
          error={error}
        />
      </div>

      <div className="dashboard-charts-row-2">
        <ChartCard
          title="Status Verifikasi Tindak Lanjut MCU"
          data={charts.followUp}
          color={COLORS.orange}
          loading={loading}
          error={error}
        />

        <ChartCard
          title="Derajat Kesehatan Setelah TL MCU"
          data={charts.healthFollowUp}
          color={COLORS.purple}
          loading={loading}
          error={error}
        />
      </div>

      <div className="dashboard-charts-row-2">
        <ChartCard
          title="Kelaikan Kerja Setelah TL MCU"
          data={charts.fitnessFollowUp}
          color={COLORS.red}
          loading={loading}
          error={error}
        />
      </div>
    </section>
  );
}