import React, { useState, useRef } from 'react';
import { TaskType, Rotation, PrayerType } from '../types';
import { processImamImage } from '../services/geminiService';
import { Camera, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Props {
  onSuccess: () => void;
}

export default function RotationForm({ onSuccess }: Props) {
  const [name, setName] = useState('');
  const [task, setTask] = useState<TaskType>(TaskType.IMAM);
  const [prayerType, setPrayerType] = useState<PrayerType>(PrayerType.FARDU);
  const [date, setDate] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      
      // Auto-process with Gemini
      setIsProcessing(true);
      const processed = await processImamImage(base64, file.type);
      if (processed) {
        setProcessedImage(processed);
      }
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !processedImage) {
      toast.error("Sila lengkapkan semua maklumat termasuk gambar.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan rekod...");
    
    try {
      const response = await fetch('/api/rotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          task,
          prayer_type: prayerType,
          duty_date: date,
          image_data: processedImage,
        }),
      });

      if (response.ok) {
        toast.success("Rekod berjaya disimpan!", { id: toastId });
        setName('');
        setDate('');
        setImage(null);
        setProcessedImage(null);
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(`Gagal menyimpan: ${errorData.error || 'Ralat tidak diketahui'}`, { id: toastId });
      }
    } catch (error) {
      console.error("Error saving rotation:", error);
      toast.error("Ralat rangkaian. Sila cuba lagi.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
      <h2 className="text-2xl font-serif font-semibold text-masjid-green mb-6">Tambah Rekod Penggiliran</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nama Penuh</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-masjid-green focus:border-transparent outline-none transition-all"
                placeholder="Masukkan nama..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tugasan</label>
              <div className="flex gap-4">
                {Object.values(TaskType).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="task"
                      value={t}
                      checked={task === t}
                      onChange={() => setTask(t)}
                      className="w-4 h-4 text-masjid-green border-slate-300 focus:ring-masjid-green"
                    />
                    <span className={`text-sm ${task === t ? 'text-masjid-green font-semibold' : 'text-slate-500'}`}>
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Jenis Solat / Majlis</label>
              <select
                value={prayerType}
                onChange={(e) => setPrayerType(e.target.value as PrayerType)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-masjid-green focus:border-transparent outline-none transition-all bg-white"
                required
              >
                {Object.values(PrayerType).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tarikh Bertugas</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-masjid-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-600 mb-1">Gambar Passport</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[3/4] w-48 mx-auto rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                ${processedImage ? 'border-masjid-green bg-masjid-cream/30' : 'border-slate-200 hover:border-masjid-gold bg-slate-50'}
              `}
            >
              {processedImage ? (
                <img src={processedImage} alt="Processed" className="w-full h-full object-cover" />
              ) : image ? (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <Loader2 className="w-8 h-8 text-masjid-gold animate-spin" />
                  <p className="text-xs text-slate-500">Memproses gambar...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <Camera className="w-8 h-8 text-slate-400" />
                  <p className="text-xs text-slate-500">Klik untuk Selfie / Muat Naik</p>
                </div>
              )}
              
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Loader2 className="w-8 h-8 text-masjid-green animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="user"
              className="hidden"
            />
            {processedImage && (
              <p className="text-[10px] text-center text-masjid-green flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Gambar telah sedia
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isProcessing || !processedImage}
          className="w-full bg-masjid-green text-white py-3 rounded-xl font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Rekod'}
        </button>
      </form>
    </div>
  );
}
