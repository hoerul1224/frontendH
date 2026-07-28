import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function MiniMCU() {
  const { email } = useAuth();
  const today = new Date();
  const [yearFilter, setYearFilter] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = yearFilter === 'all' ? {} : { year: yearFilter };
        const res = await API.get('/mini-mcu', { params });
        setRecords(res.data);
      } catch (err) {
        console.error('Gagal ambil data mini MCU:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [yearFilter]);

  const labelClass = (label) => {
    if (label === 'Normal') return 'lab-badge lab-normal';
    if (label === 'Rendah') return 'lab-badge lab-low';
    if (label === 'Tinggi') return 'lab-badge lab-high';
    return 'lab-badge';
  };

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <div className="minimcu-top">
          <div>
            <h1 className="user-greeting">Halo, {email}</h1>
            <p className="user-subgreeting">
              Berikut <em>Mini MCU</em> mu
            </p>
            <div className="dcu-date-field" style={{ marginTop: 16 }}>
              <label>Tahun</label>
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="all">Semua Tahun</option>
                {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lab-reference">
            <p>GDP: 70–100 (normal), &lt;70 (rendah), &gt;100 (tinggi)</p>
            <p>GDS: &lt;200 (normal), &ge;200 (tinggi)</p>
            <p>Asam urat perempuan: 2.6–6 (normal); &lt;2.6 (rendah); &gt;6 (tinggi)</p>
            <p>Asam urat laki-laki: 3.5–7.2 (normal); &lt;3.5 (rendah); &gt;7.2 (tinggi)</p>
            <p>Kolesterol total: &lt;200 (normal), &ge;200 (tinggi)</p>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : records.length === 0 ? (
          <p className="empty-state">Belum ada data mini MCU.</p>
        ) : (
          <div className="lab-table-wrapper">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Tanggal Pemeriksaan</th>
                  <th>Keluhan</th>
                  <th>Gula Darah Puasa</th>
                  <th>Keterangan</th>
                  <th>Gula Darah Sewaktu</th>
                  <th>Keterangan</th>
                  <th>Asam Urat</th>
                  <th>Keterangan</th>
                  <th>Kolesterol Total</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                    <td>{r.complaint || '-'}</td>
                    <td>{r.gdp ?? '-'}</td>
                    <td><span className={labelClass(r.gdpLabel)}>{r.gdpLabel}</span></td>
                    <td>{r.gds ?? '-'}</td>
                    <td><span className={labelClass(r.gdsLabel)}>{r.gdsLabel}</span></td>
                    <td>{r.uricAcid ?? '-'}</td>
                    <td><span className={labelClass(r.uricAcidLabel)}>{r.uricAcidLabel}</span></td>
                    <td>{r.cholesterolTotal ?? '-'}</td>
                    <td><span className={labelClass(r.cholesterolLabel)}>{r.cholesterolLabel}</span></td>
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