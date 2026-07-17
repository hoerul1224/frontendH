import { useState, useEffect } from 'react';
import API from './api';

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [editId, setEditId] = useState(null);

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
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Daftar Produk</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input name="name" placeholder="Nama produk" value={form.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Harga" value={form.price} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stok" value={form.stock} onChange={handleChange} required />
        <button type="submit">{editId ? 'Update' : 'Tambah'}</button>
      </form>

      <ul>
        {products.map((p) => (
          <li key={p._id} style={{ marginBottom: 8 }}>
            {p.name} - Rp{p.price} (stok: {p.stock})
            <button onClick={() => handleEdit(p)} style={{ marginLeft: 8 }}>Edit</button>
            <button onClick={() => handleDelete(p._id)} style={{ marginLeft: 4 }}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;