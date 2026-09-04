import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Header from './Header';
import { formatRupiah, getDateKey } from '../utils/helpers';
import { getTransactionsByDateRange, getTransactionsByMonth, addTransaction, deleteTransaction, updateTransaction, uploadFile, getCustomCategories } from '../utils/storage';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Html5Qrcode } from 'html5-qrcode';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { parseQris } from '../utils/qrisParser';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const EXPENSE_CATEGORIES = {};

const INCOME_CATEGORIES = {};

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
  const [filterType, setFilterType] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'custom'
  const [customStartDate, setCustomStartDate] = useState(getDateKey(new Date()));
  const [customEndDate, setCustomEndDate] = useState(getDateKey(new Date()));

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null); 
  const [locationStatus, setLocationStatus] = useState(''); 
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [dbCategories, setDbCategories] = useState([]);

  const fileInputRef = useRef(null);

  const getMonthPrefix = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchData = async () => {
    setLoading(true);
    let data;
    if (filterType === 'daily') {
      const dateKey = getDateKey(selectedMonth);
      data = await getTransactionsByDateRange(dateKey, dateKey);
    } else if (filterType === 'weekly') {
      const date = new Date(selectedMonth);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(date.setDate(diff));
      const endOfWeek = new Date(date.setDate(startOfWeek.getDate() + 6));
      data = await getTransactionsByDateRange(getDateKey(startOfWeek), getDateKey(endOfWeek));
    } else if (filterType === 'custom') {
      data = await getTransactionsByDateRange(customStartDate, customEndDate);
    } else {
      const monthPrefix = getMonthPrefix(selectedMonth);
      data = await getTransactionsByMonth(monthPrefix);
    }
    
    const cats = await getCustomCategories();
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
  }, [selectedMonth, filterType, customStartDate, customEndDate]);

  const changeDate = (offset) => {
    const newDate = new Date(selectedMonth);
    if (filterType === 'daily') {
      newDate.setDate(newDate.getDate() + offset);
    } else if (filterType === 'weekly') {
      newDate.setDate(newDate.getDate() + (offset * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + offset);
    }
    setSelectedMonth(newDate);
  };

  const getDateLabel = () => {
    if (filterType === 'daily') {
      return selectedMonth.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (filterType === 'weekly') {
      const date = new Date(selectedMonth);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(date.setDate(diff));
      const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));
      const startStr = startOfWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const endStr = endOfWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } else {
      return selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }
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
    const numAmount = parseFloat(amount.toString().replace(/[^0-9]/g, ''));
    
    if (!numAmount || !title.trim() || !category || saving) return;
    setSaving(true);
    
    let photo_url = editingId && typeof photo === 'string' ? photo : null; 
    
    if (photo && typeof photo !== 'string') {
      const ext = photo.name.split('.').pop();
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      photo_url = await uploadFile('uploads', `finance/${filename}`, photo);
    }

    const todayDateKey = getDateKey(new Date());
    
    const payload = {
      type: activeTab,
      category: category,
      title: title.trim(),
      description: description.trim(),
      amount: numAmount,
      photo_url,
      latitude: location?.lat || null,
      longitude: location?.lng || null
    };

    if (editingId) {
      await updateTransaction(editingId, payload);
    } else {
      payload.date_key = todayDateKey;
      await addTransaction(payload);
    }

    const wasQris = isFromQris;
    resetForm();

    if (wasQris) {
      setShowPaymentLinks(true);
    }

    if (!editingId && getMonthPrefix(new Date()) !== getMonthPrefix(selectedMonth)) {
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
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowModal(false);
  };

  const openEditModal = (t) => {
    setTitle(t.title);
    setAmount(t.amount.toString());
    setDescription(t.description || '');
    setCategory(t.category);
    setPhoto(t.photo_url || null);
    if (t.latitude && t.longitude) {
      setLocation({ lat: t.latitude, lng: t.longitude });
      setLocationStatus('Lokasi Tersimpan');
    } else {
      setLocation(null);
      setLocationStatus('');
    }
    setEditingId(t.id);
    setActiveTab(t.type);
    setShowDetailModal(null);
    setShowModal(true);
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
      // Menggunakan Google ML Kit Native Scanner (Langsung buka kamera scanner tanpa potret!)
      if (Capacitor.isNativePlatform()) {
        const { barcodes } = await BarcodeScanner.scan({
          formats: ['QR_CODE']
        });
        
        if (barcodes && barcodes.length > 0) {
          handleScanSuccess(barcodes[0].rawValue || barcodes[0].displayValue);
        }
      } else {
        // Fallback untuk Web Browser (Laptop)
        alert("Fitur Scan Langsung hanya tersedia di Aplikasi Android (APK). Di web, Anda harus memilih foto QRIS.");
        
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt
        });

        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], "qris_temp.jpg", { type: "image/jpeg" });
        const html5QrCode = new Html5Qrcode("hidden-qr-reader");
        const decodedText = await html5QrCode.scanFile(file, true);
        handleScanSuccess(decodedText);
      }
    } catch (err) {
      if (err.message && (err.message.toLowerCase().includes('cancel') || err.message.toLowerCase().includes('user'))) {
        return; // Abaikan jika user menutup layar scan
      }
      alert(`Peringatan Scanner: ${err.message || err}`);
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
      if (err.message && (err.message.includes('User cancelled') || err.message.includes('canceled'))) {
        return;
      }
      alert(`Peringatan Kamera (Bukti Foto): ${err.message || err}`);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Yakin hapus transaksi ini?')) return;
    setShowDetailModal(null);
    await deleteTransaction(id);
    await fetchData();
  };

  const openAddModal = (type) => {
    resetForm();
    setActiveTab(type);
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

  // Map variables
  const mapTransactions = currentList.filter(t => t.latitude && t.longitude);

  const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
      html: `<div style="background-color: #10B981; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
               ${cluster.getChildCount()}
             </div>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(40, 40, true),
    });
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 md:pb-8 animate-fade-in relative min-h-full">
      <Header title="Finance" onBack={onBack} />
      
      {/* Date Filter & Picker */}
      <div className="flex flex-col gap-2 -mt-4">
        {/* Filter Type Selector */}
        <div className="flex p-1 bg-brand-50 dark:bg-brand-900/50 rounded-xl">
          <button onClick={() => setFilterType('daily')} className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${filterType === 'daily' ? 'bg-white dark:bg-brand-800 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500'}`}>Harian</button>
          <button onClick={() => setFilterType('weekly')} className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${filterType === 'weekly' ? 'bg-white dark:bg-brand-800 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500'}`}>Mingguan</button>
          <button onClick={() => setFilterType('monthly')} className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${filterType === 'monthly' ? 'bg-white dark:bg-brand-800 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500'}`}>Bulanan</button>
          <button onClick={() => setFilterType('custom')} className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${filterType === 'custom' ? 'bg-white dark:bg-brand-800 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500'}`}>Rentang</button>
        </div>

        {/* Date Navigator / Custom Range */}
        {filterType === 'custom' ? (
          <div className="flex justify-between items-center bg-brand-50 dark:bg-brand-950 p-2 rounded-2xl border border-brand-100 dark:border-brand-800 gap-2">
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="flex-1 bg-transparent text-xs font-bold text-brand-900 dark:text-white border-none focus:outline-none focus:ring-0 text-center"
            />
            <span className="text-brand-500 font-bold">-</span>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="flex-1 bg-transparent text-xs font-bold text-brand-900 dark:text-white border-none focus:outline-none focus:ring-0 text-center"
            />
          </div>
        ) : (
          <div className="flex justify-between items-center bg-brand-50 dark:bg-brand-950 p-2 rounded-2xl border border-brand-100 dark:border-brand-800">
            <button onClick={() => changeDate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors text-brand-900 dark:text-white font-bold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <span className="font-extrabold text-sm md:text-base tracking-wide uppercase text-brand-900 dark:text-white text-center flex-1">
              {getDateLabel()}
            </span>
            <button onClick={() => changeDate(1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors text-brand-900 dark:text-white font-bold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Premium Balance Card */}
      <div className="bg-gradient-to-br from-brand-900 to-black dark:from-brand-100 dark:to-white text-white dark:text-brand-950 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_rgba(255,255,255,0.1)] relative overflow-hidden transition-transform hover:scale-[1.01] duration-500 mt-2">
        {/* Glass Reflection Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-black/5 rounded-full -mr-20 -mt-20 blur-3xl mix-blend-overlay pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 dark:bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl mix-blend-overlay pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] opacity-70 mb-1 flex justify-between items-center">
              <span>SISA SALDO {filterType === 'daily' ? 'HARI' : filterType === 'weekly' ? 'MINGGU' : filterType === 'custom' ? 'RENTANG' : 'BULAN'} INI</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50"><path d="M2 12h20M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0"/></svg>
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter drop-shadow-sm">{formatRupiah(balance)}</h2>
          </div>
          
          <div className="flex justify-between items-end gap-4 border-t border-white/20 dark:border-black/10 pt-4 mt-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60 mb-1 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                PEMASUKAN
              </span>
              <span className="font-extrabold text-sm sm:text-base opacity-90 tracking-wide">+{formatRupiah(totalIncome)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60 mb-1 flex items-center gap-1 justify-end">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                PENGELUARAN
              </span>
              <span className="font-extrabold text-sm sm:text-base opacity-90 tracking-wide">-{formatRupiah(totalExpense)}</span>
            </div>
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
        <div className="bg-gradient-to-b from-brand-50/80 to-transparent dark:from-brand-900/30 dark:to-transparent border border-brand-100 dark:border-brand-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200/50 dark:bg-brand-700/20 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
          <h3 className="font-extrabold text-xs text-brand-500 mb-6 tracking-[0.2em] uppercase text-center relative z-10">Sebaran {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</h3>
          
          <div className="w-full h-[220px] relative z-10">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} stroke="none" dataKey="value" paddingAngle={5} cornerRadius={8}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.id)} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => formatRupiah(value)}
                  contentStyle={{ backgroundColor: isDarkMode ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid ' + (isDarkMode ? '#3f3f46' : '#e4e4e7'), borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label (Total) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
              <span className="text-[10px] font-bold text-brand-400 tracking-widest uppercase">Total</span>
              <span className="text-sm font-black mt-0.5">{formatRupiah(activeTab === 'expense' ? totalExpense : totalIncome, true)}</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mt-6 relative z-10">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 bg-white dark:bg-brand-950 px-3 py-1.5 rounded-full border border-brand-100 dark:border-brand-800 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: getCategoryColor(entry.id)}}></div>
                <span className="text-[11px] font-bold truncate max-w-[85px]">{entry.name}</span>
                <span className="text-[10px] font-black opacity-50 bg-brand-50 dark:bg-brand-900 px-1.5 py-0.5 rounded-md">{Math.round((entry.value / (activeTab === 'expense' ? totalExpense : totalIncome)) * 100)}%</span>
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
            <p className="font-bold text-brand-500 text-sm">Tidak ada catatan untuk periode ini.</p>
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
                        className="group flex items-center justify-between p-4 sm:p-5 bg-white/60 dark:bg-brand-900/40 backdrop-blur-md rounded-[1.5rem] shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-brand-200/50 dark:border-brand-800/50 cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_rgba(255,255,255,0.02)] hover:scale-[1.01] transition-all duration-300"
                      >
                        
                        {/* Premium Icon Wrapper */}
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mr-4 text-white shadow-inner" style={{ background: `linear-gradient(135deg, ${getCategoryColor(t.category)}, #000000)` }}>
                          <span className="text-lg font-black drop-shadow-md">
                            {iconChar}
                          </span>
                        </div>

                        <div className="flex-1 overflow-hidden pr-3">
                          <p className="font-bold text-[15px] sm:text-base truncate leading-tight mb-1 text-brand-950 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">{t.title}</p>
                          <p className="text-[11px] font-semibold tracking-wider text-brand-500 uppercase">
                            {catName}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`font-black text-[15px] sm:text-base text-right tracking-tight ${activeTab === 'expense' ? 'text-brand-950 dark:text-white' : 'text-brand-950 dark:text-white'}`}>
                            {activeTab === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
                          </span>
                          {(t.latitude && t.longitude) && <span className="text-[9px] bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-full font-black uppercase tracking-[0.1em] flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> GPS</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Peta Transaksi */}
        <div className="w-full flex flex-col gap-3 mt-6 mb-4">
          <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1 px-2">Peta {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'} {filterType === 'daily' ? 'Hari Ini' : filterType === 'weekly' ? 'Minggu Ini' : filterType === 'custom' ? 'Terpilih' : 'Bulan Ini'}</h4>
          <div className="w-full h-72 bg-brand-100 dark:bg-brand-900 rounded-2xl overflow-hidden shadow-sm border border-brand-200 dark:border-brand-800 z-10 relative">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center font-bold text-brand-500 animate-pulse">Memuat Peta...</div>
            ) : mapTransactions.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center font-bold text-brand-500 text-sm text-center px-4">Belum ada transaksi dengan lokasi di periode ini</div>
            ) : (
              <MapContainer center={[mapTransactions[0].latitude, mapTransactions[0].longitude]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
                />
                <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
                  {mapTransactions.map((t) => {
                    const photoUrl = t.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.title)}&background=10B981&color=fff&size=128&bold=true`;
                    const customIcon = L.divIcon({
                      className: 'custom-photo-marker',
                      html: `<div style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); background-color: #eee;">
                               <img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
                             </div>`,
                      iconSize: [48, 48],
                      iconAnchor: [24, 48],
                      popupAnchor: [0, -48]
                    });

                    return (
                      <Marker key={t.id} position={[t.latitude, t.longitude]} icon={customIcon}>
                        <Popup>
                          <div className="flex flex-col gap-1 items-center min-w-[100px]">
                            <span className="font-bold text-xs text-center">{t.title}</span>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MarkerClusterGroup>
              </MapContainer>
            )}
          </div>
        </div>

      </div>

      {/* Floating Action Buttons Premium */}
      <div className="fixed bottom-28 md:bottom-12 right-6 md:right-12 flex flex-col gap-4 z-[150] items-end pointer-events-none">
        
        {/* QRIS FAB */}
        <button 
          onClick={handleNativeQrisScan} 
          className="w-12 h-12 bg-white/90 dark:bg-brand-800/90 backdrop-blur-md text-brand-950 dark:text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-110 active:scale-95 transition-all border border-brand-200/50 dark:border-brand-700/50 pointer-events-auto"
          title="Scan QRIS via Kamera"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
        </button>

        {/* Main Add FAB */}
        <button 
          onClick={() => openAddModal(activeTab)} 
          className="w-[68px] h-[68px] bg-brand-950 dark:bg-white text-white dark:text-brand-950 rounded-full flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.25)] dark:shadow-[0_12px_24px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all border-4 border-brand-50 dark:border-brand-950 pointer-events-auto"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={resetForm} title={editingId ? (activeTab === 'expense' ? 'Edit Pengeluaran' : 'Edit Pemasukan') : (activeTab === 'expense' ? 'Tambah Pengeluaran' : 'Tambah Pemasukan')}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          
          <div className="flex flex-col gap-2 bg-brand-50 dark:bg-brand-900/40 p-4 sm:p-6 rounded-2xl border border-brand-100 dark:border-brand-800 transition-colors">
            <label className="text-xs font-bold text-brand-500 tracking-widest text-center">TOTAL (Rp)</label>
            <input type="text" inputMode="numeric" className="w-full bg-transparent text-3xl sm:text-4xl font-black py-2 text-center text-brand-950 dark:text-white border-none focus:outline-none focus:ring-0" placeholder="0" value={amount} onChange={handleAmountChange} required />
            {amount && <p className="text-xs font-bold text-center text-brand-400 mt-1">{formatRupiah(parseFloat(amount.toString().replace(/[^0-9]/g, '')) || 0)}</p>}
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
                {userCategories.length === 0 && (
                  <option value="" disabled>-- Kategori kosong, tambah di Profil --</option>
                )}
                {userCategories.length > 0 && <optgroup label="Kategori Anda" />}
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
                  {photo ? (typeof photo === 'string' ? "✓ Foto Tersimpan (Ketuk ganti)" : "✓ Foto Dipilih (Ketuk ganti)") : "+ Pilih Kamera / Galeri"}
                </button>
              ) : (
                <input type="file" accept="image/*" capture="environment" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-100 file:text-brand-900 hover:file:bg-brand-200 cursor-pointer dark:file:bg-brand-800 dark:file:text-white dark:hover:file:bg-brand-700 w-full" ref={fileInputRef} onChange={(e) => setPhoto(e.target.files[0])} />
              )}
              {photo && (
                <div className="mt-2 flex justify-center">
                  <img 
                    src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-xl border-2 border-brand-200 dark:border-brand-700 shadow-sm"
                  />
                </div>
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
            {saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : (isFromQris ? 'Simpan & Bayar Sekarang' : 'Simpan Transaksi'))}
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

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button 
                onClick={() => openEditModal(showDetailModal)} 
                className="flex-1 flex items-center justify-center gap-2 bg-brand-50 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold p-3 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors text-sm border border-brand-200 dark:border-brand-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                Edit Transaksi
              </button>
              
              <button 
                onClick={() => handleDelete(showDetailModal.id)} 
                className="flex-1 flex items-center justify-center gap-2 text-red-500 font-bold p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Hapus Transaksi
              </button>
            </div>
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
