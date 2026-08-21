import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { username, email } = useAuth();
  const [dcuDoneToday, setDcuDoneToday] = useState(false);
  const [latestDcu, setLatestDcu] = useState(null);
  const [latestMcu, setLatestMcu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const today = new Date();
        const res = await API.get('/dcu', { params: { year: today.getFullYear(), month: today.getMonth() + 1 } });
        const todayStr = today.toISOString().slice(0, 10);
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
      </div>
    </div>
  );
}