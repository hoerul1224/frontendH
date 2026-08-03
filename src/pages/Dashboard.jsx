import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { email } = useAuth();
  const [dcuDoneToday, setDcuDoneToday] = useState(false);
  const [fitnessStatus, setFitnessStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const today = new Date();
        const res = await API.get('/dcu', { params: { year: today.getFullYear(), month: today.getMonth() + 1 } });
        const todayStr = today.toISOString().slice(0, 10);
        setDcuDoneToday(res.data.some((r) => r.date.slice(0, 10) === todayStr));
      } catch (err) {
        console.error('Gagal ambil data DCU:', err);
      }

      try {
        const mcuRes = await API.get('/mcu');
        if (mcuRes.data.length > 0) setFitnessStatus(mcuRes.data[0].fitnessStatus);
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

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Halo, {email}</h1>
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
            {fitnessStatus ? (
              <span className={`fitness-badge fitness-badge-${fitnessStatus}`}>{fitnessLabel[fitnessStatus]}</span>
            ) : (
              <p className="empty-state">Belum ada data kelaikan kerja.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}