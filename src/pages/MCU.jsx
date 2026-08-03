import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function MCU() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/mcu');
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fitnessLabel = {
    laik: 'Laik Kerja',
    laik_dengan_catatan: 'Laik Kerja dengan Catatan',
    tidak_laik: 'Tidak Laik Kerja',
  };

  const fitnessBadgeClass = (v) => `fitness-badge fitness-badge-${v || 'none'}`;

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Berikut Medical Check Up mu</h1>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : records.length === 0 ? (
          <p className="empty-state">Belum ada data MCU.</p>
        ) : (
          <div className="lab-table-wrapper">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Lokasi</th>
                  <th>Diagnosis 1</th>
                  <th>Diagnosis 2</th>
                  <th>Diagnosis 3</th>
                  <th>Temperatur</th>
                  <th>Saturasi O2</th>
                  <th>Romberg</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                    <td>{r.examLocation || '-'}</td>
                    <td>{r.diagnosis1 || '-'}</td>
                    <td>{r.diagnosis2 || '-'}</td>
                    <td>{r.diagnosis3 || '-'}</td>
                    <td>{r.temperature ?? '-'}</td>
                    <td>{r.oxygenSaturation ?? '-'}</td>
                    <td>{r.romberg || '-'}</td>
                    <td><span className={fitnessBadgeClass(r.fitnessStatus)}>{fitnessLabel[r.fitnessStatus] || '-'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}