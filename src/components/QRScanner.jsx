import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from '@capacitor/camera';

export default function QRScanner({ onScanSuccess, onClose }) {
  useEffect(() => {
    let html5QrCode;
    
    const startScanner = async () => {
      try {
        // Minta izin kamera langsung ke Native Android (Wajib untuk Capacitor)
        const perm = await Camera.requestPermissions();
        if (perm.camera !== 'granted' && perm.camera !== 'prompt-with-rationale') {
           alert("Izin kamera ditolak. Silakan izinkan di Pengaturan HP Anda.");
           onClose();
           return;
        }

        html5QrCode = new Html5Qrcode("qris-reader");
        await html5QrCode.start(
          { facingMode: "environment" }, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            // Berhasil scan! Matikan scanner dan kirim teksnya
            if (html5QrCode.isScanning) {
               html5QrCode.stop().then(() => {
                 onScanSuccess(decodedText);
               }).catch(err => console.error("Gagal mematikan scanner", err));
            }
          },
          (errorMessage) => {
            // Abaikan error per frame saat mencari QR
          }
        );
      } catch (err) {
        console.error("Gagal menyalakan kamera", err);
        alert("Gagal menyalakan kamera. Pastikan Anda telah memberikan izin akses kamera.");
        onClose();
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error(err));
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-fade-in">
      <div className="flex justify-between items-center p-5 bg-gradient-to-b from-black/80 to-transparent text-white absolute top-0 left-0 w-full z-10">
        <h3 className="font-extrabold tracking-wide">Arahkan ke QRIS Kasir</h3>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-md font-bold">
          ✕
        </button>
      </div>
      
      <div className="flex-1 w-full bg-black relative flex items-center justify-center overflow-hidden pt-16 pb-20">
        <div id="qris-reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]"></div>
      </div>

      <div className="p-6 pb-12 text-center text-white/70 text-xs font-semibold absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent">
        Aplikasi akan otomatis membedah Nama Toko dan Nominal (jika disetel kasir) tanpa memotong saldo rekening Anda secara langsung.
      </div>
    </div>
  );
}
