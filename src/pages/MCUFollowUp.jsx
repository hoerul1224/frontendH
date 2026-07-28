import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function MCUFollowUp() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
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
  }, []);

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <p className="dcu-status-line">
          Kamu{' '}
          <span className={`status-pill ${record?.followUpDone ? 'status-pill-done' : 'status-pill-waiting'}`}>
            {record?.followUpDone ? 'SUDAH' : 'BELUM'}
          </span>{' '}
          melakukan tindaklanjut MCU.
        </p>

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