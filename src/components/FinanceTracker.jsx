import { useState } from 'react';
import Modal from './Modal';
import {
  generateId,
  formatRupiah,
  getCurrentTime,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryInfo,
} from '../utils/helpers';
import { addTransaction, deleteTransaction } from '../utils/storage';

export default function FinanceTracker({ transactions, dateKey, onRefresh }) {
  const [activeTab, setActiveTab] = useState('expense');
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);

  const currentList = activeTab === 'expense' ? expenses : incomes;
  const categories = activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numAmount || !description.trim() || !category || saving) return;

    setSaving(true);
    const newTransaction = {
      id: generateId(),
      date_key: dateKey,
      type: activeTab,
      amount: numAmount,
      description: description.trim(),
      category,
      time: getCurrentTime(),
      created_at: Date.now(),
    };

    const result = await addTransaction(newTransaction);
    if (result) {
      resetForm();
      await onRefresh();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    await onRefresh();
  };

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  const openAddModal = () => {
    setCategory('');
    setAmount('');
    setDescription('');
    setShowModal(true);
  };

  return (
    <div className="main-content">
      {/* Section Header */}
      <div className="section-header">
        <h2>
          <span className="section-icon">💰</span>
          Keuangan
        </h2>
        <button className="btn-add" onClick={openAddModal}>
          <span className="plus-icon">+</span>
          Tambah
        </button>
      </div>

      {/* Finance Tabs */}
      <div className="finance-tabs">
        <button
          className={`finance-tab expense-tab ${activeTab === 'expense' ? 'active' : ''}`}
          onClick={() => setActiveTab('expense')}
        >
          💸 Pengeluaran
        </button>
        <button
          className={`finance-tab income-tab ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          💰 Pemasukan
        </button>
      </div>

      {/* Transaction List */}
      {currentList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            {activeTab === 'expense' ? '💸' : '💰'}
          </div>
          <p className="empty-text">
            Belum ada {activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}
          </p>
          <p className="empty-subtext">
            Catat {activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'} harianmu
          </p>
        </div>
      ) : (
        <>
          <div className="transaction-list">
            {[...currentList]
              .sort((a, b) => b.created_at - a.created_at)
              .map((transaction, index) => {
                const catInfo = getCategoryInfo(transaction.category);
                return (
                  <div
                    key={transaction.id}
                    className="transaction-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`transaction-icon ${transaction.type}`}>
                      {catInfo.icon}
                    </div>
                    <div className="transaction-content">
                      <p className="transaction-desc">{transaction.description}</p>
                      <span className="transaction-category">
                        {catInfo.label} • {transaction.time}
                      </span>
                    </div>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatRupiah(transaction.amount)}
                    </span>
                    <button
                      className="transaction-delete"
                      onClick={() => handleDelete(transaction.id)}
                      aria-label="Hapus transaksi"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Total Bar */}
          <div className="total-bar">
            <span className="total-label">
              Total {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </span>
            <span className={`total-value ${activeTab}`}>
              {activeTab === 'expense' ? '-' : '+'}
              {formatRupiah(activeTab === 'expense' ? totalExpense : totalIncome)}
            </span>
          </div>
        </>
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={activeTab === 'expense' ? '💸 Tambah Pengeluaran' : '💰 Tambah Pemasukan'}
      >
        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Jumlah (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              className="form-input"
              placeholder="Contoh: 50000"
              value={amount}
              onChange={handleAmountChange}
              autoFocus
            />
            {amount && (
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--accent-light)',
                marginTop: 'var(--space-1)',
                fontWeight: 600,
              }}>
                {formatRupiah(parseFloat(amount) || 0)}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              {activeTab === 'expense' ? 'Digunakan untuk apa?' : 'Dari mana?'}
            </label>
            <textarea
              className="form-input"
              placeholder={
                activeTab === 'expense'
                  ? 'Contoh: Makan siang nasi goreng...'
                  : 'Contoh: Gaji bulan Juli...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${category === cat.id ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={!amount || !description.trim() || !category || saving}
          >
            {saving ? 'Menyimpan...' : (activeTab === 'expense' ? 'Catat Pengeluaran' : 'Catat Pemasukan')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={resetForm}
          >
            Batal
          </button>
        </form>
      </Modal>
    </div>
  );
}
