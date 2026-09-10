import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function ManageMCU() {
  const today = new Date();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [tableSearch, setTableSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [verifyingId, setVerifyingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  const [form, setForm] = useState({
    date: '',
    examLocation: '',
    workStatus: '',
    diagnosis1: '',
    diagnosis2: '',
    diagnosis3: '',
    healthDegree: '',
    fitnessStatus: '',
    recommendation: '',
  });

  const [saved, setSaved] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);

    try {
      const params = {};

      if (year) params.year = year;
      if (month) params.month = month;
      if (day) params.day = day;

      const response = await API.get(
        '/mcu/admin',
        { params }
      );

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

  useEffect(() => {
    fetchRecords();
  }, [day, month, year]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get(
          '/auth/users'
        );

        setUsers(response.data || []);
      } catch (err) {
        console.error(
          'Gagal mengambil data user:',
          err
        );
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = search.trim()
    ? users.filter((user) =>
        (user.perwiraId || '')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (user.fullName || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : [];

  const handlePickUser = (user) => {
    setSelectedUser(user);

    setSearch(
      `${user.perwiraId || '-'} — ${
        user.fullName || user.email
      }`
    );

    setShowSuggestions(false);

    setForm((previousForm) => ({
      ...previousForm,
      workStatus:
        previousForm.workStatus ||
        user.employmentStatus ||
        '',
    }));
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setSaved(false);
  };

  const resetForm = () => {
    setForm({
      date: '',
      examLocation: '',
      workStatus: '',
      diagnosis1: '',
      diagnosis2: '',
      diagnosis3: '',
      healthDegree: '',
      fitnessStatus: '',
      recommendation: '',
    });

    setSelectedUser(null);
    setSearch('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUser) {
      alert('Pilih pekerja terlebih dahulu.');
      return;
    }

    try {
      await API.post(
        `/mcu/admin/${selectedUser._id}`,
        form
      );

      setSaved(true);
      resetForm();
      await fetchRecords();
    } catch (err) {
      console.error(
        'Gagal menyimpan data MCU:',
        err
      );

      alert(
        err.response?.data?.error ||
          'Gagal menyimpan data MCU.'
      );
    }
  };

  const handleVerify = async (record) => {
  if (!record.followUpHealthDegree) {
    alert(
      'Pilih derajat kesehatan setelah TL MCU terlebih dahulu.'
    );
    return;
  }
  if (!record.followUpFitnessStatus) {
    alert(
      'Pilih kelaikan kerja setelah TL MCU terlebih dahulu.'
    );
    return;
  }
  const confirmed = window.confirm(
    'Simpan hasil tindak lanjut MCU ini?'
  );
  if (!confirmed) {
    return;
  }
  setVerifyingId(record._id);
  try {
    const response = await API.put(
      `/mcu/admin/${record._id}/verify`,
      {
        followUpHealthDegree:
          record.followUpHealthDegree,
        followUpFitnessStatus:
          record.followUpFitnessStatus,
      }
    );
    console.log(
      'Hasil verifikasi:',
      response.data
    );
    await fetchRecords();
    alert(
      'Hasil tindak lanjut berhasil disimpan.'
    );
  } catch (err) {
    console.error(
      'Gagal menyimpan hasil TL MCU:',
      err
    );
    alert(
      err.response?.data?.error ||
        'Gagal menyimpan hasil tindak lanjut MCU.'
    );
  } finally {
    setVerifyingId(null);
  }
};
const updateFollowUpField = (
  recordId,
  field,
  value
) => {
  setRecords((previousRecords) =>
    previousRecords.map((record) =>
      record._id === recordId
        ? {
            ...record,
            [field]: value,
          }
        : record
    )
  );
};
const handleAdminUpload = (
  recordId,
  file
) => {
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
      await API.put(
        `/mcu/admin/${recordId}/followup`,
        {
          followUpDocument: reader.result,
        }
      );
      await fetchRecords();
      alert(
        'Dokumen berhasil diupload dan menunggu verifikasi.'
      );
    } catch (err) {
      console.error(
        'Gagal upload bukti tindak lanjut:',
        err
      );
      alert(
        err.response?.data?.error ||
          'Gagal mengunggah dokumen.'
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

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(
        sortDir === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getSortValue = (record, key) => {
    if (key === 'date') {
      return new Date(record.date).getTime();
    }

    if (key === 'name') {
      return (
        record.user?.fullName ||
        record.user?.email ||
        ''
      ).toLowerCase();
    }

    return record[key] ?? '';
  };

  const filteredRecords = tableSearch.trim()
    ? records.filter((record) =>
        (record.user?.fullName || '')
          .toLowerCase()
          .includes(tableSearch.toLowerCase()) ||
        (record.user?.email || '')
          .toLowerCase()
          .includes(tableSearch.toLowerCase()) ||
        (record.user?.perwiraId || '')
          .toLowerCase()
          .includes(tableSearch.toLowerCase())
      )
    : records;

  const sortedRecords = [...filteredRecords].sort(
    (recordA, recordB) => {
      const valueA = getSortValue(
        recordA,
        sortKey
      );

      const valueB = getSortValue(
        recordB,
        sortKey
      );

      if (valueA < valueB) {
        return sortDir === 'asc' ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortDir === 'asc' ? 1 : -1;
      }

      return 0;
    }
  );

  const sortArrow = (key) => {
    if (sortKey !== key) {
      return '';
    }

    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

    const fitnessLabel = {
    laik: 'Laik Kerja',
    laik_dengan_catatan: 'Laik Kerja dengan Catatan',
    laik_dengan_restriksi: 'Laik Kerja dengan Restriksi',
    tidak_laik: 'Tidak Laik Kerja',
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

  const getFollowUpBadgeClass = (record) => {
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

  const fitnessBadgeClass = (value) => {
    return `fitness-badge fitness-badge-${
      value || 'none'
    }`;
  };

  return (
    <>
      <UserNavbar />

      <div className="container-wide">
        <h1>MCU Perwira</h1>

        <div className="dcu-date-picker">
          <div className="dcu-date-field">
            <label>Tanggal</label>

            <select
              value={day}
              onChange={(event) =>
                setDay(event.target.value)
              }
            >
              <option value="">Semua</option>

              {Array.from(
                { length: 31 },
                (_, index) => index + 1
              ).map((date) => (
                <option
                  key={date}
                  value={date}
                >
                  {date}
                </option>
              ))}
            </select>
          </div>

          <div className="dcu-date-field">
            <label>Bulan</label>

            <select
              value={month}
              onChange={(event) =>
                setMonth(event.target.value)
              }
            >
              <option value="">Semua</option>

              {Array.from(
                { length: 12 },
                (_, index) => index + 1
              ).map((monthValue) => (
                <option
                  key={monthValue}
                  value={monthValue}
                >
                  {monthValue}
                </option>
              ))}
            </select>
          </div>

          <div className="dcu-date-field">
            <label>Tahun</label>

            <select
              value={year}
              onChange={(event) =>
                setYear(event.target.value)
              }
            >
              <option value="">Semua</option>

              {Array.from(
                { length: 5 },
                (_, index) =>
                  today.getFullYear() - index
              ).map((yearValue) => (
                <option
                  key={yearValue}
                  value={yearValue}
                >
                  {yearValue}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn-add-dcu"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            + MCU
          </button>

          <input
            type="text"
            placeholder="Cari nama / Perwira ID..."
            value={tableSearch}
            onChange={(event) =>
              setTableSearch(event.target.value)
            }
            style={{
              padding: '10px 16px',
              borderRadius: 30,
              border: 'none',
              minWidth: 240,
            }}
          />
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="ticket-form"
            style={{
              marginTop: 16,
            }}
          >
            <div className="autocomplete-wrapper">
              <input
                placeholder="Perwira ID / Nama Lengkap"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedUser(null);
                  setShowSuggestions(true);
                }}
                onFocus={() =>
                  setShowSuggestions(true)
                }
                required
              />

              {showSuggestions &&
                filteredUsers.length > 0 && (
                  <div className="autocomplete-suggestions">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="autocomplete-item"
                        onClick={() =>
                          handlePickUser(user)
                        }
                      >
                        {user.perwiraId || '-'} —{' '}
                        {user.fullName ||
                          user.email}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {selectedUser && (
              <input
                value={
                  selectedUser.jobTitle || '-'
                }
                disabled
                placeholder="Jabatan"
              />
            )}

            <select
              name="examLocation"
              value={form.examLocation}
              onChange={handleChange}
              required
            >
              <option value="">
                Pilih Lokasi Pemeriksaan
              </option>
              <option value="Jakarta">
                Jakarta
              </option>
              <option value="Bali">
                Bali
              </option>
              <option value="Semarang">
                Semarang
              </option>
              <option value="Sorong">
                Sorong
              </option>
              <option value="Lainnya">
                Lainnya
              </option>
            </select>

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <select
              name="workStatus"
              value={form.workStatus}
              onChange={handleChange}
              required
            >
              <option value="">
                Pilih Status Pekerja
              </option>
              <option value="Direksi & Manajemen">
                Direksi & Manajemen
              </option>
              <option value="PWTT">
                PWTT
              </option>
              <option value="PWT">
                PWT
              </option>
              <option value="TKJP">
                TKJP
              </option>
              <option value="Tamu">
                Tamu
              </option>
            </select>

            <input
              name="diagnosis1"
              placeholder="Diagnosis 1"
              value={form.diagnosis1}
              onChange={handleChange}
            />

            <input
              name="diagnosis2"
              placeholder="Diagnosis 2"
              value={form.diagnosis2}
              onChange={handleChange}
            />

            <input
              name="diagnosis3"
              placeholder="Diagnosis 3"
              value={form.diagnosis3}
              onChange={handleChange}
            />

            <select
              name="healthDegree"
              value={form.healthDegree}
              onChange={handleChange}
              required
            >
              <option value="">
                Pilih Derajat Kesehatan
              </option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
              <option value="P5">P5</option>
              <option value="P6">P6</option>
              <option value="P7">P7</option>
            </select>

            <select
  name="fitnessStatus"
  value={form.fitnessStatus}
  onChange={handleChange}
  required
>
  <option value="">Pilih Keterangan</option>
  <option value="laik">Laik Kerja</option>
  <option value="laik_dengan_catatan">Laik Kerja dengan Catatan</option>
  <option value="laik_dengan_restriksi">Laik Kerja dengan Restriksi</option>
  <option value="tidak_laik">Tidak Laik Kerja</option>
</select>

            <textarea
              name="recommendation"
              placeholder="Catatan / Rekomendasi untuk pekerja"
              value={form.recommendation}
              onChange={handleChange}
            />

            <button type="submit">
              Simpan Data MCU
            </button>

            {saved && (
              <p className="success-message">
                Data MCU berhasil disimpan.
              </p>
            )}
          </form>
        )}

        {loading ? (
          <p className="empty-state">
            Memuat...
          </p>
        ) : sortedRecords.length === 0 ? (
          <p className="empty-state">
            Belum ada data MCU untuk periode ini.
          </p>
        ) : (
          <div
            className="lab-table-wrapper"
            style={{
              marginTop: 24,
            }}
          >
            <table className="lab-table">
              <thead>
                <tr>
                  <th
                    onClick={() =>
                      toggleSort('date')
                    }
                    className="sortable-th"
                  >
                    Tanggal
                    {sortArrow('date')}
                  </th>

                  <th
                    onClick={() =>
                      toggleSort('name')
                    }
                    className="sortable-th"
                  >
                    Nama
                    {sortArrow('name')}
                  </th>

                  <th>Lokasi</th>
                  <th>Status Pekerja</th>
                  <th>Diagnosis 1</th>
                  <th>Diagnosis 2</th>
                  <th>Diagnosis 3</th>
                  <th>Derajat Kesehatan</th>
                  <th>Keterangan</th>
                  <th>Tindak Lanjut</th>
                </tr>
              </thead>

              <tbody>
                {sortedRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      {new Date(
                        record.date
                      ).toLocaleDateString('id-ID')}
                    </td>

                    <td>
                      {record.user?.fullName ||
                        record.user?.email ||
                        '-'}
                    </td>

                    <td>
                      {record.examLocation || '-'}
                    </td>

                    <td>
                      {record.workStatus || '-'}
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
                      {record.healthDegree || '-'}
                    </td>

                    <td>
                      <span
                        className={fitnessBadgeClass(
                          record.fitnessStatus
                        )}
                      >
                        {fitnessLabel[
                          record.fitnessStatus
                        ] || '-'}
                      </span>
                    </td>

                    <td>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          alignItems: 'flex-start',
                          minWidth: 170,
                        }}
                      >
                        <span
                          className={getFollowUpBadgeClass(
                            record
                          )}
                        >
                          {getFollowUpLabel(record)}
                        </span>

                        {record.followUpDocument && (
                          <a
                            href={
                              record.followUpDocument
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 13,
                              color: '#8ecbff',
                            }}
                          >
                            Lihat Dokumen
                          </a>
                        )}

                        {record.followUpStatus !==
                          'terverifikasi' && (
                          <label
                            className="btn-edit-table"
                            style={{
                              cursor:
                                uploadingId ===
                                record._id
                                  ? 'wait'
                                  : 'pointer',
                              display: 'inline-block',
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
                              onChange={(event) => {
                                handleAdminUpload(
                                  record._id,
                                  event.target.files?.[0]
                                );

                                event.target.value =
                                  '';
                              }}
                              style={{
                                display: 'none',
                              }}
                              disabled={
                                uploadingId ===
                                record._id
                              }
                            />
                          </label>
                        )}

                        {record.followUpDocument && (
  <>
    <select
      value={
        record.followUpHealthDegree || ''
      }
      onChange={(event) =>
        updateFollowUpField(
          record._id,
          'followUpHealthDegree',
          event.target.value
        )
      }
      style={{
        width: '100%',
        padding: '7px',
        borderRadius: 6,
        border: '1px solid #d1d5db',
        fontSize: 12,
      }}
    >
      <option value="">
        Pilih Derajat Kesehatan
      </option>
      <option value="P1">P1</option>
      <option value="P2">P2</option>
      <option value="P3">P3</option>
      <option value="P4">P4</option>
      <option value="P5">P5</option>
      <option value="P6">P6</option>
      <option value="P7">P7</option>
    </select>
    <select
      value={
        record.followUpFitnessStatus || ''
      }
      onChange={(event) =>
        updateFollowUpField(
          record._id,
          'followUpFitnessStatus',
          event.target.value
        )
      }
      style={{
        width: '100%',
        padding: '7px',
        borderRadius: 6,
        border: '1px solid #d1d5db',
        fontSize: 12,
      }}
    >
      <option value="">Pilih Kelaikan Kerja</option>
      <option value="laik">Laik Kerja</option>
      <option value="laik_dengan_catatan">Laik dengan Catatan</option>
      <option value="laik_dengan_restriksi">Laik dengan Restriksi</option>
      <option value="tidak_laik">Tidak Laik Kerja</option>
    </select>
    <button
      type="button"
      onClick={() =>
        handleVerify(record)
      }
      disabled={
        verifyingId === record._id
      }
      className="btn-edit-table"
      style={{
        background: '#10b981',
        color: 'white',
        cursor:
          verifyingId === record._id
            ? 'wait'
            : 'pointer',
      }}
    >
      {verifyingId === record._id
        ? 'Menyimpan...'
        : record.followUpStatus ===
            'terverifikasi'
        ? 'Simpan Hasil TL'
        : 'Verifikasi'}
    </button>
  </>
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
    </>
  );
}