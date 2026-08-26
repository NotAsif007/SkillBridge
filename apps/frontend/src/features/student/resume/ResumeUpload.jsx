/**
 * ResumeUpload.jsx — PDF Resume Upload & ATS Analyzer
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * API: POST /api/v1/resumes/upload
 */
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

export default function ResumeUpload() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5MB.');
      return;
    }
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
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
          Resume Analyzer
        </h1>
        <p style={{ color: T.textMuted, fontSize: 14, margin: '6px 0 0' }}>
          Upload your PDF resume to get an instant AI-powered ATS score with actionable improvement suggestions
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? T.yellow : file ? T.emerald : T.border}`,
          borderRadius: 14,
          padding: '48px 32px',
          textAlign: 'center',
          backgroundColor: dragging ? T.yellowBg : T.surface,
          cursor: file ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: 20,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />

        {!file ? (
          <>
            <UploadCloud size={48} color={dragging ? T.yellowText : T.textMuted} style={{ marginBottom: 16, opacity: dragging ? 1 : 0.6 }} />
            <div style={{ color: T.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              {dragging ? 'Drop your PDF here!' : 'Drop your PDF resume here'}
            </div>
            <div style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>
              or click to browse from your computer
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 650, color: T.textMuted, backgroundColor: T.surfaceSubtle, border: `1px solid ${T.border}`, padding: '4px 14px', borderRadius: 9999 }}>
              PDF format only · Maximum size 5MB
            </span>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <FileText size={36} color={T.emerald} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: T.textPrimary, fontSize: 15, fontWeight: 700 }}>{file.name}</div>
              <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB · Ready for analysis</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              style={{
                marginLeft: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: T.textMuted,
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', backgroundColor: T.roseBg, border: `1px solid ${T.roseBorder}`, borderRadius: 8, color: T.roseText, fontSize: 13, marginBottom: 20 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 26px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: file ? T.buttonPrimaryBg : T.border,
            color: file ? T.buttonPrimaryText : T.textMuted,
            fontWeight: 750,
            fontSize: 14,
            cursor: file && !uploading ? 'pointer' : 'not-allowed',
            boxShadow: file ? '0 4px 12px rgba(245,158,11,0.25)' : 'none',
          }}
        >
          <UploadCloud size={16} /> {uploading ? 'Analyzing PDF with AI…' : 'Start Resume Audit'}
        </button>
      </div>
    </div>
  );
}
