import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import UserNavbar from '../components/UserNavbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { username, email, role } = useAuth();
  const [dcuDoneToday, setDcuDoneToday] = useState(false);
  const [latestDcu, setLatestDcu] = useState(null);
  const [latestMcu, setLatestMcu] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [summaryMonth, setSummaryMonth] = useState(today.getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(today.getFullYear());
  const [dcuSummary, setDcuSummary] = useState([]);
  const [usersWithDcu, setUsersWithDcu] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const classifications = ['Plant', 'Komorbid', 'Security & CSO', 'Driver', 'Health', 'Office'];
  const [dailyClassification, setDailyClassification] = useState('');
  const [showDailyDetail, setShowDailyDetail] = useState(false);
  const [dailyData, setDailyData] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [topDiagnosis, setTopDiagnosis] = useState([]);
  const [topDiagnosisLoading, setTopDiagnosisLoading] = useState(true);
  const [topMcuDiagnosis, setTopMcuDiagnosis] = useState([]);
  const [topMcuDiagnosisLoading, setTopMcuDiagnosisLoading] = useState(true);
  const [followUpSummary, setFollowUpSummary] = useState([]);
  const [followUpOverall, setFollowUpOverall] = useState(0);
  const [followUpLoading, setFollowUpLoading] = useState(true);
  const [followUpFilter, setFollowUpFilter] = useState('');

  const isTenagaKesehatan = role === 'tenaga_kesehatan';
  const isPetugasDCU = role === 'petugas_dcu';
  const isKepalaDepartemen = role === 'kepala_departemen';
  const canSeeSummary = isTenagaKesehatan || isPetugasDCU || isKepalaDepartemen;

  const navigate = useNavigate();
  const [statusPanel, setStatusPanel] = useState(null); // 'Fit' | 'Unfit' | null
  const [statusUsers, setStatusUsers] = useState([]);
  const [statusUsersLoading, setStatusUsersLoading] = useState(false);

  const handleStatusClick = async (status) => {
    if (statusPanel === status) {
      setStatusPanel(null);
      return;
    }
    setStatusPanel(status);
    setStatusUsersLoading(true);
    try {
      const res = await API.get('/dcu/admin/users-by-status', {
        params: { month: summaryMonth, year: summaryYear, status },
      });
      setStatusUsers(res.data);
    } catch (err) {
      console.error('Gagal ambil daftar user:', err);
    } finally {
      setStatusUsersLoading(false);
    }
  };

  const goToConsultation = (userId) => {
    navigate(`/admin/consultation?userId=${userId}&readonly=1`);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const todayReq = new Date();
        const res = await API.get('/dcu', { params: { year: todayReq.getFullYear(), month: todayReq.getMonth() + 1 } });
        const todayStr = todayReq.toISOString().slice(0, 10);
        setDcuDoneToday(res.data.some((r) => r.date.slice(0, 10) === todayStr));
        if (res.data.length > 0) setLatestDcu(res.data[res.data.length - 1]);
      } catch (err) {
        console.error('Gagal ambil data DCU:', err);
      }

      try {
        const mcuRes = await API.get('/mcu');
        if (mcuRes.data.length > 0) setLatestMcu(mcuRes.data[0]);
      } catch (err) {
        console.error('Gagal ambil data MCU:', err);
      }

      setLoading(false);
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!canSeeSummary) return;
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const res = await API.get('/dcu/admin/summary', { params: { month: summaryMonth, year: summaryYear } });
        setDcuSummary(res.data.summary);
        setUsersWithDcu(res.data.usersWithDcu || 0);
      } catch (err) {
        console.error('Gagal ambil rekap DCU:', err);
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [summaryMonth, summaryYear, canSeeSummary]);

  useEffect(() => {
    if (!canSeeSummary) return;
    const fetchDaily = async () => {
      setDailyLoading(true);
      try {
        const params = { month: summaryMonth, year: summaryYear };
        if (dailyClassification) params.classification = dailyClassification;
        const res = await API.get('/dcu/admin/daily', { params });
        setDailyData(res.data.daily);
      } catch (err) {
        console.error('Gagal ambil detail harian DCU:', err);
      } finally {
        setDailyLoading(false);
      }
    };
    fetchDaily();
  }, [summaryMonth, summaryYear, dailyClassification, canSeeSummary]);

  useEffect(() => {
  if (!canSeeSummary) return;
  const fetchTopDiagnosis = async () => {
    setTopDiagnosisLoading(true);
    try {
      const res = await API.get('/dcu/admin/top-complaints', {
        params: { month: summaryMonth, year: summaryYear, limit: 10 },
      });
      setTopDiagnosis(res.data.map((d) => ({ diagnosis: d.complaint, count: d.count })));
    } catch (err) {
      console.error('Gagal ambil top keluhan DCU:', err);
    } finally {
      setTopDiagnosisLoading(false);
    }
  };
  fetchTopDiagnosis();
}, [summaryMonth, summaryYear, canSeeSummary]);

  useEffect(() => {
    if (!canSeeSummary) return;
    const fetchTopMcuDiagnosis = async () => {
      setTopMcuDiagnosisLoading(true);
      try {
        const res = await API.get('/mcu/admin/top-diagnosis', {
          params: { month: summaryMonth, year: summaryYear, limit: 10 },
        });
        setTopMcuDiagnosis(res.data);
      } catch (err) {
        console.error('Gagal ambil top diagnosis MCU:', err);
      } finally {
        setTopMcuDiagnosisLoading(false);
      }
    };
    fetchTopMcuDiagnosis();
  }, [summaryMonth, summaryYear, canSeeSummary]);

  useEffect(() => {
  if (!canSeeSummary) return;
  const fetchFollowUpSummary = async () => {
    setFollowUpLoading(true);
    try {
      const res = await API.get('/mcu/admin/followup-summary', {
        params: { month: summaryMonth, year: summaryYear },
      });
      setFollowUpSummary(res.data.summary);
      setFollowUpOverall(res.data.overallPercentage || 0);
    } catch (err) {
      console.error('Gagal ambil rekap tindak lanjut MCU:', err);
    } finally {
      setFollowUpLoading(false);
    }
  };
  fetchFollowUpSummary();
}, [summaryMonth, summaryYear, canSeeSummary]);

  const fitnessLabel = {
    laik: 'LAIK KERJA',
    laik_dengan_catatan: 'LAIK KERJA DENGAN CATATAN',
    tidak_laik: 'TIDAK LAIK KERJA',
  };

  const fitnessLabelShort = {
    laik: 'Laik Kerja',
    laik_dengan_catatan: 'Laik Kerja dengan Catatan',
    tidak_laik: 'Tidak Laik Kerja',
  };

  const diagnosisList = latestMcu
    ? [latestMcu.diagnosis1, latestMcu.diagnosis2, latestMcu.diagnosis3].filter(Boolean)
    : [];

  const vitalCards = latestDcu
    ? [
        { icon: '🗓️', label: 'Tanggal', value: new Date(latestDcu.date).toLocaleDateString('id-ID') },
        { icon: '💬', label: 'Keluhan', value: latestDcu.complaint || '-' },
        { icon: '❤️', label: 'Sistolik', value: latestDcu.systolic ?? '-', unit: 'mmHg' },
        { icon: '❤️', label: 'Diastolik', value: latestDcu.diastolic ?? '-', unit: 'mmHg' },
        { icon: '💓', label: 'Detak Jantung', value: latestDcu.heartRate ?? '-', unit: 'bpm' },
        { icon: '🌡️', label: 'Temperatur', value: latestDcu.temperature ?? '-', unit: '°C' },
        { icon: '🫁', label: 'Saturasi O2', value: latestDcu.oxygenSaturation ?? '-', unit: '%' },
        { icon: '🧍', label: 'Romberg', value: latestDcu.romberg || '-' },
      ]
    : [];

  // --- Data turunan untuk chart ---
  const totalPerwira = dcuSummary.reduce((sum, s) => sum + s.totalUsers, 0);
  const totalDcuBulanIni = dcuSummary.reduce((sum, s) => sum + s.totalDcu, 0);
  const totalFitCount = dcuSummary.reduce((sum, s) => sum + s.Fit, 0);
  const totalUnfitCount = dcuSummary.reduce((sum, s) => sum + s.Unfit, 0);
  const avgRatio = totalPerwira > 0 ? Math.round((usersWithDcu / totalPerwira) * 100) : 0;
  const totalPenyakitTercatat = topDiagnosis.reduce((sum, d) => sum + d.count, 0);

  const classificationBarData = dcuSummary.map((s) => ({ classification: s.classification, totalDcu: s.totalDcu }));

  const fitUnfitPieData = [
    { name: 'Fit', value: totalFitCount },
    { name: 'Unfit', value: totalUnfitCount },
  ];
  const PIE_COLORS = ['#2dd4bf', '#ef4444'];

  const attendanceBarData = ['Bekerja', 'Izin', 'Sakit', 'Libur', 'Dinas'].map((key) => ({
    status: key,
    jumlah: dcuSummary.reduce((sum, s) => sum + s[key], 0),
  }));

  const dailyTrendData = dailyData.map((d) => ({ day: d.day, Fit: d.Fit, Unfit: d.Unfit }));

  const followUpChartData = (followUpFilter
  ? followUpSummary.filter((s) => s.workStatus === followUpFilter)
  : followUpSummary
).slice().sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Halo, {username || email}</h1>
        <p className="user-subgreeting">Selamat datang di myPDG+</p>

        {!loading && (
          <>
            <p className="dcu-status-line">
              Hari ini kamu{' '}
              <span className={`status-pill ${dcuDoneToday ? 'status-pill-done' : 'status-pill-waiting'}`}>
                {dcuDoneToday ? 'SUDAH' : 'BELUM'}
              </span>{' '}
              melakukan pemeriksaan kesehatan.
            </p>

            <h3 className="fitness-heading">Kelaikan Kerja:</h3>
            {latestMcu?.fitnessStatus ? (
              <span className={`fitness-badge fitness-badge-${latestMcu.fitnessStatus}`}>
                {fitnessLabel[latestMcu.fitnessStatus]}
              </span>
            ) : (
              <p className="empty-state">Belum ada data kelaikan kerja.</p>
            )}

            <div className="info-cards-row">
              {latestMcu && (diagnosisList.length > 0 || latestMcu.recommendation) && (
                <div className="info-card info-card-mcu">
                  <div className="info-card-header">
                    <span className="info-card-icon">🩺</span>
                    <h4>Hasil Medical Check Up</h4>
                  </div>

                  {diagnosisList.length > 0 && (
                    <div className="info-card-section">
                      <span className="info-card-label">Diagnosis</span>
                      <div className="diagnosis-tags">
                        {diagnosisList.map((d, i) => (
                          <span key={i} className="diagnosis-tag">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {latestMcu.recommendation && (
                    <div className="info-card-section">
                      <span className="info-card-label">Apa yang harus kamu lakukan</span>
                      <div className="recommendation-box">
                        <span className="recommendation-icon">💡</span>
                        <p>{latestMcu.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {latestDcu && (
                <div className="info-card info-card-dcu">
                  <div className="info-card-header">
                    <span className="info-card-icon">📋</span>
                    <h4>Daily Check Up Terakhir</h4>
                  </div>

                  <div className="vital-grid">
                    {vitalCards.map((v, i) => (
                      <div key={i} className="vital-card">
                        <span className="vital-icon">{v.icon}</span>
                        <span className="vital-label">{v.label}</span>
                        <span className="vital-value">
                          {v.value} {v.unit && <span className="vital-unit">{v.unit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          </>
        )}

        {canSeeSummary && (
          <div style={{ marginTop: 40, marginBottom: 40 }}>
            <h3 style={{ color: 'white', fontSize: 24, fontWeight: 700, letterSpacing: 1, textAlign: 'center', marginBottom: 4 }}>
  RINGKASAN KESEHATAN PERWIRA
</h3>

<div className="dcu-date-picker" style={{ justifyContent: 'center', alignItems: 'center' }}>
  <div className="dcu-date-field" style={{ alignItems: 'center' }}>
    <label>Bulan</label>
    <select value={summaryMonth} onChange={(e) => setSummaryMonth(Number(e.target.value))}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
    </select>
  </div>
  <div className="dcu-date-field" style={{ alignItems: 'center' }}>
    <label>Tahun</label>
    <select value={summaryYear} onChange={(e) => setSummaryYear(Number(e.target.value))}>
      {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
    </select>
  </div>
</div>

            {summaryLoading ? (
  <p className="empty-state">Memuat ringkasan...</p>
) : (
  <>
    <h4 style={{ color: 'white', fontSize: 24, fontWeight: 700, letterSpacing: 1, textAlign: 'center', marginTop: 24, marginBottom: 12 }}>
  DAILY CHECK UP
</h4>
    <div
  className="dashboard-stats-grid"
  style={{
    marginTop: 16,
    gridTemplateColumns: 'repeat(4, minmax(180px, 220px))',
    justifyContent: 'center',
  }}
>
  <div className="dashboard-stat-card">
    <div className="dashboard-stat-label">Total DCU</div>
    <div className="dashboard-stat-value">{totalDcuBulanIni}</div>
  </div>
  <div
    className="dashboard-stat-card dashboard-stat-card-clickable"
    onClick={() => handleStatusClick('Fit')}
  >
    <div className="dashboard-stat-label">Total Fit</div>
    <div className="dashboard-stat-value">{totalFitCount}</div>
  </div>
  <div
    className="dashboard-stat-card dashboard-stat-card-clickable"
    onClick={() => handleStatusClick('Unfit')}
  >
    <div className="dashboard-stat-label">Total Unfit</div>
    <div className="dashboard-stat-value">{totalUnfitCount}</div>
  </div>
  {statusPanel && (
    <div className="status-user-panel">
      <div className="status-user-panel-header">
        <h4>Daftar Perwira — {statusPanel}</h4>
        <button className="status-user-panel-close" onClick={() => setStatusPanel(null)}>✕</button>
      </div>
      {statusUsersLoading ? (
        <p className="empty-state">Memuat...</p>
      ) : statusUsers.length === 0 ? (
        <p className="empty-state">Tidak ada data untuk status ini.</p>
      ) : (
        <div className="status-user-list">
          {statusUsers.map((u) => (
            <button
              key={u.userId}
              className="status-user-item"
              onClick={() => goToConsultation(u.userId)}
            >
              <span>{u.fullName || u.email}</span>
              <span className="status-user-item-id">{u.perwiraId || '-'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )}
  <div className="dashboard-stat-card">
    <div className="dashboard-stat-label">Rasio DCU</div>
    <div className="dashboard-stat-value">{avgRatio}%</div>
  </div>
</div>

                <div className="dashboard-charts-row">
                  <div className="dcu-chart-card">
                    <h3>Total DCU per Klasifikasi</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={classificationBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="classification" stroke="#cfe0ff" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#cfe0ff" />
                        <Tooltip />
                        <Bar dataKey="totalDcu" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="dcu-chart-card">
                    <h3>Fit vs Unfit</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={fitUnfitPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                          {fitUnfitPieData.map((entry, i) => (
                            <Cell key={i} fill={PIE_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="dcu-chart-card">
                    <h3>Status Kehadiran</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={attendanceBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="status" stroke="#cfe0ff" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#cfe0ff" />
                        <Tooltip />
                        <Bar dataKey="jumlah" fill="#5aa9e6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="dcu-chart-card" style={{ marginBottom: 40 }}>
  <h3>Tren DCU Harian (Fit vs Unfit)</h3>
  {dailyLoading ? (
    <p className="empty-state">Memuat...</p>
  ) : (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={dailyTrendData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="day" stroke="#cfe0ff" />
        <YAxis stroke="#cfe0ff" />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="Fit" stackId="1" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.35} />
        <Area type="monotone" dataKey="Unfit" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} />
      </AreaChart>
    </ResponsiveContainer>
  )}
</div>

<h4 style={{ color: 'white', fontSize: 24, fontWeight: 700, letterSpacing: 1, textAlign: 'center', marginTop: 24, marginBottom: 12 }}>
  10 PENYAKIT TERBANYAK
</h4>

<div className="dashboard-charts-row-2">
  <div className="dcu-chart-card">
  <h3>10 Penyakit Terbanyak Berdasarkan DCU</h3>
    {topDiagnosisLoading ? (
      <p className="empty-state">Memuat...</p>
    ) : topDiagnosis.length === 0 ? (
      <p className="empty-state">Belum ada data.</p>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={topDiagnosis} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="#cfe0ff" />
          <YAxis dataKey="diagnosis" type="category" stroke="#cfe0ff" width={90} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>

    <div className="dcu-chart-card">
  <h3>10 Penyakit Terbanyak Berdasarkan MCU</h3>
    {topMcuDiagnosisLoading ? (
      <p className="empty-state">Memuat data...</p>
    ) : topMcuDiagnosis.length === 0 ? (
      <p className="empty-state">Belum ada data MCU untuk periode ini.</p>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={topMcuDiagnosis} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="#cfe0ff" allowDecimals={false} />
          <YAxis dataKey="diagnosis" type="category" stroke="#cfe0ff" width={90} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
</div>

<h4 style={{ color: 'white', fontSize: 24, fontWeight: 700, letterSpacing: 1, textAlign: 'center', marginTop: 24, marginBottom: 12 }}>
  % TINDAK LANJUT MCU
</h4>

<div className="dcu-chart-card" style={{ marginBottom: 40 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
    <h3 style={{ margin: 0 }}>
      Total: {followUpOverall}% Terverifikasi
    </h3>
    <select
      value={followUpFilter}
      onChange={(e) => setFollowUpFilter(e.target.value)}
      style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#0f2d7a', color: '#cfe0ff', fontSize: 13 }}
    >
      <option value="">Semua Status Pekerja</option>
      {followUpSummary.map((s) => (
        <option key={s.workStatus} value={s.workStatus}>{s.workStatus}</option>
      ))}
    </select>
  </div>

  {followUpLoading ? (
    <p className="empty-state">Memuat...</p>
  ) : followUpChartData.length === 0 ? (
    <p className="empty-state">Belum ada data MCU untuk periode ini.</p>
  ) : (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={followUpChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="workStatus" stroke="#cfe0ff" tick={{ fontSize: 11 }} />
        <YAxis stroke="#cfe0ff" unit="%" domain={[0, 100]} />
        <Tooltip formatter={(value, name) => [`${value}%`, name === 'percentage' ? '% Terverifikasi' : name]} />
        <Bar dataKey="percentage" fill="#2dd4bf" radius={[4, 4, 0, 0]} name="% Terverifikasi" />
      </BarChart>
    </ResponsiveContainer>
  )}
</div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}