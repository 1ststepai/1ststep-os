import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './tokens.css';

const PRODUCT_TYPES = [
  ['WEB_SAAS', 'Web / SaaS'],
  ['MARKETPLACE', 'Marketplace'],
  ['ECOMMERCE', 'Ecommerce'],
  ['INTERNAL_TOOL', 'Internal tool'],
  ['MOBILE_APP', 'Mobile app'],
  ['DEVELOPER_TOOL', 'Developer tool'],
  ['CONTENT_SITE', 'Content site'],
  ['DESKTOP_APP', 'Desktop app'],
];

const PLATFORMS = [
  ['WEB', 'Web'],
  ['IOS', 'iOS'],
  ['ANDROID', 'Android'],
  ['MACOS', 'macOS'],
  ['WINDOWS', 'Windows'],
  ['CLI', 'CLI'],
  ['API', 'API'],
  ['BROWSER_EXTENSION', 'Browser extension'],
];

type CompileJson = {
  demo: boolean;
  notice: string;
  generatedAt: string;
  profileId: string;
  modules: Array<{ moduleId: string; reason: string }>;
  deferred: Array<{ id: string; reason: string }>;
  files: Array<{ path: string; bytes: number; content: string }>;
  error?: string;
  issues?: string[];
};

function App() {
  const [idea, setIdea] = useState('');
  const [name, setName] = useState('');
  const [productType, setProductType] = useState('WEB_SAAS');
  const [platforms, setPlatforms] = useState<string[]>(['WEB']);
  const [paymentsNeeded, setPaymentsNeeded] = useState(false);
  const [authNeeded, setAuthNeeded] = useState(true);
  const [usesAI, setUsesAI] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CompileJson | null>(null);

  const form = useMemo(() => ({
    name: name.trim() || undefined,
    productTypes: [productType],
    platformTargets: platforms.length ? platforms : ['WEB'],
    paymentsNeeded,
    authNeeded,
    usesAI,
  }), [name, productType, platforms, paymentsNeeded, authNeeded, usesAI]);

  async function compile(format: 'json' | 'zip') {
    setBusy(true);
    setError('');
    try {
      const body = {
        idea,
        form,
        ...(format === 'zip' && result?.generatedAt ? { generatedAt: result.generatedAt } : {}),
        ...(format === 'json' ? { format: 'json' } : {}),
      };
      const res = await fetch('/os/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: format === 'json' ? 'application/json' : 'application/zip' },
        body: JSON.stringify(body),
      });
      if (format === 'json') {
        const data = await res.json();
        if (!res.ok) {
          setResult(null);
          setError((data.issues || [data.error || res.statusText]).join('\n'));
          return;
        }
        setResult(data);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.issues || [data.error || res.statusText]).join('\n'));
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = match?.[1] || 'project-os.zip';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compile failed.');
    } finally {
      setBusy(false);
    }
  }

  function togglePlatform(id: string) {
    setPlatforms((current) => {
      if (current.includes(id)) {
        const next = current.filter((p) => p !== id);
        return next.length ? next : current;
      }
      return [...current, id];
    });
  }

  return (
    <main className="shell">
      <p className="kicker">1stStep OS · Cycle 1 demo</p>
      <h1>Turn an idea into a Project OS stub</h1>
      <p className="lede">
        Foundation demo — not the full OS. Paste a plain-English idea, optionally fill the short profile,
        and download a markdown ZIP. Selection is deterministic. No model is called. Nothing is published.
      </p>

      <form
        className="panel"
        onSubmit={(event) => {
          event.preventDefault();
          void compile('json');
        }}
      >
        <label htmlFor="idea">
          Idea
          <span className="hint">Required. Treated as data, never as agent instructions.</span>
        </label>
        <textarea
          id="idea"
          name="idea"
          required
          minLength={8}
          placeholder="e.g. Neighbours book trusted pet sitters and pay in the app."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />

        <div className="grid two">
          <div>
            <label htmlFor="name">
              Project name
              <span className="hint">Optional. Derived from the idea if blank.</span>
            </label>
            <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="productType">Product type</label>
            <select id="productType" value={productType} onChange={(e) => setProductType(e.target.value)}>
              {PRODUCT_TYPES.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="grid" style={{ border: 0, padding: 0, marginTop: '1.25rem' }}>
          <legend className="legend">Platforms</legend>
          <div className="checks">
            {PLATFORMS.map(([id, label]) => (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={platforms.includes(id)}
                  onChange={() => togglePlatform(id)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="checks">
          <label>
            <input type="checkbox" checked={paymentsNeeded} onChange={(e) => setPaymentsNeeded(e.target.checked)} />
            Takes payments
          </label>
          <label>
            <input type="checkbox" checked={authNeeded} onChange={(e) => setAuthNeeded(e.target.checked)} />
            Needs sign-in
          </label>
          <label>
            <input type="checkbox" checked={usesAI} onChange={(e) => setUsesAI(e.target.checked)} />
            Uses AI features
          </label>
        </div>

        <div className="actions">
          <button className="primary" type="submit" disabled={busy || idea.trim().length < 8}>
            {busy ? 'Compiling…' : 'Compile stub'}
          </button>
        </div>
        {error ? <p className="error" role="alert">{error}</p> : null}
      </form>

      {result ? (
        <section className="panel result" aria-live="polite">
          <h2>Compiled (local demo)</h2>
          <p className="fine">{result.notice}</p>
          <p className="fine">Profile <code>{result.profileId}</code></p>
          <h2>Selected modules</h2>
          <ul className="modules">
            {result.modules.map((m) => (
              <li key={m.moduleId}>{m.moduleId} · {m.reason.toLowerCase().replaceAll('_', ' ')}</li>
            ))}
          </ul>
          {result.deferred.length ? (
            <>
              <h2>Deferred</h2>
              <ul className="modules">
                {result.deferred.map((m) => (
                  <li key={m.id}>{m.id} · {m.reason.toLowerCase().replaceAll('_', ' ')}</li>
                ))}
              </ul>
            </>
          ) : null}
          <h2>Files</h2>
          <ul className="files">
            {result.files.map((f) => (
              <li key={f.path}>{f.path}</li>
            ))}
          </ul>
          <div className="actions">
            <button className="ghost" type="button" disabled={busy} onClick={() => void compile('zip')}>
              Download ZIP
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
