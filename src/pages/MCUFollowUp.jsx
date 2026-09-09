import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function MCUFollowUp() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  const fitnessLabel = {
    laik: 'Laik Kerja',
    laik_dengan_catatan: 'Laik Kerja dengan Catatan',
    tidak_laik: 'Tidak Laik Kerja',
  };

  const followUpLabel = {
    belum_verifikasi: 'Belum Verifikasi',
    terverifikasi: 'Terverifikasi',
  };

  const followUpBadgeClass = (v) =>
    `fitness-badge fitness-badge-${v === 'terverifikasi' ? 'laik' : 'laik_dengan_catatan'}`;

  const handleUpload = (recordId, file) => {
    if (!file) return;
    setUploadingId(recordId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await API.put(`/mcu/${recordId}/followup`, {
          followUpDocument: reader.result,
        });
        setRecords((prev) => prev.map((r) => (r._id === recordId ? res.data : r)));
      } catch (err) {
        console.error('Gagal upload bukti tindak lanjut:', err);
        alert('Gagal mengunggah dokumen. Coba lagi.');
      } finally {
        setUploadingId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const overallDone = records.length > 0 && records.every((r) => r.followUpStatus === 'terverifikasi');

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <p className="dcu-status-line">
          Kamu{' '}
          <span className={`status-pill ${overallDone ? 'status-pill-done' : 'status-pill-waiting'}`}>
            {overallDone ? 'SUDAH' : 'BELUM'}
          </span>{' '}
          melakukan tindak lanjut MCU.
        </p>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : records.length === 0 ? (
          <p className="empty-state">Belum ada data MCU.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {records.map((r) => (
              <div key={r._id} className="mcu-info-box" style={{ maxWidth: '100%' }}>
                <div className="mcu-section">
                  <h4>TANGGAL MCU</h4>
                  <div className="mcu-section-box">{new Date(r.date).toLocaleDateString('id-ID')}</div>
                </div>

                <div className="mcu-section">
                  <h4>DIAGNOSIS MCU</h4>
                  <div className="mcu-section-box">
                    {[r.diagnosis1, r.diagnosis2, r.diagnosis3].filter(Boolean).join(', ') || '-'}
                  </div>
                </div>

                <div className="mcu-section">
                  <h4>KELAIKAN KERJA</h4>
                  <div className="mcu-section-box">{fitnessLabel[r.fitnessStatus] || '-'}</div>
                </div>

                {r.recommendation && (
                  <div className="mcu-section">
                    <h4>REKOMENDASI DOKTER</h4>
                    <div className="mcu-section-box">{r.recommendation}</div>
                  </div>
                )}

                <div className="mcu-section">
                  <h4>STATUS TINDAK LANJUT</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span className={followUpBadgeClass(r.followUpStatus)}>
                      {followUpLabel[r.followUpStatus] || 'Belum Verifikasi'}
                    </span>

                    {r.followUpDocument && (
                      
                       <a href={r.followUpDocument}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13, color: '#8ecbff' }}
                      >
                        Lihat Dokumen
                      </a>
                    )}

                    {r.followUpStatus !== 'terverifikasi' && (
                      <label
                        style={{
                          padding: '8px 16px',
                          background: '#4f46e5',
                          color: 'white',
                          borderRadius: 8,
                          fontSize: 13,
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {uploadingId === r._id
                          ? 'Mengunggah...'
                          : r.followUpDocument
                          ? 'Upload Ulang Bukti'
                          : 'Upload Bukti Tindak Lanjut'}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleUpload(r._id, e.target.files[0])}
                          style={{ display: 'none' }}
                          disabled={uploadingId === r._id}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}