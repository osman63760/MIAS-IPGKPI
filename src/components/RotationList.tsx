import React from 'react';
import { Rotation } from '../types';
import { Calendar, User, Trash2, Clock, Download, Contact } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Props {
  rotations: Rotation[];
  onDelete: (id: number) => void;
}

export default function RotationList({ rotations, onDelete }: Props) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const downloadImage = (rotation: Rotation) => {
    if (!rotation.image_data) return;
    
    const link = document.createElement('a');
    link.href = rotation.image_data;
    const fileName = `${rotation.task}_${rotation.name.replace(/\s+/g, '_')}_${rotation.duty_date}.jpg`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Gambar ${rotation.name} sedang dimuat turun.`);
  };

  const downloadDigitalCard = (rotation: Rotation) => {
    if (!rotation.image_data) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Header bar
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, canvas.width, 80);

    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.onload = () => {
      // Draw Logo
      ctx.drawImage(logoImg, 20, 10, 60, 60);
      
      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px serif';
      ctx.textAlign = 'left';
      ctx.fillText('MASJID MIAS IPGKPI', 95, 50);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw Image
        ctx.drawImage(img, 40, 100, 180, 240);
        
        // Info Text
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1e293b';
        
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#059669';
        ctx.fillText(rotation.task.toUpperCase(), 250, 130);
        
        ctx.font = 'bold 28px sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(rotation.name, 250, 170);
        
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(rotation.prayer_type, 250, 210);
        
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(formatDate(rotation.duty_date), 250, 260);

        // Footer
        ctx.font = 'italic 12px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Dijana secara automatik oleh Sistem MIAS', 250, 340);

        // Download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.download = `KAD_${rotation.task}_${rotation.name.replace(/\s+/g, '_')}.jpg`;
        link.click();
        toast.success(`Kad Digital ${rotation.name} telah dijana.`);
      };
      img.src = rotation.image_data || '';
    };
    logoImg.src = "https://raw.githubusercontent.com/osman63760/logo-mias/main/00-01IMG_9519_asal.PNG";
  };

  return (
    <div className="space-y-4">
      {rotations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-black/5">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Tiada rekod buat masa ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {rotations.map((rotation) => (
              <motion.div
                key={rotation.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 hover:border-masjid-gold/30 transition-all group"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                    {rotation.image_data ? (
                      <img src={rotation.image_data} alt={rotation.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block
                          ${rotation.task === 'Imam' ? 'bg-masjid-green/10 text-masjid-green' : 'bg-masjid-gold/10 text-masjid-gold'}
                        `}>
                          {rotation.task}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block">
                          {rotation.prayer_type}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => downloadDigitalCard(rotation)}
                          className="text-slate-300 hover:text-masjid-gold transition-colors p-1"
                          title="Muat Turun Kad Digital"
                        >
                          <Contact className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => downloadImage(rotation)}
                          className="text-slate-300 hover:text-masjid-green transition-colors p-1"
                          title="Muat Turun Gambar Passport"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => rotation.id && onDelete(rotation.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          title="Padam Rekod"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-800 truncate mb-1">{rotation.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(rotation.duty_date)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      Ditambah pada {new Date(rotation.created_at || '').toLocaleDateString('ms-MY')}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
