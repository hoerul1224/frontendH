import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

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

  const isTenagaKesehatan = role === 'tenaga_kesehatan';
  const isPetugasDCU = role === 'petugas_dcu';
  const canSeeSummary = isTenagaKesehatan || isPetugasDCU;

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
        const res = await API.get('/consultation/admin/top-diagnosis', {
          params: { month: summaryMonth, year: summaryYear, limit: 10 },
        });
        setTopDiagnosis(res.data);
      } catch (err) {
        console.error('Gagal ambil top diagnosis:', err);
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

                  {latestDcu.fitnessStatus && (
                    <div className="info-card-footer">
                      <span className={`fitness-badge fitness-badge-${latestDcu.fitnessStatus}`}>
                        {fitnessLabelShort[latestDcu.fitnessStatus]}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {canSeeSummary && (
          <div style={{ marginTop: 40 }}>
            <h3 className="fitness-heading">Rekap Daily Check Up Perwira</h3>

            <div className="dcu-date-picker">
              <div className="dcu-date-field">
                <label>Bulan</label>
                <select value={summaryMonth} onChange={(e) => setSummaryMonth(Number(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="dcu-date-field">
                <label>Tahun</label>
                <select value={summaryYear} onChange={(e) => setSummaryYear(Number(e.target.value))}>
                  {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {summaryLoading ? (
              <p className="empty-state">Memuat rekap...</p>
            ) : (
              <div className="lab-table-wrapper" style={{ marginTop: 16 }}>
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th>Klasifikasi</th>
                      <th>Jumlah Perwira</th>
                      <th>Bekerja</th>
                      <th>Izin</th>
                      <th>Sakit</th>
                      <th>Libur</th>
                      <th>Dinas</th>
                      <th>Fit</th>
                      <th>Unfit</th>
                      <th>Total DCU</th>
                      <th>Rasio DCU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dcuSummary.map((s) => (
                      <tr key={s.classification}>
                        <td>{s.classification}</td>
                        <td>{s.totalUsers}</td>
                        <td>{s.Bekerja}</td>
                        <td>{s.Izin}</td>
                        <td>{s.Sakit}</td>
                        <td>{s.Libur}</td>
                        <td>{s.Dinas}</td>
                        <td>{s.Fit}</td>
                        <td>{s.Unfit}</td>
                        <td>{s.totalDcu}</td>
                        <td>{s.ratio}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 40 }}>
              <button
                type="button"
                onClick={() => setShowDailyDetail(!showDailyDetail)}
                className="btn-add-dcu"
                style={{ marginBottom: showDailyDetail ? 16 : 0 }}
              >
                Detail Harian {showDailyDetail ? '▲' : '▼'}
              </button>

              {showDailyDetail && (
                <>
                  <div className="dcu-date-picker">
                    <div className="dcu-date-field">
                      <label>Klasifikasi</label>
                      <select value={dailyClassification} onChange={(e) => setDailyClassification(e.target.value)}>
                        <option value="">Semua Klasifikasi</option>
                        {classifications.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {dailyLoading ? (
                    <p className="empty-state">Memuat detail harian...</p>
                  ) : (
                    <div className="lab-table-wrapper" style={{ marginTop: 16 }}>
                      <table className="lab-table">
                        <thead>
                          <tr>
                            <th>Tanggal</th>
                            <th>Bekerja</th>
                            <th>Izin</th>
                            <th>Sakit</th>
                            <th>Libur</th>
                            <th>Dinas</th>
                            <th>Fit</th>
                            <th>Unfit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyData.map((d) => {
                            const hasActivity = d.Bekerja + d.Izin + d.Sakit + d.Libur + d.Dinas + d.Fit + d.Unfit > 0;
                            return (
                              <tr key={d.day} className={hasActivity ? 'dcu-row-active' : ''}>
                                <td>{d.day}/{summaryMonth}/{summaryYear}</td>
                                <td>{d.Bekerja}</td>
                                <td>{d.Izin}</td>
                                <td>{d.Sakit}</td>
                                <td>{d.Libur}</td>
                                <td>{d.Dinas}</td>
                                <td>{d.Fit}</td>
                                <td>{d.Unfit}</td>
                              </tr>
                            );
                          })}
                          <tr className="dcu-row-total">
                            <td>Total</td>
                            <td>{dailyData.reduce((sum, d) => sum + d.Bekerja, 0)}</td>
                            <td>{dailyData.reduce((sum, d) => sum + d.Izin, 0)}</td>
                            <td>{dailyData.reduce((sum, d) => sum + d.Sakit, 0)}</td>
                            <td>{dailyData.reduce((sum, d) => sum + d.Libur, 0)}</td>
                            <td>{dailyData.reduce((sum, d) => sum + d.Dinas, 0)}</td>
                            <td>{dailyData.reduce((sum, d) => sum + d.Fit, 0)}</td>
                            <td>{dailyData.reduce((sum, d) => sum + d.Unfit, 0)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ marginTop: 40 }}>
              <h3 className="fitness-heading">10 Penyakit Terbanyak</h3>
              <p className="user-subgreeting" style={{ marginBottom: 16 }}>
                Berdasarkan diagnosis konsultasi bulan {summaryMonth}/{summaryYear}
              </p>

              {topDiagnosisLoading ? (
                <p className="empty-state">Memuat data...</p>
              ) : topDiagnosis.length === 0 ? (
                <p className="empty-state">Belum ada data konsultasi untuk periode ini.</p>
              ) : (
                <div className="lab-table-wrapper">
                  <table className="lab-table">
                    <thead>
                      <tr>
                        <th>Peringkat</th>
                        <th>Diagnosis / Penyakit</th>
                        <th>Jumlah Kasus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDiagnosis.map((d, i) => (
                        <tr key={d.diagnosis} className={i === 0 ? 'dcu-row-active' : ''}>
                          <td>{i + 1}</td>
                          <td style={{ textTransform: 'capitalize' }}>{d.diagnosis}</td>
                          <td>{d.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ marginTop: 40 }}>
              <h3 className="fitness-heading">10 Diagnosis Terbanyak dari MCU</h3>
              <p className="user-subgreeting" style={{ marginBottom: 16 }}>
                Berdasarkan hasil Medical Check Up bulan {summaryMonth}/{summaryYear}
              </p>

              {topMcuDiagnosisLoading ? (
                <p className="empty-state">Memuat data...</p>
              ) : topMcuDiagnosis.length === 0 ? (
                <p className="empty-state">Belum ada data MCU untuk periode ini.</p>
              ) : (
                <div className="lab-table-wrapper">
                  <table className="lab-table">
                    <thead>
                      <tr>
                        <th>Peringkat</th>
                        <th>Diagnosis</th>
                        <th>Jumlah Kasus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMcuDiagnosis.map((d, i) => (
                        <tr key={d.diagnosis} className={i === 0 ? 'dcu-row-active' : ''}>
                          <td>{i + 1}</td>
                          <td style={{ textTransform: 'capitalize' }}>{d.diagnosis}</td>
                          <td>{d.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}