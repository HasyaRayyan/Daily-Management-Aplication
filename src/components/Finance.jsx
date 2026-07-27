import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { formatRupiah, getDateKey } from '../utils/helpers';
import { getTransactions, addTransaction, deleteTransaction, uploadFile } from '../utils/storage';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' or 'income'
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(null);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fileInputRef = useRef(null);
  const todayDateKey = getDateKey(new Date());

  const fetchData = async () => {
    setLoading(true);
    const data = await getTransactions(todayDateKey);
    setTransactions(data);
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Listen for dark mode changes for charts
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
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

  // Dark/Light aware colors
  const CHART_COLORS = isDarkMode 
    ? ['#ffffff', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'] 
    : ['#000000', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8'];
  
  const textColor = isDarkMode ? '#a1a1aa' : '#71717a';

  const pieData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.title);
    if (existing) existing.value += Number(curr.amount);
    else acc.push({ name: curr.title, value: Number(curr.amount) });
    return acc;
  }, []).sort((a,b) => b.value - a.value).slice(0, 5);

  const barData = [
    { name: 'Pemasukan', amount: totalIncome },
    { name: 'Pengeluaran', amount: totalExpense }
  ];

  return (
    <div className="flex flex-col gap-6 px-5 pt-2 pb-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
          <span>💰</span> Keuangan
        </h2>
        <button onClick={() => setShowModal(true)} className="bg-brand-950 dark:bg-white text-white dark:text-brand-950 font-bold px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-transform text-sm">
          + Tambah
        </button>
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-4">
        <div className="card">
          <h3 className="font-bold text-sm mb-4 tracking-wide">PEMASUKAN VS PENGELUARAN</h3>
          <div className="w-full h-[150px]">
            <ResponsiveContainer>
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 12, fill: textColor, fontWeight: 600}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  formatter={(value) => formatRupiah(value)} 
                  contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }} 
                  cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={24}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#52525b' : '#a1a1aa')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {pieData.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-sm mb-4 tracking-wide">PENGELUARAN TERBESAR</h3>
            <div className="w-full h-[200px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none" dataKey="value" label={({name, percent}) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''} labelLine={false}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatRupiah(value)}
                    contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs font-semibold">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: CHART_COLORS[index % CHART_COLORS.length]}}></div>
                  <span className="truncate max-w-[80px]">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-brand-100 dark:bg-brand-900 rounded-xl mt-2">
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'expense' ? 'bg-white dark:bg-brand-950 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500 hover:text-brand-700 dark:hover:text-brand-300'}`}
          onClick={() => setActiveTab('expense')}
        >
          💸 Pengeluaran
        </button>
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'income' ? 'bg-white dark:bg-brand-950 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500 hover:text-brand-700 dark:hover:text-brand-300'}`}
          onClick={() => setActiveTab('income')}
        >
          💰 Pemasukan
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center font-bold animate-pulse text-brand-500 py-6">Memuat transaksi...</div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2 grayscale opacity-50">{activeTab === 'expense' ? '💸' : '💰'}</div>
            <p className="font-bold text-brand-500 text-sm">Belum ada {activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}</p>
          </div>
        ) : (
          currentList.map((t, index) => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-brand-900 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-800 animate-slide-up" style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
              <div className="flex-1 overflow-hidden pr-2">
                <p className="font-bold text-base truncate leading-tight mb-1">{t.title}</p>
                {t.description && <p className="text-xs font-semibold text-brand-500 truncate">{t.description}</p>}
                {t.photo_url && (
                  <button onClick={() => setShowPhotoModal(t.photo_url)} className="text-[10px] font-bold uppercase tracking-wider mt-2 bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 px-2 py-1 rounded hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors">
                    📷 Lihat Bukti
                  </button>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`font-extrabold text-right ${activeTab === 'expense' ? 'text-brand-900 dark:text-white' : 'text-brand-900 dark:text-white'}`}>
                  {activeTab === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
                </span>
                <button onClick={() => handleDelete(t.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-brand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-xs">
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={resetForm} title={activeTab === 'expense' ? '💸 Tambah Pengeluaran' : '💰 Tambah Pemasukan'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA TRANSAKSI</label>
            <input type="text" className="input-field" placeholder={activeTab === 'expense' ? "Contoh: Makan Siang" : "Contoh: Uang Jajan"} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">KETERANGAN (Opsional)</label>
            <input type="text" className="input-field" placeholder={activeTab === 'expense' ? 'Ke: Warteg' : 'Dari: Orang Tua'} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">TOTAL (Rp)</label>
            <input type="text" inputMode="numeric" className="input-field text-xl font-bold" placeholder="0" value={amount} onChange={handleAmountChange} required />
            {amount && <p className="text-xs font-bold text-brand-900 dark:text-white mt-1">{formatRupiah(parseFloat(amount))}</p>}
          </div>
          <div className="flex flex-col gap-2 border-t border-brand-200 dark:border-brand-800 pt-4 mt-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider flex justify-between">
              <span>BUKTI FOTO (Opsional)</span>
              <span>📷</span>
            </label>
            <input type="file" accept="image/*" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-100 file:text-brand-900 hover:file:bg-brand-200 cursor-pointer dark:file:bg-brand-800 dark:file:text-white dark:hover:file:bg-brand-700" ref={fileInputRef} onChange={(e) => setPhoto(e.target.files[0])} />
          </div>
          <button type="submit" className="btn-primary mt-4" disabled={!amount || !title.trim() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </Modal>

      {/* Photo View Modal */}
      <Modal isOpen={!!showPhotoModal} onClose={() => setShowPhotoModal(null)} title="📷 Bukti Foto">
        {showPhotoModal && (
          <img src={showPhotoModal} alt="Bukti" className="w-full rounded-xl object-contain max-h-[60vh] bg-brand-50 dark:bg-brand-900" />
        )}
      </Modal>
    </div>
  );
}
