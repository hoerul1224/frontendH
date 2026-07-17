import { useState, useEffect } from 'react';
import './App.css';
import API from './api';

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const fetchProducts = async () => {
    const res = await API.get('/products');
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await API.put(`/products/${editId}`, form);
      setEditId(null);
    } else {
      await API.post('/products', form);
    }
    setForm({ name: '', price: '', stock: '' });
    fetchProducts();
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, price: product.price, stock: product.stock });
    setEditId(product._id);
  };

  const handleDelete = async (id) => {
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="container">
      <h1>Daftar Produk</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <input name="name" placeholder="Nama produk" value={form.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Harga" value={form.price} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stok" value={form.stock} onChange={handleChange} required />
        <button type="submit">{editId ? 'Update' : 'Tambah'}</button>
      </form>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="default">Urutkan</option>
          <option value="price-asc">Harga Terendah</option>
          <option value="price-desc">Harga Tertinggi</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="empty-state">Produk tidak ditemukan.</p>
      ) : (
        <ul className="product-list">
          {filteredProducts.map((p) => (
            <li key={p._id} className="product-card">
              <div className="product-info">
                <h3>{p.name}</h3>
                <p>Rp{Number(p.price).toLocaleString('id-ID')} - Stok: {p.stock}</p>
                </div>
              <div className="product-actions">
                <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(p._id)}>Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;