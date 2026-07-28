import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function BodyComposition() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/body-composition');
        setRecords(res.data);
      } catch (err) {
        console.error('Gagal ambil data body composition:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = records.map((r) => ({
    date: new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    weight: r.weight,
    bmi: r.bmi,
    bodyFatPercent: r.bodyFatPercent,
    muscleMass: r.muscleMass,
    visceralFat: r.visceralFat,
    bodyWaterPercent: r.bodyWaterPercent,
  }));

  const latest = records[records.length - 1];

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Body Composition</h1>
        <p className="user-subgreeting">Riwayat komposisi tubuhmu</p>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : records.length === 0 ? (
          <p className="empty-state">Belum ada data body composition.</p>
        ) : (
          <>
            <div className="bc-summary-grid">
              <div className="bc-summary-card">
                <span className="stat-number">{latest.weight ?? '-'}</span>
                <span className="stat-label">Berat Badan (kg)</span>
              </div>
              <div className="bc-summary-card">
                <span className="stat-number">{latest.bmi ?? '-'}</span>
                <span className="stat-label">BMI</span>
              </div>
              <div className="bc-summary-card">
                <span className="stat-number">{latest.bodyFatPercent ?? '-'}</span>
                <span className="stat-label">Body Fat (%)</span>
              </div>
              <div className="bc-summary-card">
                <span className="stat-number">{latest.muscleMass ?? '-'}</span>
                <span className="stat-label">Massa Otot (kg)</span>
              </div>
              <div className="bc-summary-card">
                <span className="stat-number">{latest.visceralFat ?? '-'}</span>
                <span className="stat-label">Visceral Fat</span>
              </div>
              <div className="bc-summary-card">
                <span className="stat-number">{latest.bodyWaterPercent ?? '-'}</span>
                <span className="stat-label">Air Tubuh (%)</span>
              </div>
            </div>

            <div className="dcu-charts-grid">
              <div className="dcu-chart-card">
                <h3>Berat Badan &amp; BMI</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#cfe0ff" />
                    <YAxis stroke="#cfe0ff" />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#2dd4bf" strokeWidth={2} />
                    <Line type="monotone" dataKey="bmi" stroke="#5aa9e6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="dcu-chart-card">
                <h3>Body Fat &amp; Massa Otot</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#cfe0ff" />
                    <YAxis stroke="#cfe0ff" />
                    <Tooltip />
                    <Line type="monotone" dataKey="bodyFatPercent" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="muscleMass" stroke="#2dd4bf" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="dcu-chart-card">
                <h3>Visceral Fat</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#cfe0ff" />
                    <YAxis stroke="#cfe0ff" />
                    <Tooltip />
                    <Line type="monotone" dataKey="visceralFat" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="dcu-chart-card">
                <h3>Air Tubuh (%)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#cfe0ff" />
                    <YAxis stroke="#cfe0ff" />
                    <Tooltip />
                    <Line type="monotone" dataKey="bodyWaterPercent" stroke="#5aa9e6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}