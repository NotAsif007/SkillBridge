/**
 * ResumeUpload.jsx — PDF Drag-and-Drop Resume Upload
 * API: POST /api/v1/resumes/upload
 */
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { studentApi } from '../../../api/student';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  red:'#DC2626', redBg:'rgba(220,38,38,0.12)', redText:'#F87171',
};

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('File must be smaller than 5MB.'); return; }
    setError('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await studentApi.uploadResume(formData);
      navigate('/resume/analysis', { state: res.data });
    } catch (err) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '48px 40px', background: T.appBg, minHeight: '100vh', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>Resume Analyzer</h1>
        <p style={{ color: T.textMuted, fontSize: 14, marginTop: 8 }}>
          Upload your PDF resume and get an instant AI-powered ATS score with actionable improvement suggestions.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? T.blue : file ? T.emerald : T.border}`,
          borderRadius: 12, padding: '48px 32px', textAlign: 'center',
          background: dragging ? `${T.blue}08` : T.surface,
          cursor: file ? 'default' : 'pointer',
          transition: 'all 0.2s', marginBottom: 16,
        }}
      >
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

        {!file ? (
          <>
            <UploadCloud size={48} color={dragging ? T.blue : T.textMuted} style={{ marginBottom: 16, opacity: dragging ? 1 : 0.5 }} />
            <div style={{ color: T.textPrimary, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              {dragging ? 'Drop it here!' : 'Drop your PDF resume here'}
            </div>
            <div style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>or click to browse from your device</div>
            <span style={{ fontSize: 12, color: T.textMuted, background: T.border, padding: '4px 12px', borderRadius: 9999 }}>PDF only · Max 5MB</span>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <FileText size={36} color={T.emerald} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600 }}>{file.name}</div>
              <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB · Ready to upload</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 4 }}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.redBg, border: `1px solid ${T.red}40`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: T.redText, fontSize: 13 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{
          width: '100%', padding: '13px 0', border: 'none', borderRadius: 8,
          background: file && !uploading ? T.blue : T.border,
          color: file && !uploading ? '#fff' : T.textMuted,
          fontWeight: 700, fontSize: 15, cursor: file ? 'pointer' : 'not-allowed',
          marginBottom: 24, transition: 'all 0.2s',
        }}
      >
        {uploading ? (
          <span>⏳ Analyzing with AI… this may take a moment</span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <UploadCloud size={18} /> Upload & Analyze Resume
          </span>
        )}
      </button>

      <div style={{ textAlign: 'center' }}>
        <Link to="/resume/analysis" style={{ color: T.textMuted, fontSize: 13, textDecoration: 'none' }}>
          View Previous Analysis →
        </Link>
      </div>
    </div>
  );
}
