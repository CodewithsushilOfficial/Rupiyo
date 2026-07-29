"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Camera as CameraIcon, Upload, FileText, RefreshCw, XCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { preprocessImageClient } from '@/lib/services/image-preprocessing';

export function ReceiptScannerModal({ isOpen, onClose, onScanComplete }) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanStage, setScanStage] = React.useState(''); // 'reading' | 'scanning' | 'extracting'
  const [errorMsg, setErrorMsg] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('upload'); // 'camera' | 'upload' | 'text'
  const [manualText, setManualText] = React.useState('');
  const fileInputRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const mediaStreamRef = React.useRef(null);
  const abortControllerRef = React.useRef(null);

  const stopCameraStream = React.useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      stopCameraStream();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [stopCameraStream]);

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopCameraStream();
    setIsScanning(false);
    setErrorMsg('');
    onClose();
  };

  const handleStartWebCamera = async () => {
    setErrorMsg('');
    try {
      if (Capacitor.isNativePlatform()) {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });

        if (image.webPath) {
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          await processFilePayload(blob, 'receipt_photo.jpg');
        }
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActiveTab('camera');
    } catch (err) {
      console.error('[CAMERA_ACCESS_ERROR]:', err);
      setErrorMsg('Camera access was denied or not available. Please upload a photo instead.');
    }
  };

  const handleCaptureWebPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        stopCameraStream();
        await processFilePayload(blob, 'captured_receipt.jpg');
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFilePayload(file, file.name);
    }
  };

  const processFilePayload = async (fileOrBlob, filename) => {
    setIsScanning(true);
    setErrorMsg('');
    setScanStage('Reading image...');

    abortControllerRef.current = new AbortController();

    try {
      // 1. Preprocess image client-side for ultra-fast performance
      setScanStage('Scanning receipt...');
      const processedBlob = await preprocessImageClient(fileOrBlob);

      // 2. Build payload
      setScanStage('Extracting transaction details...');
      const formData = new FormData();
      formData.append('file', processedBlob, filename || 'receipt.jpg');
      formData.append('source', 'CAMERA_SCAN');

      const res = await fetch('/api/ocr/parse', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to read receipt document');
      }

      onScanComplete(json.data);
      handleClose();
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[SCAN_CANCELLED] Scan operation was cancelled by user');
        return;
      }
      console.error('[SCAN_PROCESS_ERROR]:', err);
      setErrorMsg(err.message || 'We could not read this receipt. Try entering details manually.');
    } finally {
      setIsScanning(false);
      setScanStage('');
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    setIsScanning(true);
    setErrorMsg('');
    setScanStage('Parsing text...');

    try {
      const formData = new FormData();
      formData.append('text', manualText);
      formData.append('source', 'TEXT_SHARE');

      const res = await fetch('/api/ocr/parse', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse payment text');
      }

      onScanComplete(json.data);
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to parse text transaction');
    } finally {
      setIsScanning(false);
      setScanStage('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Scan Bill & Import Receipt"
      description="Upload an image, PDF receipt, or take a photo to extract transaction details."
    >
      {errorMsg && (
        <div className="mb-4 rounded-control border border-expense-border bg-expense-soft p-3 text-xs font-semibold text-expense flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="ml-2 font-bold text-expense">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
        <button
          type="button"
          onClick={() => {
            stopCameraStream();
            setActiveTab('upload');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-control transition-colors ${
            activeTab === 'upload' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Upload className="h-3.5 w-3.5" /> Upload File
        </button>
        <button
          type="button"
          onClick={handleStartWebCamera}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-control transition-colors ${
            activeTab === 'camera' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <CameraIcon className="h-3.5 w-3.5" /> Take Photo
        </button>
        <button
          type="button"
          onClick={() => {
            stopCameraStream();
            setActiveTab('text');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-control transition-colors ${
            activeTab === 'text' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> Paste Payment Text
        </button>
      </div>

      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <RefreshCw className="h-9 w-9 animate-spin text-primary" />
          <div>
            <h4 className="text-base font-bold text-heading">{scanStage || 'Processing...'}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Extracting amount, merchant name, date, and payment method securely.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClose} className="mt-2 text-xs gap-1.5">
            <XCircle className="h-3.5 w-3.5" /> Cancel Scanning
          </Button>
        </div>
      ) : (
        <>
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center rounded-card border-2 border-dashed border-border bg-card p-8 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold text-heading">
                Drop your receipt image or PDF here
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Supports JPG, PNG, WEBP, and PDF files (Max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                Browse Files
              </Button>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="relative rounded-card overflow-hidden bg-black flex flex-col items-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
              <div className="absolute inset-0 border-2 border-primary/50 border-dashed m-6 rounded-lg pointer-events-none" />
              <div className="p-4 bg-card w-full flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    stopCameraStream();
                    setActiveTab('upload');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCaptureWebPhoto} className="gap-2">
                  <CameraIcon className="h-4 w-4" /> Capture Receipt
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Payment Notification / SMS Text
                </label>
                <textarea
                  rows={4}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste SMS or text: Paid ₹850 to ABC Restaurant on 29 Jul 2026 via UPI"
                  className="w-full rounded-control border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-ring"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!manualText.trim()}>
                  Extract Details
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </Modal>
  );
}
