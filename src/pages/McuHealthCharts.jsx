// src/pages/McuHealthCharts.jsx

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
    label: 'Laik Kerja dengan Catatan',
  },
  {
    key: 'laik_dengan_restriksi',
    label: 'Laik Kerja dengan Penyesuaian',
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
  mcu: '#29A9E8',
  review: '#8CC63F',
  sudah: '#8CC63F',
  belum: '#ED1C24',
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

function normalizeLabel(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}

function hasSummaryData(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return Object.keys(value).length > 0;
  }

  return false;
}

function firstNonEmptySummary(...values) {
  return (
    values.find((value) =>
      hasSummaryData(value)
    ) || []
  );
}

function getSummaryItems(items) {
  if (Array.isArray(items)) {
    return items;
  }

  if (
    items &&
    typeof items === 'object'
  ) {
    return Object.entries(items).map(
      ([label, value]) => {
        if (
          value &&
          typeof value === 'object'
        ) {
          return {
            label,
            ...value,
          };
        }

        return {
          label,
          count: value,
        };
      }
    );
  }

  return [];
}

function getSummaryLabel(item) {
  if (!item) {
    return '';
  }

  if (
    item._id &&
    typeof item._id === 'object'
  ) {
    return (
      item._id.label ??
      item._id.degree ??
      item._id.healthDegree ??
      item._id.name ??
      item._id.value ??
      Object.values(item._id).find(
        (value) =>
          typeof value === 'string'
      ) ??
      ''
    );
  }

  return (
    item.label ??
    item._id ??
    item.degree ??
    item.healthDegree ??
    item.name ??
    ''
  );
}

function getSummaryCount(item) {
  if (!item) {
    return 0;
  }

  let rawCount =
    item.count ??
    item.total ??
    item.value ??
    item.jumlah ??
    item.totalCount ??
    0;

  if (
    rawCount &&
    typeof rawCount === 'object'
  ) {
    rawCount =
      rawCount.count ??
      rawCount.total ??
      rawCount.value ??
      rawCount.jumlah ??
      0;
  }

  const count = Number(rawCount);

  return Number.isFinite(count)
    ? count
    : 0;
}

function getSummaryCountByLabel(
  items,
  targetLabel
) {
  const normalizedItems =
    getSummaryItems(items);

  const normalizedTarget =
    normalizeLabel(targetLabel);

  const matchingItem =
    normalizedItems.find((item) => {
      return (
        normalizeLabel(
          getSummaryLabel(item)
        ) === normalizedTarget
      );
    });

  return getSummaryCount(matchingItem);
}

function GroupedBarCard({
  title,
  data,
  loading,
  error,
}) {
  return (
    <div className="dcu-chart-card mcu-health-chart-card">
      <h3>{title}</h3>

      {!loading && !error && (
        <p
          style={{
            color: '#8ecbff',
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          {data
            .map(
              (item) =>
                `${item.label}: mcu=${item.mcu} (${item.mcuPercent}%), review=${item.review} (${item.reviewPercent}%)`
            )
            .join(' | ')}
        </p>
      )}

      {loading ? (
        <p className="empty-state">
          Memuat...
        </p>
      ) : error ? (
        <p className="empty-state">
          {error}
        </p>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={340}
        >
          <BarChart
            data={data}
            margin={{
              top: 24,
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
              angle={
                data.length > 4
                  ? -20
                  : 0
              }
              textAnchor={
                data.length > 4
                  ? 'end'
                  : 'middle'
              }
              height={
                data.length > 4
                  ? 50
                  : 30
              }
            />

            <YAxis
              stroke="#cfe0ff"
              allowDecimals={false}
            />

            <Tooltip
              formatter={(
                value,
                name,
                props
              ) => [
                name === 'mcu'
                  ? `${value} pekerja (${props.payload.mcuPercent}%)`
                  : `${value} pekerja (${props.payload.reviewPercent}%)`,
                name === 'mcu'
                  ? 'MCU'
                  : 'Review Dokter Perusahaan',
              ]}
              contentStyle={{
                background: '#102d72',
                border:
                  '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: '#fff',
              }}
            />

            <Legend
              wrapperStyle={{
                fontSize: 12,
              }}
              formatter={(value) =>
                value === 'mcu'
                  ? 'MCU'
                  : 'Review Dokter Perusahaan'
              }
            />

            <Bar
              dataKey="mcu"
              name="mcu"
              fill={COLORS.mcu}
              radius={[5, 5, 0, 0]}
              minPointSize={6}
            >
              <LabelList
                dataKey="mcuPercent"
                position="top"
                formatter={(value) =>
                  `${value}%`
                }
                style={
                  MCU_PERCENT_LABEL_STYLE
                }
              />
            </Bar>

            <Bar
              dataKey="review"
              name="review"
              fill={COLORS.review}
              radius={[5, 5, 0, 0]}
              minPointSize={6}
            >
              <LabelList
                dataKey="reviewPercent"
                position="top"
                formatter={(value) =>
                  `${value}%`
                }
                style={
                  REVIEW_PERCENT_LABEL_STYLE
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function McuHealthCharts() {
  const currentYear =
    new Date().getFullYear();

  const [year, setYear] =
    useState(currentYear);

  const [
    workStatusFilter,
    setWorkStatusFilter,
  ] = useState([]);

  const [summary, setSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

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
              workStatus:
                workStatusFilter.length > 0
                  ? workStatusFilter.join(',')
                  : undefined,
            },
          }
        );

        console.log(
          '[MCU health-summary response]',
          response.data
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
    const healthDegreeMcuData =
      firstNonEmptySummary(
        summary?.healthDegreeMCU,
        summary?.healthDegreeCurrentMCU,
        summary?.healthDegreeMcu,
        summary?.healthDegree?.mcu
      );

    const healthDegreeReviewData =
      firstNonEmptySummary(
        summary?.healthDegreeFollowUp,
        summary?.healthDegreeCurrentFollowUp,
        summary?.healthDegreeReview,
        summary?.healthDegreeDoctorReview,
        summary?.healthDegree?.followUp,
        summary?.healthDegree?.review
      );

    const healthDegreeGroupedRaw =
      HEALTH_DEGREES.map((degree) => ({
        label: degree,

        mcu: getSummaryCountByLabel(
          healthDegreeMcuData,
          degree
        ),

        review: getSummaryCountByLabel(
          healthDegreeReviewData,
          degree
        ),
      }));

    const healthDegreeMcuTotal =
      healthDegreeGroupedRaw.reduce(
        (sum, item) =>
          sum + item.mcu,
        0
      );

    const healthDegreeReviewTotal =
      healthDegreeGroupedRaw.reduce(
        (sum, item) =>
          sum + item.review,
        0
      );

    const healthDegreeGrouped =
      healthDegreeGroupedRaw.map(
        (item) => ({
          ...item,

          mcuPercent:
            healthDegreeMcuTotal > 0
              ? Math.round(
                  (item.mcu /
                    healthDegreeMcuTotal) *
                    100
                )
              : 0,

          reviewPercent:
            healthDegreeReviewTotal > 0
              ? Math.round(
                  (item.review /
                    healthDegreeReviewTotal) *
                    100
                )
              : 0,
        })
      );

    const fitnessMcuData =
      firstNonEmptySummary(
        summary?.fitnessMCU,
        summary?.fitnessCurrentMCU,
        summary?.fitnessMcu,
        summary?.fitness?.mcu
      );

    const fitnessReviewData =
      firstNonEmptySummary(
        summary?.fitnessFollowUp,
        summary?.fitnessCurrentFollowUp,
        summary?.fitnessReview,
        summary?.fitnessDoctorReview,
        summary?.fitness?.followUp,
        summary?.fitness?.review
      );

    const fitnessGroupedRaw =
      FITNESS_STATUS.map((status) => ({
        label: status.label,

        mcu: getSummaryCountByLabel(
          fitnessMcuData,
          status.key
        ),

        review: getSummaryCountByLabel(
          fitnessReviewData,
          status.key
        ),
      }));

    const fitnessMcuTotal =
      fitnessGroupedRaw.reduce(
        (sum, item) =>
          sum + item.mcu,
        0
      );

    const fitnessReviewTotal =
      fitnessGroupedRaw.reduce(
        (sum, item) =>
          sum + item.review,
        0
      );

    const fitnessGrouped =
      fitnessGroupedRaw.map((item) => ({
        ...item,

        mcuPercent:
          fitnessMcuTotal > 0
            ? Math.round(
                (item.mcu /
                  fitnessMcuTotal) *
                  100
              )
            : 0,

        reviewPercent:
          fitnessReviewTotal > 0
            ? Math.round(
                (item.review /
                  fitnessReviewTotal) *
                  100
              )
            : 0,
      }));

    const totalUsers = Math.max(
      0,
      Number(summary?.totalUsers) || 0
    );

    const rawUsersWithMcu =
      Math.max(
        0,
        Number(summary?.usersWithMcu) || 0
      );

    const usersWithMcu = Math.min(
      rawUsersWithMcu,
      totalUsers
    );

    const usersWithoutMcu = Math.max(
      totalUsers - usersWithMcu,
      0
    );

    const mcuStatusPie = [
      {
        name: 'Sudah MCU',
        value: usersWithMcu,
      },
      {
        name: 'Belum MCU',
        value: usersWithoutMcu,
      },
    ].map((item) => ({
      ...item,

      percent:
        totalUsers > 0
          ? Math.round(
              (item.value /
                totalUsers) *
                100
            )
          : 0,
    }));

    const sudahPercent =
      totalUsers > 0
        ? Math.round(
            (usersWithMcu /
              totalUsers) *
              100
          )
        : 0;

    return {
      healthDegreeGrouped,
      fitnessGrouped,
      mcuStatusPie,
      sudahPercent,
      totalUsers,
      usersWithMcu,
      usersWithoutMcu,
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
            setYear(
              Number(event.target.value)
            )
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
          {Array.from(
            { length: 5 },
            (_, index) =>
              currentYear - index
          ).map((itemYear) => (
            <option
              key={itemYear}
              value={itemYear}
            >
              {itemYear}
            </option>
          ))}
        </select>

        <WorkStatusMultiSelect
          options={WORK_STATUS_OPTIONS}
          selected={workStatusFilter}
          onChange={setWorkStatusFilter}
        />
      </div>

      <div className="dcu-chart-card mcu-health-chart-card">
        <h3>
          Derajat Kesehatan Pekerja Berdasarkan MCU
        </h3>

        <p
          style={{
            color: '#8ecbff',
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          Total Pekerja=
          {charts.totalUsers} | Sudah MCU=
          {charts.usersWithMcu} | Belum MCU=
          {charts.usersWithoutMcu}
        </p>

        {loading ? (
          <p className="empty-state">
            Memuat...
          </p>
        ) : error ? (
          <p className="empty-state">
            {error}
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                flex: '1 1 220px',
                minWidth: 220,
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 26,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {charts.sudahPercent}% Sudah MCU
              </div>

              <ResponsiveContainer
                width="100%"
                height={220}
              >
                <PieChart>
                  <Pie
                    data={charts.mcuStatusPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    label={false}
                    labelLine={false}
                  >
                    <Cell fill={COLORS.sudah} />
                    <Cell fill={COLORS.belum} />
                  </Pie>

                  <Tooltip
                    formatter={(
                      value,
                      name,
                      props
                    ) => [
                      `${value} pekerja (${props.payload.percent}%)`,
                      '',
                    ]}
                    contentStyle={{
                      background: '#102d72',
                      border:
                        '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                flex: '2 1 320px',
                minWidth: 280,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={
                    charts.healthDegreeGrouped
                  }
                  margin={{
                    top: 24,
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
                  />

                  <YAxis
                    stroke="#cfe0ff"
                    allowDecimals={false}
                  />

                  <Tooltip
                    formatter={(
                      value,
                      name,
                      props
                    ) => [
                      name === 'mcu'
                        ? `${value} pekerja (${props.payload.mcuPercent}%)`
                        : `${value} pekerja (${props.payload.reviewPercent}%)`,
                      name === 'mcu'
                        ? 'MCU'
                        : 'Review Dokter Perusahaan',
                    ]}
                    contentStyle={{
                      background: '#102d72',
                      border:
                        '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                    }}
                    formatter={(value) =>
                      value === 'mcu'
                        ? 'MCU'
                        : 'Review Dokter Perusahaan'
                    }
                  />

                  <Bar
                    dataKey="mcu"
                    name="mcu"
                    fill={COLORS.mcu}
                    radius={[5, 5, 0, 0]}
                    minPointSize={6}
                  >
                    <LabelList
                      dataKey="mcuPercent"
                      position="top"
                      formatter={(value) =>
                        `${value}%`
                      }
                      style={
                        MCU_PERCENT_LABEL_STYLE
                      }
                    />
                  </Bar>

                  <Bar
                    dataKey="review"
                    name="review"
                    fill={COLORS.review}
                    radius={[5, 5, 0, 0]}
                    minPointSize={6}
                  >
                    <LabelList
                      dataKey="reviewPercent"
                      position="top"
                      formatter={(value) =>
                        `${value}%`
                      }
                      style={
                        REVIEW_PERCENT_LABEL_STYLE
                      }
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <GroupedBarCard
        title="Kelaikan Kerja Berdasarkan MCU"
        data={charts.fitnessGrouped}
        loading={loading}
        error={error}
      />
    </section>
  );
}