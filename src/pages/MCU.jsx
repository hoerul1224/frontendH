import { useEffect, useState } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';
export default function MCU() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await API.get('/mcu');
      setRecords(response.data || []);
    } catch (err) {
      console.error(
        'Gagal mengambil data MCU:',
        err
      );
    } finally {
      setLoading(false);
    }
  };
  const fitnessLabel = {
    laik: 'Laik Kerja',
    laik_dengan_catatan:
      'Laik dengan Catatan',
    tidak_laik: 'Tidak Laik Kerja',
  };
  const healthDegreeLabel = {
    P1: 'P1',
    P2: 'P2',
    P3: 'P3',
    P4: 'P4',
    P5: 'P5',
    P6: 'P6',
    P7: 'P7',
  };
  const getFollowUpLabel = (record) => {
    if (
      record.followUpStatus ===
      'terverifikasi'
    ) {
      return 'Terverifikasi';
    }
    if (record.followUpDone === true) {
      return 'Menunggu Verifikasi';
    }
    return 'Belum TL MCU';
  };
  const getFollowUpClass = (record) => {
    if (
      record.followUpStatus ===
      'terverifikasi'
    ) {
      return 'fitness-badge fitness-badge-laik';
    }
    if (record.followUpDone === true) {
      return 'fitness-badge fitness-badge-laik_dengan_catatan';
    }
    return 'fitness-badge fitness-badge-tidak_laik';
  };
  const handleUpload = (recordId, file) => {
    if (!file) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5 MB.');
      return;
    }
    setUploadingId(recordId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await API.put(
          `/mcu/${recordId}/followup`,
          {
            followUpDocument: reader.result,
          }
        );
        setRecords((previousRecords) =>
          previousRecords.map((record) =>
            record._id === recordId
              ? response.data
              : record
          )
        );
        alert(
          'Dokumen berhasil diupload dan menunggu verifikasi dokter/nakes.'
        );
      } catch (err) {
        console.error(
          'Gagal upload dokumen TL MCU:',
          err
        );
        alert(
          'Gagal mengunggah dokumen. Silakan coba lagi.'
        );
      } finally {
        setUploadingId(null);
      }
    };
    reader.onerror = () => {
      setUploadingId(null);
      alert('File tidak dapat dibaca.');
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">
          Berikut Medical Check Up mu
        </h1>
        {loading ? (
          <p className="empty-state">
            Memuat...
          </p>
        ) : records.length === 0 ? (
          <p className="empty-state">
            Belum ada data MCU.
          </p>
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
                  <th>Derajat Kesehatan</th>
                  <th>Temperatur</th>
                  <th>Saturasi O2</th>
                  <th>Romberg</th>
                  <th>Kelaikan Kerja</th>
                  <th>Status TL MCU</th>
                  <th>Dokumen TL MCU</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>
                      {new Date(
                        record.date
                      ).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      {record.examLocation || '-'}
                    </td>
                    <td>
                      {record.diagnosis1 || '-'}
                    </td>
                    <td>
                      {record.diagnosis2 || '-'}
                    </td>
                    <td>
                      {record.diagnosis3 || '-'}
                    </td>
                    <td>
                      {healthDegreeLabel[
                        record.healthDegree
                      ] || '-'}
                    </td>
                    <td>
                      {record.temperature ?? '-'}
                    </td>
                    <td>
                      {record.oxygenSaturation ?? '-'}
                    </td>
                    <td>
                      {record.romberg || '-'}
                    </td>
                    <td>
                      <span
                        className={`fitness-badge fitness-badge-${
                          record.fitnessStatus || 'none'
                        }`}
                      >
                        {fitnessLabel[
                          record.fitnessStatus
                        ] || '-'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={getFollowUpClass(
                          record
                        )}
                      >
                        {getFollowUpLabel(record)}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          minWidth: 160,
                        }}
                      >
                        {record.followUpDocument && (
                          <a
                            href={
                              record.followUpDocument
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#8ecbff',
                              fontSize: 12,
                            }}
                          >
                            Lihat Dokumen
                          </a>
                        )}
                        {record.followUpStatus !==
                          'terverifikasi' && (
                          <label
                            style={{
                              display: 'inline-block',
                              padding: '8px 10px',
                              background: '#4f46e5',
                              color: 'white',
                              borderRadius: 8,
                              fontSize: 12,
                              cursor:
                                uploadingId ===
                                record._id
                                  ? 'wait'
                                  : 'pointer',
                              fontWeight: 600,
                              textAlign: 'center',
                              opacity:
                                uploadingId ===
                                record._id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {uploadingId ===
                            record._id
                              ? 'Mengunggah...'
                              : record.followUpDocument
                              ? 'Upload Ulang'
                              : 'Upload Bukti'}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              disabled={
                                uploadingId ===
                                record._id
                              }
                              onChange={(event) => {
                                handleUpload(
                                  record._id,
                                  event.target.files?.[0]
                                );
                                event.target.value =
                                  '';
                              }}
                              style={{
                                display: 'none',
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </td>
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