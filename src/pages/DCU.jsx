import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function DCU() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await API.get('/dcu', { params: { month, year } });
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  const chartData = records.map((r) => ({
    day: new Date(r.date).getDate(),
    systolic: r.systolic,
    diastolic: r.diastolic,
    heartRate: r.heartRate,
    temperature: r.temperature,
    oxygenSaturation: r.oxygenSaturation,
  }));

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Berikut Daily Check Up mu</h1>

        <div className="dcu-date-picker">
          <div className="dcu-date-field">
            <label>Bulan</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="dcu-date-field">
            <label>Tahun</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : chartData.length === 0 ? (
          <p className="empty-state">Belum ada data DCU untuk periode ini.</p>
        ) : (
          <div className="dcu-charts-grid">
            <div className="dcu-chart-card">
              <h3>Sistolik / Diastolik</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#cfe0ff" />
                  <YAxis stroke="#cfe0ff" />
                  <Tooltip />
                  <Line type="monotone" dataKey="systolic" stroke="#2dd4bf" strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolic" stroke="#5aa9e6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="dcu-chart-card">
              <h3>Detak Jantung</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#cfe0ff" />
                  <YAxis stroke="#cfe0ff" />
                  <Tooltip />
                  <Line type="monotone" dataKey="heartRate" stroke="#2dd4bf" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="dcu-chart-card">
              <h3>Temperatur Tubuh</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#cfe0ff" />
                  <YAxis stroke="#cfe0ff" />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#2dd4bf" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="dcu-chart-card">
              <h3>Saturasi Oksigen</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#cfe0ff" />
                  <YAxis stroke="#cfe0ff" />
                  <Tooltip />
                  <Line type="monotone" dataKey="oxygenSaturation" stroke="#2dd4bf" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}