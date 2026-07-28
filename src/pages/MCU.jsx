import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function MCU() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/mcu/${year}`);
        setRecord(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Berikut Medical Check Up mu</h1>

        <div className="mcu-year-picker">
          <label>Tahun</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : (
          <>
            <div className="mcu-section">
              <h4>DERAJAT KESEHATAN</h4>
              <div className="mcu-section-box">{record?.healthDegree || '-'}</div>
            </div>
            <div className="mcu-section">
              <h4>DIAGNOSIS MCU</h4>
              <div className="mcu-section-box">{record?.diagnosis || '-'}</div>
            </div>
            <div className="mcu-section">
              <h4>KELAIKAN KERJA</h4>
              <div className="mcu-section-box">{record?.workFitness || '-'}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}