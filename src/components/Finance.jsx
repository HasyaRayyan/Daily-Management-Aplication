import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Header from './Header';
import { formatRupiah, getDateKey } from '../utils/helpers';
import { getTransactionsByMonth, addTransaction, deleteTransaction, uploadFile, getCustomCategories } from '../utils/storage';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Html5Qrcode } from 'html5-qrcode';
import { parseQris } from '../utils/qrisParser';

const EXPENSE_CATEGORIES = {
  makanan: 'Makanan',
  transportasi: 'Transport',
  tagihan: 'Tagihan',
  belanja: 'Belanja',
  hiburan: 'Hiburan',
  kesehatan: 'Kesehatan',
  lainnya: 'Lainnya'
};

const INCOME_CATEGORIES = {
  gaji: 'Gaji',
  bonus: 'Bonus',
  investasi: 'Investasi',
  hadiah: 'Hadiah',
  lainnya: 'Lainnya'
};

const CATEGORY_COLORS = {
  makanan: '#171717', // neutral-900
  transportasi: '#262626', // neutral-800
  tagihan: '#404040', // neutral-700
  belanja: '#525252', // neutral-600
  hiburan: '#737373', // neutral-500
  kesehatan: '#a3a3a3', // neutral-400
  gaji: '#171717',
  bonus: '#404040',
  investasi: '#737373',
  hadiah: '#a3a3a3',
  lainnya: '#d4d4d4' // neutral-300
};

const stringToColor = (str) => {
  if (!str) return '#9ca3af';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate a shade of gray
  const val = Math.abs(hash) % 150 + 50; // value between 50 and 200
  const hex = val.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
};

export default function Finance({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' or 'income'
  
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null); 
  const [showPaymentLinks, setShowPaymentLinks] = useState(false);
  const [isFromQris, setIsFromQris] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null); 
  const [locationStatus, setLocationStatus] = useState(''); 
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [dbCategories, setDbCategories] = useState([]);

  const fileInputRef = useRef(null);

  const getMonthPrefix = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchData = async () => {
    setLoading(true);
    const monthPrefix = getMonthPrefix(selectedMonth);
    const [data, cats] = await Promise.all([
      getTransactionsByMonth(monthPrefix),
      getCustomCategories()
    ]);
    setTransactions(data);
    setDbCategories(cats);
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

  const getCategoryName = (catId, type) => {
    const defaults = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return defaults[catId] || catId;
  };

  const getCategoryColor = (catId) => {
    if (CATEGORY_COLORS[catId]) return CATEGORY_COLORS[catId];
    return stringToColor(catId);
  };

  // Ekstrak custom category milik user yang bukan bawaan (gabungan dari DB dan transaksi lama)
  const userCategories = Array.from(new Set([
    ...dbCategories.filter(c => c.type === activeTab).map(c => c.name),
    ...currentList.map(t => t.category)
  ])).filter(c => {
    const defaults = activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return !defaults[c] && c !== 'lainnya';
  });

  // Category Pie Data
  const pieData = currentList.reduce((acc, curr) => {
    const cat = curr.category || 'lainnya';
    const existing = acc.find(item => item.id === cat);
    if (existing) existing.value += Number(curr.amount);
    else {
      acc.push({ id: cat, name: getCategoryName(cat, activeTab), value: Number(curr.amount) });
    }
    return acc;
  }, []).sort((a,b) => b.value - a.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    
    if (!numAmount || !title.trim() || !category || saving) return;
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
      category: category,
      title: title.trim(),
      description: description.trim(),
      amount: numAmount,
      photo_url,
      latitude: location?.lat || null,
      longitude: location?.lng || null,
      date_key: todayDateKey
    });

    const wasQris = isFromQris;
    resetForm();

    if (wasQris) {
      setShowPaymentLinks(true);
    }

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
    setLocation(null);
    setLocationStatus('');
    setIsFromQris(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowModal(false);
  };

  const handleScanSuccess = (qrisString) => {
    const data = parseQris(qrisString);
    if (data && (data.merchantName || data.isValid)) {
      setTitle(data.merchantName || 'Pembayaran QRIS');
      if (data.amount) {
        setAmount(data.amount.toString());
      }
      if (!category) setCategory('lainnya');
      
      setActiveTab('expense');
      setIsFromQris(true);
      setShowModal(true);
    } else {
      alert("Format QRIS tidak didukung atau teks gagal dibaca.");
    }
  };

  const handleNativeQrisScan = async () => {
    try {
      // Buka kamera sistem asli
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], "qris_temp.jpg", { type: "image/jpeg" });

      // Scan dari file foto
      const html5QrCode = new Html5Qrcode("hidden-qr-reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      
      // Jika sukses memecahkan QR
      handleScanSuccess(decodedText);
      
    } catch (err) {
      if (err.message && !err.message.includes('User cancelled') && !err.message.includes('canceled')) {
         alert("Tidak ada QR Code yang ditemukan di gambar, atau format tidak jelas.");
      }
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  const handleNativePhotoPicker = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt // Meminta pengguna memilih Kamera atau Galeri
      });

      // Convert DataURL to File object for Supabase upload
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `photo_${Date.now()}.${image.format}`, { type: `image/${image.format}` });
      setPhoto(file);
    } catch (err) {
      console.error("Gagal mengambil foto:", err);
      if (err.message && !err.message.includes('User cancelled') && !err.message.includes('canceled')) {
        alert("Gagal mengakses galeri/kamera: " + err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Yakin hapus transaksi ini?')) return;
    setShowDetailModal(null);
    await deleteTransaction(id);
    await fetchData();
  };

  const openAddModal = (type) => {
    setActiveTab(type);
    setCategory('');
    setShowModal(true);
    
    const fetchLocation = async () => {
      try {
        setLocationStatus('Sedang melacak lokasi Anda...');
        
        // Capacitor akan otomatis meminta izin jika belum ada saat memanggil getCurrentPosition
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus('Lokasi berhasil dilacak!');
      } catch (err) {
        console.warn('Capacitor Geolocation error:', err);
        
        // Fallback ke browser API standar
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setLocationStatus('Lokasi berhasil dilacak (Standar)!');
            },
            (navErr) => {
              setLocationStatus(`Gagal melacak lokasi. Bisa diabaikan.`);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          setLocationStatus(`Gagal melacak lokasi. Bisa diabaikan.`);
        }
      }
    };
    
    fetchLocation();
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 md:pb-8 animate-fade-in relative min-h-full">
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
            <span className="font-extrabold text-brand-900 dark:text-brand-300">+{formatRupiah(totalIncome)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 flex items-center gap-1 justify-end">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              PENGELUARAN
            </span>
            <span className="font-extrabold text-brand-900 dark:text-brand-300">-{formatRupiah(totalExpense)}</span>
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
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.id)} />
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
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: getCategoryColor(entry.id)}}></div>
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
                  {groupedTransactions[dateKey].map((t) => {
                    const catName = getCategoryName(t.category, activeTab);
                    const isDefault = activeTab === 'expense' ? EXPENSE_CATEGORIES[t.category] : INCOME_CATEGORIES[t.category];
                    const iconChar = catName.charAt(0).toUpperCase();

                    return (
                      <div 
                        key={t.id} 
                        onClick={() => setShowDetailModal(t)}
                        className="flex items-center justify-between p-4 bg-white dark:bg-brand-900 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-800 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                      >
                        
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-3 text-white" style={{ backgroundColor: getCategoryColor(t.category) }}>
                          <span className="text-xl">
                            {iconChar}
                          </span>
                        </div>

                        <div className="flex-1 overflow-hidden pr-2">
                          <p className="font-bold text-base truncate leading-tight mb-1">{t.title}</p>
                          <p className="text-xs font-semibold text-brand-500 truncate">
                            {catName}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`font-extrabold text-right ${activeTab === 'expense' ? 'text-brand-900 dark:text-white' : 'text-brand-900 dark:text-white'}`}>
                            {activeTab === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
                          </span>
                          {(t.latitude && t.longitude) && <span className="text-[10px] bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Lokasi</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-5 md:bottom-10 md:right-10 flex flex-col gap-4 z-[150] items-end">
        
        {/* QRIS FAB */}
        <button 
          onClick={handleNativeQrisScan} 
          className="w-12 h-12 bg-white dark:bg-brand-900 text-brand-900 dark:text-white rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all border border-brand-200 dark:border-brand-700"
          title="Scan QRIS via Kamera"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
        </button>

        {/* Main Add FAB */}
        <button 
          onClick={() => openAddModal(activeTab)} 
          className="w-16 h-16 bg-brand-200 dark:bg-brand-800 text-brand-900 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-2 border-brand-100 dark:border-brand-900"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={resetForm} title={activeTab === 'expense' ? 'Tambah Pengeluaran' : 'Tambah Pemasukan'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          
          <div className="flex flex-col gap-2 bg-brand-50 dark:bg-brand-900/40 p-4 sm:p-6 rounded-2xl border border-brand-100 dark:border-brand-800 transition-colors">
            <label className="text-xs font-bold text-brand-500 tracking-widest text-center">TOTAL (Rp)</label>
            <input type="text" inputMode="numeric" className="w-full bg-transparent text-3xl sm:text-4xl font-black py-2 text-center text-brand-950 dark:text-white border-none focus:outline-none focus:ring-0" placeholder="0" value={amount} onChange={handleAmountChange} required />
            {amount && <p className="text-xs font-bold text-center text-brand-400 mt-1">{formatRupiah(parseFloat(amount))}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="flex flex-col gap-2">
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
                
                {userCategories.length > 0 && <optgroup label="Kategori Saya (Kelola di Profil)" />}
                {userCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA TRANSAKSI</label>
              <input type="text" className="input-field" placeholder={activeTab === 'expense' ? "Cth: Makan Siang Hokben" : "Cth: Uang Jajan Bulanan"} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">KETERANGAN (Opsional)</label>
            <input type="text" className="input-field" placeholder="Catatan tambahan..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-200 dark:border-brand-800 pt-4 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider flex justify-between">
                <span>BUKTI FOTO (Opsional)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </label>
              
              {Capacitor.isNativePlatform() ? (
                <button 
                  type="button" 
                  onClick={handleNativePhotoPicker}
                  className="flex items-center justify-center w-full h-[38px] bg-brand-100 dark:bg-brand-800 text-brand-900 dark:text-brand-100 rounded-full text-xs font-bold hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors"
                >
                  {photo ? "✓ Foto Dipilih (Ketuk untuk ganti)" : "+ Pilih Kamera / Galeri"}
                </button>
              ) : (
                <input type="file" accept="image/*" capture="environment" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-100 file:text-brand-900 hover:file:bg-brand-200 cursor-pointer dark:file:bg-brand-800 dark:file:text-white dark:hover:file:bg-brand-700 w-full" ref={fileInputRef} onChange={(e) => setPhoto(e.target.files[0])} />
              )}
            </div>

            <div className="flex flex-col justify-end">
              <div className="text-xs font-semibold text-brand-500 bg-brand-50 dark:bg-brand-900/50 p-3 rounded-xl flex items-center justify-center gap-2 h-[38px]">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                 <span className="truncate">{locationStatus}</span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-2" disabled={!amount || !title.trim() || !category || saving}>
            {saving ? 'Menyimpan...' : (isFromQris ? 'Simpan & Bayar Sekarang' : 'Simpan Transaksi')}
          </button>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!showDetailModal} onClose={() => setShowDetailModal(null)} title="Detail Transaksi">
        {showDetailModal && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <span className="text-5xl mb-2 inline-block">
                {((showDetailModal.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[showDetailModal.category] || showDetailModal.category).charAt(0).toUpperCase()}
              </span>
              <h2 className="text-2xl font-black">{showDetailModal.title}</h2>
              <p className="text-sm font-bold text-brand-500 mt-1">{getCategoryName(showDetailModal.category, showDetailModal.type)}</p>
            </div>
            
            <div className="bg-brand-50 dark:bg-brand-900 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-brand-200 dark:border-brand-800 pb-3">
                <span className="text-xs font-bold text-brand-500 tracking-widest uppercase">Total</span>
                <span className={`text-lg font-extrabold ${showDetailModal.type === 'expense' ? 'text-brand-900 dark:text-white' : 'text-brand-900 dark:text-white'}`}>
                  {showDetailModal.type === 'expense' ? '-' : '+'}{formatRupiah(showDetailModal.amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b border-brand-200 dark:border-brand-800 pb-3">
                <span className="text-xs font-bold text-brand-500 tracking-widest uppercase">Tanggal</span>
                <span className="text-sm font-bold">{new Date(showDetailModal.date_key).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              {showDetailModal.description && (
                <div className="flex flex-col gap-1 border-b border-brand-200 dark:border-brand-800 pb-3">
                  <span className="text-xs font-bold text-brand-500 tracking-widest uppercase">Keterangan</span>
                  <span className="text-sm font-medium">{showDetailModal.description}</span>
                </div>
              )}

              {showDetailModal.latitude && showDetailModal.longitude && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-brand-500 tracking-widest uppercase">Lokasi Tercatat</span>
                  <a 
                    href={`https://www.google.com/maps?q=${showDetailModal.latitude},${showDetailModal.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold p-3 rounded-xl hover:bg-blue-100 transition-colors text-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    Buka di Google Maps
                  </a>
                </div>
              )}
            </div>

            {showDetailModal.photo_url && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-brand-500 tracking-widest uppercase">Bukti Foto</span>
                <img src={showDetailModal.photo_url} alt="Bukti" className="w-full max-h-40 rounded-2xl object-cover border border-brand-100 dark:border-brand-800 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setShowPhotoModal(showDetailModal.photo_url)} />
              </div>
            )}

            <button 
              onClick={() => handleDelete(showDetailModal.id)} 
              className="mt-4 flex items-center justify-center gap-2 text-red-500 font-bold p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Hapus Transaksi
            </button>
          </div>
        )}
      </Modal>

      {/* Photo View Modal */}
      <Modal isOpen={!!showPhotoModal} onClose={() => setShowPhotoModal(null)} title="Bukti Foto (Layar Penuh)">
        {showPhotoModal && (
          <img src={showPhotoModal} alt="Bukti Full" className="w-full rounded-xl object-contain max-h-[60vh] bg-brand-50 dark:bg-brand-900" />
        )}
      </Modal>

      {/* Payment Link Modal */}
      <Modal isOpen={showPaymentLinks} onClose={() => setShowPaymentLinks(false)} title="Bayar via Aplikasi">
        <div className="flex flex-col gap-6 text-center">
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
            Transaksi berhasil dicatat. Silakan selesaikan pembayaran aslinya melalui M-Banking atau E-Wallet Anda!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a href="gojek://" className="flex flex-col items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-2xl hover:bg-green-100 transition-colors border border-green-200 dark:border-green-800">
              <span className="font-extrabold text-lg">GoPay</span>
            </a>
            <a href="ovo://" className="flex flex-col items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 p-4 rounded-2xl hover:bg-purple-100 transition-colors border border-purple-200 dark:border-purple-800">
              <span className="font-extrabold text-lg">OVO</span>
            </a>
            <a href="dana://" className="flex flex-col items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-4 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800">
              <span className="font-extrabold text-lg">DANA</span>
            </a>
            <a href="bcamobile://" className="flex flex-col items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800">
              <span className="font-extrabold text-lg">BCA</span>
            </a>
          </div>
          <button onClick={() => setShowPaymentLinks(false)} className="mt-2 text-sm font-bold text-brand-500 hover:text-brand-700">Tutup</button>
        </div>
      </Modal>

      {/* Hidden Div for html5-qrcode file scanning requirement */}
      <div id="hidden-qr-reader" style={{ display: 'none' }}></div>
    </div>
  );
}
