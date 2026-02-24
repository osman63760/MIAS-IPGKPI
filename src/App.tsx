import React, { useState, useEffect } from 'react';
import RotationForm from './components/RotationForm';
import RotationList from './components/RotationList';
import { Rotation } from './types';
import { Building2, Moon, Sun, Landmark, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function App() {
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRotations = async () => {
    try {
      const response = await fetch('/api/rotations');
      const data = await response.json();
      setRotations(data);
    } catch (error) {
      console.error("Error fetching rotations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (rotations.length === 0) return;
    
    const headers = ["ID", "Nama", "Tugasan", "Jenis Solat", "Tarikh Bertugas", "Tarikh Dicipta"];
    const rows = rotations.map(r => [
      r.id,
      `"${r.name}"`,
      r.task,
      r.prayer_type,
      r.duty_date,
      r.created_at
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jadual_mias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    if (rotations.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Jadual Penggiliran Masjid MIAS IPGKPI</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-family: 'Playfair Display', serif; color: #064e3b; text-align: center; margin-bottom: 5px; }
            p.subtitle { text-align: center; color: #64748b; margin-bottom: 40px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; display: flex; gap: 15px; page-break-inside: avoid; }
            .img-container { width: 80px; height: 100px; border-radius: 8px; overflow: hidden; background: #f1f5f9; flex-shrink: 0; }
            .img-container img { width: 100%; height: 100%; object-fit: cover; }
            .info { flex: 1; }
            .task { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #059669; margin-bottom: 4px; }
            .name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
            .prayer { font-size: 11px; color: #64748b; margin-bottom: 4px; }
            .date { font-size: 11px; font-weight: 500; color: #1e293b; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
            <img src="https://raw.githubusercontent.com/osman63760/logo-mias/main/00-01IMG_9519_asal.PNG" style="width: 60px; height: 60px; object-fit: contain;" />
            <h1 style="margin: 0;">Masjid MIAS IPGKPI</h1>
          </div>
          <p class="subtitle">Jadual Penggiliran Tugas Imam & Bilal</p>
          <div class="grid">
            ${rotations.map(r => `
              <div class="card">
                <div class="img-container">
                  ${r.image_data ? `<img src="${r.image_data}" />` : ''}
                </div>
                <div class="info">
                  <div class="task">${r.task}</div>
                  <div class="name">${r.name}</div>
                  <div class="prayer">${r.prayer_type}</div>
                  <div class="date">${new Date(r.duty_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/rotations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success("Rekod telah dipadam.");
        fetchRotations();
      } else {
        toast.error("Gagal memadam rekod.");
      }
    } catch (error) {
      console.error("Error deleting rotation:", error);
      toast.error("Ralat rangkaian semasa memadam.");
    }
  };

  useEffect(() => {
    fetchRotations();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-masjid-green text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Building2 className="w-64 h-64" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-xl p-1 shadow-lg flex-shrink-0">
              <img 
                src="https://raw.githubusercontent.com/osman63760/logo-mias/main/00-01IMG_9519_asal.PNG" 
                alt="Logo MIAS" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight">
                Masjid MIAS IPGKPI
              </h1>
              <p className="text-masjid-cream/80 text-xs md:text-sm font-light">
                Sistem Pengurusan Penggiliran Tugas Imam & Bilal
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <RotationForm onSuccess={fetchRotations} />
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-7">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-semibold text-masjid-green">Senarai Penggiliran</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadCSV}
                  disabled={rotations.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-masjid-gold/50 transition-all disabled:opacity-50"
                  title="Muat Turun CSV"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={generatePDF}
                  disabled={rotations.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-masjid-gold/10 border border-masjid-gold/20 rounded-xl text-sm font-medium text-masjid-gold hover:bg-masjid-gold/20 transition-all disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Laporan (PDF)
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-masjid-green border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <RotationList rotations={rotations} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="mt-20 border-t border-masjid-gold/20 py-8 text-center text-slate-400 text-sm px-4">
        <p className="mb-2">Rekod disimpan secara selamat dalam pangkalan data Masjid MIAS IPGKPI.</p>
        <p>&copy; {new Date().getFullYear()} Masjid MIAS IPGKPI. Hak Cipta Terpelihara.</p>
      </footer>
    </div>
  );
}
