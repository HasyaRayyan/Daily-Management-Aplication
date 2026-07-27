import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { formatRupiah, getDateKey } from '../utils/helpers';
import { getTransactions, addTransaction, deleteTransaction, uploadFile } from '../utils/storage';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense');
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const todayDateKey = getDateKey(new Date());

  const fetchData = async () => {
    setLoading(true);
    const data = await getTransactions(todayDateKey);
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
  const currentList = activeTab === 'expense' ? expenses : incomes;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numAmount || !title.trim() || saving) return;

    setSaving(true);
    
    let photo_url = null;
    if (photo) {
      const ext = photo.name.split('.').pop();
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      photo_url = await uploadFile('uploads', `finance/${filename}`, photo);
    }

    await addTransaction({
      type: activeTab,
      title: title.trim(),
      description: description.trim(),
      amount: numAmount,
      photo_url,
      date_key: todayDateKey
    });

    resetForm();
    await fetchData();
    setSaving(false);
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDescription('');
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowModal(false);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Yakin hapus transaksi ini?')) return;
    await deleteTransaction(id);
    await fetchData();
  };

  // Chart Data Prep
  const pieData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.title);
    if (existing) {
      existing.value += Number(curr.amount);
    } else {
      acc.push({ name: curr.title, value: Number(curr.amount) });
    }
    return acc;
  }, []).sort((a,b) => b.value - a.value).slice(0, 5);

  const barData = [
    { name: 'Pemasukan', amount: totalIncome, fill: '#10b981' },
    { name: 'Pengeluaran', amount: totalExpense, fill: '#ef4444' }
  ];

  return (
    <div className="main-content">
      <div className="section-header">
        <h2>
          <span className="section-icon">💰</span>
          Keuangan
        </h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <span className="plus-icon">+</span> Tambah
        </button>
      </div>

      {/* Charts Section */}
      <div className="summary-grid" style={{ marginBottom: '20px', gridTemplateColumns: '1fr' }}>
        <div className="summary-card full-width">
          <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Pemasukan vs Pengeluaran</h3>
          <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <RechartsTooltip formatter={(value) => formatRupiah(value)} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {pieData.length > 0 && (
          <div className="summary-card full-width">
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Pengeluaran Terbesar</h3>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatRupiah(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="finance-tabs">
        <button className={`finance-tab expense-tab ${activeTab === 'expense' ? 'active' : ''}`} onClick={() => setActiveTab('expense')}>💸 Pengeluaran</button>
        <button className={`finance-tab income-tab ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>💰 Pemasukan</button>
      </div>

      {loading ? (
        <p>Memuat...</p>
      ) : currentList.length === 0 ? (
        <div className="empty-state">
          <p className="empty-text">Belum ada {activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}</p>
        </div>
      ) : (
        <div className="transaction-list">
          {currentList.map((t, index) => (
            <div key={t.id} className="transaction-item" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="transaction-content">
                <p className="transaction-desc">{t.title}</p>
                <span className="transaction-category">{t.description || '-'}</span>
                {t.photo_url && (
                  <button className="auth-link" style={{fontSize: '10px', marginTop: '4px'}} onClick={() => setShowPhotoModal(t.photo_url)}>
                    📷 Lihat Bukti
                  </button>
                )}
              </div>
              <span className={`transaction-amount ${t.type}`}>
                {t.type === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
              </span>
              <button className="transaction-delete" onClick={() => handleDelete(t.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal isOpen={showModal} onClose={resetForm} title={activeTab === 'expense' ? '💸 Tambah Pengeluaran' : '💰 Tambah Pemasukan'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</label>
            <input type="text" className="form-input" placeholder="Contoh: Makan Siang" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan (Opsional)</label>
            <input type="text" className="form-input" placeholder={activeTab === 'expense' ? 'Ke: Warteg' : 'Dari: Gaji part-time'} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Total (Rp)</label>
            <input type="text" inputMode="numeric" className="form-input" value={amount} onChange={handleAmountChange} required />
            {amount && <p style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>{formatRupiah(parseFloat(amount))}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Bukti Foto (Opsional)</label>
            <input type="file" accept="image/*" className="form-input" ref={fileInputRef} onChange={(e) => setPhoto(e.target.files[0])} style={{padding: '8px'}} />
          </div>
          <button type="submit" className="btn-primary" disabled={!amount || !title.trim() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>

      {/* Photo View Modal */}
      <Modal isOpen={!!showPhotoModal} onClose={() => setShowPhotoModal(null)} title="📷 Bukti Foto">
        {showPhotoModal && (
          <img src={showPhotoModal} alt="Bukti" style={{width: '100%', borderRadius: '8px', objectFit: 'contain', maxHeight: '60vh'}} />
        )}
      </Modal>
    </div>
  );
}
