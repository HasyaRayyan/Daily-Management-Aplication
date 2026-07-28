import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Header from './Header';
import { formatRupiah, getDateKey } from '../utils/helpers';
import { getTransactionsByMonth, addTransaction, deleteTransaction, uploadFile } from '../utils/storage';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const EXPENSE_CATEGORIES = {
  makanan: '🍔 Makanan',
  transportasi: '🚗 Transport',
  tagihan: '🧾 Tagihan',
  belanja: '🛍️ Belanja',
  hiburan: '🎮 Hiburan',
  kesehatan: '⚕️ Kesehatan',
  lainnya: '📦 Lainnya'
};

const INCOME_CATEGORIES = {
  gaji: '💼 Gaji',
  bonus: '💰 Bonus',
  investasi: '📈 Investasi',
  hadiah: '🎁 Hadiah',
  lainnya: '📦 Lainnya'
};

const CATEGORY_COLORS = {
  makanan: '#f87171',
  transportasi: '#60a5fa',
  tagihan: '#fbbf24',
  belanja: '#a78bfa',
  hiburan: '#f472b6',
  kesehatan: '#34d399',
  gaji: '#34d399',
  bonus: '#fbbf24',
  investasi: '#818cf8',
  hadiah: '#f472b6',
  lainnya: '#9ca3af'
};

export default function Finance({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' or 'income'
  
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fileInputRef = useRef(null);

  const getMonthPrefix = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchData = async () => {
    setLoading(true);
    const monthPrefix = getMonthPrefix(selectedMonth);
    const data = await getTransactionsByMonth(monthPrefix);
    setTransactions(data);
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [selectedMonth]);

  const changeMonth = (offset) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedMonth(newDate);
  };

  // Calculations
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
  const currentList = activeTab === 'expense' ? expenses : incomes;
  const balance = totalIncome - totalExpense;

  // Group by Date for List
  const groupedTransactions = currentList.reduce((acc, curr) => {
    if (!acc[curr.date_key]) acc[curr.date_key] = [];
    acc[curr.date_key].push(curr);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  // Category Pie Data
  const pieData = currentList.reduce((acc, curr) => {
    const cat = curr.category || 'lainnya';
    const existing = acc.find(item => item.id === cat);
    if (existing) existing.value += Number(curr.amount);
    else {
      const catList = activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      acc.push({ id: cat, name: catList[cat] || catList['lainnya'], value: Number(curr.amount) });
    }
    return acc;
  }, []).sort((a,b) => b.value - a.value);

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

    const todayDateKey = getDateKey(new Date());

    await addTransaction({
      type: activeTab,
      category: category || 'lainnya',
      title: title.trim(),
      description: description.trim(),
      amount: numAmount,
      photo_url,
      date_key: todayDateKey
    });

    resetForm();
    // If we are not in current month, maybe change to current month to see the new entry
    if (getMonthPrefix(new Date()) !== getMonthPrefix(selectedMonth)) {
      setSelectedMonth(new Date());
    } else {
      await fetchData();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDescription('');
    setCategory('');
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

  const openAddModal = (type) => {
    setActiveTab(type);
    setCategory('lainnya');
    setShowModal(true);
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 animate-fade-in relative min-h-full">
      <Header title="Finance" onBack={onBack} />
      
      {/* Month Picker */}
      <div className="flex justify-between items-center -mt-4 bg-brand-50 dark:bg-brand-950 p-2 rounded-2xl border border-brand-100 dark:border-brand-800">
        <button onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors text-brand-900 dark:text-white font-bold">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="font-extrabold text-base tracking-wide uppercase text-brand-900 dark:text-white">
          {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors text-brand-900 dark:text-white font-bold">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Balance Card */}
      <div className="card bg-brand-950 text-white dark:bg-white dark:text-brand-950 border-none shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-black/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <p className="text-xs font-bold tracking-widest opacity-80 mb-1">SISA SALDO BULAN INI</p>
        <h2 className="text-4xl font-black mb-6 tracking-tight">{formatRupiah(balance)}</h2>
        
        <div className="flex justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              PEMASUKAN
            </span>
            <span className="font-extrabold text-green-400 dark:text-green-600">+{formatRupiah(totalIncome)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 flex items-center gap-1 justify-end">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              PENGELUARAN
            </span>
            <span className="font-extrabold text-red-400 dark:text-red-600">-{formatRupiah(totalExpense)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-brand-100 dark:bg-brand-900 rounded-xl mt-2">
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'expense' ? 'bg-white dark:bg-brand-950 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500 hover:text-brand-700 dark:hover:text-brand-300'}`}
          onClick={() => setActiveTab('expense')}
        >
          Pengeluaran
        </button>
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'income' ? 'bg-white dark:bg-brand-950 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500 hover:text-brand-700 dark:hover:text-brand-300'}`}
          onClick={() => setActiveTab('income')}
        >
          Pemasukan
        </button>
      </div>

      {/* Donut Chart */}
      {pieData.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-2 tracking-wide uppercase">Sebaran {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</h3>
          <div className="w-full h-[180px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} stroke="none" dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.id] || CATEGORY_COLORS.lainnya} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => formatRupiah(value)}
                  contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs font-semibold">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: CATEGORY_COLORS[entry.id] || CATEGORY_COLORS.lainnya}}></div>
                <span className="truncate max-w-[90px]">{entry.name}</span>
                <span className="font-bold opacity-60 ml-1">{Math.round((entry.value / (activeTab === 'expense' ? totalExpense : totalIncome)) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction List by Date */}
      <div className="flex flex-col gap-6 mt-2">
        {loading ? (
          <div className="text-center font-bold animate-pulse text-brand-500 py-6">Memuat transaksi...</div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-10 bg-brand-50 dark:bg-brand-950 rounded-2xl border border-dashed border-brand-200 dark:border-brand-800">
            <p className="font-bold text-brand-500 text-sm">Tidak ada catatan untuk bulan ini.</p>
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const displayDate = dateKey === getDateKey(new Date()) ? 'Hari Ini' : new Date(dateKey).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            
            return (
              <div key={dateKey} className="flex flex-col gap-3">
                <h4 className="font-extrabold text-sm tracking-wide text-brand-400 pl-1 uppercase">{displayDate}</h4>
                <div className="flex flex-col gap-3">
                  {groupedTransactions[dateKey].map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-brand-900 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-800">
                      
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-3 bg-brand-50 dark:bg-brand-950">
                        <span className="text-2xl">
                          {((activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[t.category || 'lainnya'] || '📦').charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 overflow-hidden pr-2">
                        <p className="font-bold text-base truncate leading-tight mb-1">{t.title}</p>
                        <p className="text-xs font-semibold text-brand-500 truncate">
                          {(activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[t.category || 'lainnya']}
                          {t.description && ` • ${t.description}`}
                        </p>
                        {t.photo_url && (
                          <button onClick={() => setShowPhotoModal(t.photo_url)} className="text-[10px] font-bold uppercase tracking-wider mt-2 bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 px-2 py-1 rounded hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors">
                            📷 Lihat Bukti
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`font-extrabold text-right ${activeTab === 'expense' ? 'text-brand-900 dark:text-white' : 'text-brand-900 dark:text-white'}`}>
                          {activeTab === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
                        </span>
                        <button onClick={() => handleDelete(t.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-brand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-xs">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) for Finance */}
      <button 
        onClick={() => openAddModal(activeTab)} 
        className="fixed bottom-24 right-5 md:bottom-10 md:right-10 w-16 h-16 bg-brand-200 dark:bg-brand-800 text-brand-900 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-[150] border-2 border-brand-100 dark:border-brand-900"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={resetForm} title={activeTab === 'expense' ? 'Tambah Pengeluaran' : 'Tambah Pemasukan'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">TOTAL (Rp)</label>
            <input type="text" inputMode="numeric" className="input-field text-2xl font-black py-4 text-center" placeholder="0" value={amount} onChange={handleAmountChange} required />
            {amount && <p className="text-xs font-bold text-center text-brand-900 dark:text-white mt-1">{formatRupiah(parseFloat(amount))}</p>}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">KATEGORI</label>
            <select 
              className="input-field appearance-none cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Pilih Kategori...</option>
              {Object.entries(activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA TRANSAKSI</label>
            <input type="text" className="input-field" placeholder={activeTab === 'expense' ? "Contoh: Makan Siang Hokben" : "Contoh: Uang Jajan Bulanan"} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">KETERANGAN (Opsional)</label>
            <input type="text" className="input-field" placeholder="Catatan tambahan..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2 border-t border-brand-200 dark:border-brand-800 pt-4 mt-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider flex justify-between">
              <span>BUKTI FOTO / STRUK (Opsional)</span>
              <span>📸</span>
            </label>
            {/* The capture="environment" enables direct back-camera access on mobile */}
            <input type="file" accept="image/*" capture="environment" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-100 file:text-brand-900 hover:file:bg-brand-200 cursor-pointer dark:file:bg-brand-800 dark:file:text-white dark:hover:file:bg-brand-700" ref={fileInputRef} onChange={(e) => setPhoto(e.target.files[0])} />
          </div>

          <button type="submit" className="btn-primary mt-4" disabled={!amount || !title.trim() || !category || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </Modal>

      {/* Photo View Modal */}
      <Modal isOpen={!!showPhotoModal} onClose={() => setShowPhotoModal(null)} title="Bukti Foto">
        {showPhotoModal && (
          <img src={showPhotoModal} alt="Bukti" className="w-full rounded-xl object-contain max-h-[60vh] bg-brand-50 dark:bg-brand-900" />
        )}
      </Modal>
    </div>
  );
}
