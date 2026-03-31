import React, { useState, useEffect, useCallback } from 'react';

const Dashboard = ({ tenantId }) => {
  const [sub, setSub] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // useCallback fixes the "missing dependency" warning
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/subscription/status', {
        headers: { 'x-tenant-id': tenantId }
      });
      const data = await res.json();
      setSub(data);
    } catch (err) {
      setMsg({ text: 'Backend Offline', type: 'error' });
    }
  }, [tenantId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

const tryOCR = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setMsg({ text: "Processing OCR...", type: 'info' });

  // Create FormData to send the actual file
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: { 'x-tenant-id': tenantId },
      body: formData // Sending the file here!
    });

    if (res.status === 403) {
      setMsg({ text: "🚫 Upgrade to Pro to upload files!", type: 'error' });
    } else if (res.status === 200) {
      setMsg({ text: `✅ Successfully processed: ${file.name}`, type: 'success' });
      fetchStatus(); // This refreshes your progress bar!
    }
  } catch (err) {
    setMsg({ text: "Connection Error", type: 'error' });
  }
};

  if (!sub) return <div style={{ padding: '20px' }}>Connecting to Migri Backend...</div>;

  const usagePercent = Math.min((sub.current_usage / sub.max_documents) * 100, 100);

  return (
    <div style={{ fontFamily: 'Arial', maxWidth: '600px', margin: '50px auto', padding: '30px', border: '2px solid #222', borderRadius: '15px' }}>
      <header style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <h1>{sub.tenant_name}'s Portal</h1>
        <p>Current Plan: <span style={{ color: '#007bff', fontWeight: 'bold' }}>{sub.plan_name}</span> | Status: {sub.status}</p>
      </header>

      <section>
        <h4>Document Usage</h4>
        <div style={{ height: '20px', width: '100%', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${usagePercent}%`, 
            height: '100%', 
            background: usagePercent > 80 ? '#dc3545' : '#28a745',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>{sub.current_usage} of {sub.max_documents} documents used</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h4>Upload Document for OCR</h4>
        <input 
          type="file" 
          onChange={tryOCR} 
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
        />
      </section>

      {msg.text && (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', color: '#fff', background: msg.type === 'error' ? '#dc3545' : '#28a745' }}>
          {msg.text}
        </div>
      )}
    </div>
  );
};

export default Dashboard;