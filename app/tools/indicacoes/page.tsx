'use client'

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

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
  'Não Contactado':     '#94a3b8',
  'Em Contato':         '#3b82f6',
  'Aguardando':         '#f59e0b',
  'Em Negociação':      '#a855f7',
  'Top-Up de Carteira': '#06b6d4',
  'Pago':               '#22c55e',
  'Não Pago':           '#ef4444',
  'N/A':                '#64748b',
};

const STATUS_BG: Record<string, string> = {
  'Não Contactado':     '#1e293b',
  'Em Contato':         '#1e2d4a',
  'Aguardando':         '#2d2410',
  'Em Negociação':      '#231830',
  'Top-Up de Carteira': '#0f2535',
  'Pago':               '#0f2d1a',
  'Não Pago':           '#2d1010',
  'N/A':                '#1a1f2e',
};

// ── URL / ID parser ────────────────────────────────────────────────────────────
function extractStudentId(raw: string): { id: string; type: string } | null {
  if (!raw.trim()) return null;
  const bo  = raw.match(/\/students\/(\d{5,10})/);
  if (bo)  return { id: bo[1], type: 'BO' };
  const amo = raw.match(/\/leads\/detail\/(\d{5,10})/);
  if (amo) return { id: amo[1], type: 'AmoCRM' };
  if (/^\d{5,10}$/.test(raw.trim())) return { id: raw.trim(), type: 'ID' };
  return null;
}

// ── Link Generator ─────────────────────────────────────────────────────────────
function LinkGenerator({ manager }: { manager: Manager | null }) {
  const [urlInput,    setUrlInput]    = useState('');
  const [clientName,  setClientName]  = useState('');
  const [parsed,      setParsed]      = useState<{ id: string; type: string } | null>(null);
  const [copied,      setCopied]      = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setParsed(extractStudentId(urlInput));
    setCopied(false);
    setShowSuccess(false);
  }, [urlInput]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  function buildLink() {
    if (!manager || !parsed) return '';
    const params = new URLSearchParams({ id: parsed.id, mc: manager.code });
    if (clientName.trim()) params.set('cn', clientName.trim());
    return `${baseUrl}/indicacao?${params.toString()}`;
  }

  const link = buildLink();
  const canGenerate = !!parsed;

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setShowSuccess(true);
  }

  function reset() {
    setUrlInput('');
    setClientName('');
    setParsed(null);
    setCopied(false);
    setShowSuccess(false);
  }

  return (
    <div style={{
      background: '#0d1f1a',
      border: '1px solid rgba(0,255,178,0.18)',
      borderRadius: 16, padding: '26px 28px', marginBottom: 28,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0,255,178,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,255,178,0.12)', border: '1px solid rgba(0,255,178,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔗</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>Gerador de Link de Indicação</div>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.4)', marginTop: 1 }}>Cole o perfil do BO ou AmoCRM para gerar o link</div>
        </div>
      </div>

      {!manager ? (
        <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.35)', fontStyle: 'italic' }}>Carregando dados do manager...</div>
      ) : showSuccess ? (
        /* Post-copy state */
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Link copiado!</div>
          <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.45)', marginBottom: 22, lineHeight: 1.6 }}>
            Compartilhe com o cliente. Quando ele abrir,<br />
            verá o formulário personalizado do ISM Kodland.
          </div>
          <button onClick={reset} style={{
            padding: '10px 28px', borderRadius: 9, border: '1px solid rgba(0,255,178,0.25)',
            background: 'rgba(0,255,178,0.1)', color: 'var(--accent)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,178,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,178,0.1)'; }}
          >
            + Gerar novo link
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* URL input */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(232,237,245,0.45)', display: 'block', marginBottom: 7, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Link do perfil do aluno (BO ou AmoCRM)
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://bo.kodland.org/students/1234567  ou  1234567"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 9,
                border: `1px solid ${parsed ? 'rgba(0,255,178,0.3)' : 'rgba(255,255,255,0.1)'}`,
                background: 'rgba(0,0,0,0.3)', color: '#fff',
                fontSize: 13, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,178,0.45)'}
              onBlur={e => e.currentTarget.style.borderColor = parsed ? 'rgba(0,255,178,0.3)' : 'rgba(255,255,255,0.1)'}
            />
            {urlInput && (
              <div style={{ marginTop: 7, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                {parsed ? (
                  <>
                    <span style={{ color: '#22c55e' }}>✓</span>
                    <span style={{ color: 'rgba(232,237,245,0.55)' }}>
                      ID:{' '}<span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{parsed.id}</span>
                      <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 4, background: 'rgba(0,255,178,0.1)', color: 'rgba(0,255,178,0.7)', fontSize: 10 }}>{parsed.type}</span>
                    </span>
                  </>
                ) : (
                  <><span style={{ color: '#f59e0b' }}>⚠</span><span style={{ color: 'rgba(232,237,245,0.4)' }}>ID não reconhecido — cole o link completo do BO ou AmoCRM</span></>
                )}
              </div>
            )}
          </div>

          {/* Client name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(232,237,245,0.45)', display: 'block', marginBottom: 7, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Nome do cliente que está indicando
            </label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Ex: João Silva  (aparecerá no formulário)"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.3)', color: '#fff',
                fontSize: 14, fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,178,0.35)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            {clientName.trim() && (
              <div style={{ marginTop: 7, fontSize: 11, color: 'rgba(232,237,245,0.45)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: 'var(--accent)', fontSize: 13 }}>✓</span>
                O formulário mostrará:{' '}
                <span style={{ color: '#fff', fontStyle: 'italic' }}>
                  "{clientName.trim().split(/\s+/)[0]} te indicou!"
                </span>
              </div>
            )}
          </div>

          {/* Generated link */}
          {link && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(232,237,245,0.35)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>
                Link gerado
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 9,
                border: '1px solid rgba(0,255,178,0.2)', background: 'rgba(0,0,0,0.35)',
              }}>
                <div style={{ flex: 1, fontSize: 12, color: 'rgba(232,237,245,0.65)', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                  {link}
                </div>
                <button onClick={copy} style={{
                  padding: '8px 18px', borderRadius: 7, border: 'none', flexShrink: 0,
                  background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(0,255,178,0.15)',
                  color: copied ? '#22c55e' : 'var(--accent)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          {!canGenerate && urlInput && (
            <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.35)', lineHeight: 1.6 }}>
              <strong style={{ color: 'rgba(232,237,245,0.55)' }}>Exemplos de links aceitos:</strong><br />
              · https://bo.kodland.org/students/<strong style={{ color: '#fff' }}>1234567</strong><br />
              · https://kodland.amocrm.ru/leads/detail/<strong style={{ color: '#fff' }}>12345678</strong><br />
              · Ou cole diretamente o ID numérico
            </div>
          )}

          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
            Manager: <span style={{ color: 'rgba(232,237,245,0.55)' }}>{manager.name}</span> · Código {manager.code}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#94a3b8';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>
      {status}
    </span>
  );
}

// ── Referral card ──────────────────────────────────────────────────────────────
function ReferralRow({
  ref_,
  onStatusChange,
}: {
  ref_: Referral;
  onStatusChange: (rowIndex: number, status: string, notes: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status,   setStatus]   = useState(ref_.status || 'Não Contactado');
  const [notes,    setNotes]    = useState(ref_.notes  || '');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  async function save() {
    setSaving(true);
    await onStatusChange(ref_.rowIndex, status, notes);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const changed     = status !== ref_.status || notes !== ref_.notes;
  const statusColor = STATUS_COLORS[status] || '#94a3b8';
  const statusBg    = STATUS_BG[status]    || '#1a1f2e';

  return (
    <div style={{
      borderRadius: 12, marginBottom: 8, overflow: 'hidden',
      border: `1px solid ${statusColor}35`,
      borderLeft: `3px solid ${statusColor}`,
      background: statusBg,
      boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
      transition: 'border-color 0.2s',
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{ref_.nome || '—'}</div>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.4)', marginTop: 2 }}>
            {ref_.telefone}{ref_.data ? ` · ${ref_.data}` : ''}
          </div>
        </div>
        <StatusBadge status={status} />
        <span style={{ fontSize: 10, color: 'rgba(232,237,245,0.25)', flexShrink: 0, marginLeft: 4 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 16px 18px', borderTop: `1px solid ${statusColor}20` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, marginBottom: 16 }}>
            {([
              ['E-mail',   ref_.email],
              ['Horário',  `${ref_.horario}${ref_.diaContato ? ' · ' + ref_.diaContato : ''}`],
              ['Manager',  ref_.managerName],
              ['ID',       ref_.id],
            ] as [string, string][]).map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.75)', fontFamily: 'monospace' }}>{val || '—'}</div>
              </div>
            ))}
          </div>

          {ref_.linkCliente && (
            <a href={ref_.linkCliente} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 16,
              fontSize: 11, color: 'var(--accent)', textDecoration: 'none',
              padding: '6px 12px', borderRadius: 7,
              background: 'rgba(0,255,178,0.08)', border: '1px solid rgba(0,255,178,0.18)',
            }}>
              🔗 Abrir no BO / AmoCRM
            </a>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 10, color: 'rgba(232,237,245,0.35)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{
                  width: '100%', padding: '9px 10px', borderRadius: 8,
                  border: `1px solid ${statusColor}40`,
                  background: 'rgba(0,0,0,0.4)', color: '#fff',
                  fontSize: 12, outline: 'none', cursor: 'pointer',
                }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'rgba(232,237,245,0.35)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notas</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observações..."
                style={{
                  width: '100%', padding: '9px 10px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.4)', color: '#fff',
                  fontSize: 12, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {changed && (
            <button onClick={save} disabled={saving} style={{
              padding: '8px 20px', borderRadius: 8,
              border: `1px solid ${saved ? 'rgba(34,197,94,0.3)' : statusColor + '40'}`,
              background: saved ? 'rgba(34,197,94,0.18)' : `${statusColor}20`,
              color: saved ? '#22c55e' : statusColor,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {saving ? 'Salvando...' : saved ? '✓ Salvo' : 'Salvar status'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function IndicacoesPage() {
  const { data: session } = useSession();
  const isAdmin  = session?.user?.rol === 'admin';
  const userName = session?.user?.nombre ?? '';

  const [myManager, setMyManager] = useState<Manager | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [search,    setSearch]    = useState('');
  const [filterSt,  setFilterSt]  = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [mgRes, refRes] = await Promise.all([
        fetch('/api/indicacoes?action=managers'),
        fetch('/api/indicacoes?action=referrals'),
      ]);
      const mgData  = await mgRes.json();
      const refData = await refRes.json();
      if (!mgData.success)  throw new Error(mgData.error);
      if (!refData.success) throw new Error(refData.error);

      const managers: Manager[] = mgData.managers;
      const normalizedUser = userName.replace(/^ISM\s+/i, '').toLowerCase().trim();
      const matched = managers.find(m => {
        const nm = m.name.replace(/^ISM\s+/i, '').toLowerCase().trim();
        return nm === normalizedUser || m.name.toLowerCase() === userName.toLowerCase();
      }) ?? null;

      setMyManager(matched);
      const all: Referral[] = refData.referrals || [];
      setReferrals(isAdmin ? all : all.filter(r => matched && r.managerCode === matched.code));
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [userName, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleStatusChange(rowIndex: number, status: string, notes: string) {
    await fetch('/api/indicacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateStatus', rowIndex, status, notes }),
    });
    setReferrals(prev => prev.map(r => r.rowIndex === rowIndex ? { ...r, status, notes } : r));
  }

  const filtered = referrals.filter(r => {
    const matchSearch = !search || [r.nome, r.telefone, r.email].some(f =>
      f.toLowerCase().includes(search.toLowerCase())
    );
    return matchSearch && (!filterSt || r.status === filterSt);
  });

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = referrals.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ padding: '32px 28px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          🔗 Indicações
        </div>
        <div style={{ fontSize: 13, color: 'rgba(232,237,245,0.45)' }}>
          {isAdmin ? 'Visão de direção — todos os managers' : 'Seus referrals e gerador de links'}
        </div>
      </div>

      {/* Link generator — managers only */}
      {!isAdmin && <LinkGenerator manager={myManager} />}

      {/* Status filter chips */}
      {referrals.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {Object.entries(statusCounts).filter(([, c]) => c > 0).map(([st, count]) => {
            const color  = STATUS_COLORS[st] || '#94a3b8';
            const active = filterSt === st;
            return (
              <button key={st} onClick={() => setFilterSt(active ? '' : st)} style={{
                padding: '4px 12px', borderRadius: 99, cursor: 'pointer',
                border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
                background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
                color: active ? color : 'rgba(232,237,245,0.45)',
                fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
              }}>
                {st} · {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone ou email..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.3)', color: '#fff',
            fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13 }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '56px 0', color: 'rgba(232,237,245,0.35)', fontSize: 13 }}>
          Carregando indicações...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔗</div>
          <div style={{ fontSize: 14, color: 'rgba(232,237,245,0.35)' }}>
            {referrals.length === 0 ? 'Nenhuma indicação ainda. Gere um link e comece!' : 'Nenhum resultado para os filtros aplicados.'}
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.3)', marginBottom: 10 }}>
            {filtered.length} indicaç{filtered.length === 1 ? 'ão' : 'ões'} encontrada{filtered.length !== 1 ? 's' : ''}
          </div>
          {filtered.map(r => (
            <ReferralRow key={r.rowIndex} ref_={r} onStatusChange={handleStatusChange} />
          ))}
        </>
      )}

      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <button onClick={fetchData} style={{
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.2)', color: 'rgba(232,237,245,0.4)',
          fontSize: 12, transition: 'color 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(232,237,245,0.4)'; }}
        >
          ↻ Atualizar
        </button>
      </div>
    </div>
  );
}
