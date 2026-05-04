'use client'

import { useState, useEffect, useCallback } from 'react';

type Manager = {
  code: string;
  name: string;
  telegramTag: string;
  active: boolean;
};

type Referral = {
  rowIndex: number;
  id: string;
  managerCode: string;
  nome: string;
  telefone: string;
  email: string;
  horario: string;
  diaContato: string;
  data: string;
  linkCliente: string;
  managerName: string;
  status: string;
  statusUpdated: string;
  notes: string;
};

const STATUSES = [
  'Não Contactado',
  'Em Contato',
  'Aguardando',
  'Em Negociação',
  'Top-Up de Carteira',
  'Pago',
  'Não Pago',
  'N/A',
];

const STATUS_COLORS: Record<string, string> = {
  'Não Contactado': '#6b7280',
  'Em Contato':     '#3b82f6',
  'Aguardando':     '#f59e0b',
  'Em Negociação':  '#a855f7',
  'Top-Up de Carteira': '#06b6d4',
  'Pago':           '#22c55e',
  'Não Pago':       '#ef4444',
  'N/A':            '#4b5563',
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#6b7280';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      background: `${color}22`, color, border: `1px solid ${color}44`,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function ReferralRow({ ref_, onStatusChange }: { ref_: Referral; onStatusChange: (rowIndex: number, status: string, notes: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [status,   setStatus]   = useState(ref_.status || 'Não Contactado');
  const [notes,    setNotes]    = useState(ref_.notes || '');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  async function save() {
    setSaving(true);
    await onStatusChange(ref_.rowIndex, status, notes);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const changed = status !== ref_.status || notes !== ref_.notes;
  const mgrShort = ref_.managerName.replace(/^ISM\s+/i, '').split(' ')[0];

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, marginBottom: 6, overflow: 'hidden' }}>
      <div onClick={() => setExpanded(e => !e)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer', background: expanded ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ref_.nome || '—'}</div>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.4)', marginTop: 1 }}>
            {mgrShort} · {ref_.data}
          </div>
        </div>
        <StatusBadge status={status} />
        <span style={{ fontSize: 10, color: 'rgba(232,237,245,0.3)', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 14, marginBottom: 14 }}>
            {[
              ['Telefone',  ref_.telefone],
              ['Email',     ref_.email],
              ['Horário',   `${ref_.horario} · ${ref_.diaContato}`],
              ['Manager',   ref_.managerName],
              ['ID',        ref_.id],
              ['Atualizado', ref_.statusUpdated || '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.35)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.7)', fontFamily: 'monospace' }}>{val || '—'}</div>
              </div>
            ))}
          </div>

          {ref_.linkCliente && (
            <a href={ref_.linkCliente} target="_blank" rel="noreferrer" style={{
              display: 'inline-block', marginBottom: 14, fontSize: 11, color: 'var(--accent)',
              textDecoration: 'none', padding: '5px 10px', borderRadius: 6,
              background: 'rgba(0,255,178,0.06)', border: '1px solid rgba(0,255,178,0.15)',
            }}>
              🔗 Abrir no BO / AmoCRM
            </a>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(232,237,245,0.4)', display: 'block', marginBottom: 5 }}>STATUS</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 12, outline: 'none' }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(232,237,245,0.4)', display: 'block', marginBottom: 5 }}>NOTAS</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observações..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {changed && (
            <button
              onClick={save}
              disabled={saving}
              style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: saved ? 'rgba(34,197,94,0.15)' : 'rgba(0,255,178,0.1)', color: saved ? '#22c55e' : 'var(--accent)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              {saving ? 'Salvando...' : saved ? '✓ Salvo' : 'Salvar'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── main ────────────────────────────────────────────────────────────────────────
export default function DirectionIndicacoesPage() {
  const [managers,    setManagers]    = useState<Manager[]>([]);
  const [referrals,   setReferrals]   = useState<Referral[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [filterSt,    setFilterSt]    = useState('');
  const [filterMgr,   setFilterMgr]   = useState('');
  const [activeTab,   setActiveTab]   = useState<'referrals' | 'managers'>('referrals');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mgRes, refRes] = await Promise.all([
        fetch('/api/indicacoes?action=managers'),
        fetch('/api/indicacoes?action=referrals'),
      ]);
      const mgData  = await mgRes.json();
      const refData = await refRes.json();
      if (!mgData.success)  throw new Error(mgData.error);
      if (!refData.success) throw new Error(refData.error);
      setManagers(mgData.managers || []);
      setReferrals(refData.referrals || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleStatusChange(rowIndex: number, status: string, notes: string) {
    await fetch('/api/indicacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateStatus', rowIndex, status, notes }),
    });
    setReferrals(prev => prev.map(r => r.rowIndex === rowIndex ? { ...r, status, notes } : r));
  }

  const filtered = referrals.filter(r => {
    const matchSearch = !search || [r.nome, r.telefone, r.email, r.managerName].some(f =>
      f.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = !filterSt  || r.status === filterSt;
    const matchMgr    = !filterMgr || r.managerCode === filterMgr;
    return matchSearch && matchStatus && matchMgr;
  });

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = referrals.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  // Manager table with referral counts
  const mgrWithCounts = managers.map(m => ({
    ...m,
    total: referrals.filter(r => r.managerCode === m.code).length,
    pago:  referrals.filter(r => r.managerCode === m.code && r.status === 'Pago').length,
  }));

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>🔗 Indicações — Visão Geral</div>
        <div style={{ fontSize: 13, color: 'rgba(232,237,245,0.5)' }}>
          {referrals.length} indicações · {managers.filter(m => m.active).length} managers ativos
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['referrals', 'managers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px', borderRadius: 8,
              background: activeTab === tab ? 'var(--accent-dim)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab ? 'var(--accent)' : 'rgba(232,237,245,0.5)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${activeTab === tab ? 'rgba(0,255,178,0.2)' : 'transparent'}`,
            }}
          >
            {tab === 'referrals' ? '📋 Referrals' : '👥 Managers'}
          </button>
        ))}
        <button
          onClick={fetchAll}
          style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(232,237,245,0.5)', fontSize: 12, cursor: 'pointer' }}
        >
          ↻ Atualizar
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(232,237,245,0.4)', fontSize: 13 }}>Carregando...</div>
      ) : activeTab === 'referrals' ? (
        <>
          {/* Status filter chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {Object.entries(statusCounts).filter(([,c]) => c > 0).map(([st, count]) => (
              <button
                key={st}
                onClick={() => setFilterSt(filterSt === st ? '' : st)}
                style={{
                  padding: '4px 11px', borderRadius: 99,
                  border: `1px solid ${filterSt === st ? STATUS_COLORS[st] : 'rgba(255,255,255,0.08)'}`,
                  background: filterSt === st ? `${STATUS_COLORS[st]}18` : 'transparent',
                  color: filterSt === st ? STATUS_COLORS[st] : 'rgba(232,237,245,0.5)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {st} · {count}
              </button>
            ))}
          </div>

          {/* Manager filter */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <select
              value={filterMgr}
              onChange={e => setFilterMgr(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, outline: 'none', minWidth: 180 }}
            >
              <option value="">Todos os managers</option>
              {managers.map(m => <option key={m.code} value={m.code}>{m.name.replace(/^ISM\s+/i, '')}</option>)}
            </select>

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nome, telefone, email..."
              style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, outline: 'none' }}
            />
          </div>

          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.35)', marginBottom: 10 }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(232,237,245,0.3)', fontSize: 13 }}>
              Nenhum referral encontrado.
            </div>
          ) : (
            filtered.map(r => <ReferralRow key={r.rowIndex} ref_={r} onStatusChange={handleStatusChange} />)
          )}
        </>
      ) : (
        /* Managers tab */
        <div>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.35)', marginBottom: 12 }}>
            {managers.length} managers registrados (gerenciado via planilha Managers_Config)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {mgrWithCounts.map(m => (
              <div key={m.code} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${m.active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 12, padding: '18px 20px',
                opacity: m.active ? 1 : 0.45,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: m.active ? 'rgba(0,255,178,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${m.active ? 'rgba(0,255,178,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 900, color: m.active ? 'var(--accent)' : 'rgba(232,237,245,0.3)',
                    fontFamily: 'monospace',
                  }}>
                    {m.code}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                      {m.name.replace(/^ISM\s+/i, '')}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.4)', marginTop: 2 }}>
                      {m.telegramTag}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                    background: m.active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)',
                    color: m.active ? '#22c55e' : '#6b7280',
                    border: `1px solid ${m.active ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)'}`,
                  }}>
                    {m.active ? 'ATIVO' : 'INATIVO'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{m.total}</div>
                    <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.4)' }}>indicações</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{m.pago}</div>
                    <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.4)' }}>pagos</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-dim)' }}>
                      {m.total > 0 ? Math.round((m.pago / m.total) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.4)' }}>conversão</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(232,237,245,0.4)' }}>
            💡 Para ativar/desativar managers, edite a coluna D (Active) na planilha Managers_Config.
          </div>
        </div>
      )}
    </div>
  );
}
