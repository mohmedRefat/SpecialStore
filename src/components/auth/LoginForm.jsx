import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('البريد الإلكتروني أو كلمة المرور غلط');
  };

  return (
    <div style={{ maxWidth: 380, margin: '60px auto', padding: '0 16px' }}>
      <div className="item-card">
        <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>🔒 تسجيل الدخول</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 13.5, marginBottom: 10 }}>{error}</div>
          )}
          <button className="btn primary" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? '...جاري الدخول' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
