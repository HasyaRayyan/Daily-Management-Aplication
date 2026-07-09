import { formatRupiah, getCategoryInfo } from '../utils/helpers';

export default function Summary({ tasks, transactions, dateDisplay }) {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Get top expense categories
  const expenseByCategory = {};
  expenses.forEach(e => {
    if (!expenseByCategory[e.category]) {
      expenseByCategory[e.category] = 0;
    }
    expenseByCategory[e.category] += Number(e.amount);
  });
  const topExpenses = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="main-content">
      {/* Section Header */}
      <div className="section-header">
        <h2>
          <span className="section-icon">📊</span>
          Ringkasan
        </h2>
      </div>

      {/* Summary Grid */}
      <div className="summary-grid">
        {/* Balance Card */}
        <div className="summary-card balance-card full-width">
          <div className="card-icon">💎</div>
          <div className="card-label">Saldo Hari Ini</div>
          <div className="card-value">
            {balance >= 0 ? '+' : '-'}{formatRupiah(balance)}
          </div>
        </div>

        {/* Income Card */}
        <div className="summary-card income-card">
          <div className="card-icon">💰</div>
          <div className="card-label">Pemasukan</div>
          <div className="card-value">+{formatRupiah(totalIncome)}</div>
        </div>

        {/* Expense Card */}
        <div className="summary-card expense-card">
          <div className="card-icon">💸</div>
          <div className="card-label">Pengeluaran</div>
          <div className="card-value">-{formatRupiah(totalExpense)}</div>
        </div>

        {/* Task Card */}
        <div className="summary-card task-card full-width">
          <div className="card-icon">📋</div>
          <div className="card-label">Tugas Selesai</div>
          <div className="card-value">
            {completedTasks} / {totalTasks} tugas
          </div>
          {totalTasks > 0 && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Breakdown */}
      {topExpenses.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
            <h2 style={{ fontSize: 'var(--text-base)' }}>
              <span className="section-icon">📈</span>
              Pengeluaran per Kategori
            </h2>
          </div>
          <div className="transaction-list">
            {topExpenses.map(([catId, total], index) => {
              const catInfo = getCategoryInfo(catId);
              const percent = totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0;
              return (
                <div key={catId} className="transaction-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="transaction-icon expense">
                    {catInfo.icon}
                  </div>
                  <div className="transaction-content">
                    <p className="transaction-desc">{catInfo.label}</p>
                    <span className="transaction-category">{percent}% dari total</span>
                    <div style={{ marginTop: '6px' }}>
                      <div className="progress-bar" style={{ height: '4px' }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percent}%`,
                            background: 'var(--gradient-expense)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="transaction-amount expense">
                    {formatRupiah(total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Income Breakdown */}
      {incomes.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
            <h2 style={{ fontSize: 'var(--text-base)' }}>
              <span className="section-icon">💎</span>
              Detail Pemasukan
            </h2>
          </div>
          <div className="transaction-list">
            {incomes.map((t, index) => {
              const catInfo = getCategoryInfo(t.category);
              return (
                <div key={t.id} className="transaction-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="transaction-icon income">
                    {catInfo.icon}
                  </div>
                  <div className="transaction-content">
                    <p className="transaction-desc">{t.description}</p>
                    <span className="transaction-category">{catInfo.label} • {t.time}</span>
                  </div>
                  <span className="transaction-amount income">
                    +{formatRupiah(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalTasks === 0 && transactions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-text">Belum ada data</p>
          <p className="empty-subtext">Tambahkan tugas atau transaksi untuk melihat ringkasan</p>
        </div>
      )}
    </div>
  );
}
