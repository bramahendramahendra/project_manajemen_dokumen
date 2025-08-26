import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { apiRequest } from "@/helpers/apiClient";
import SuccessModalLink from '../modals/successModalLink';

// Import ReactQuill secara dynamic untuk menghindari SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

// Import styles untuk ReactQuill
import 'react-quill/dist/quill.snow.css';

const FormEditPage = ({ dataEdit }: { dataEdit?: any }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [perihal, setPerihal] = useState('');
  const [subperihal, setSubperihal] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const [optionPerihal, setOptionPerihal] = useState<any[]>([]);

  // Konfigurasi toolbar untuk ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'indent',
    'link',
    'align',
    'color', 'background'
  ];

  useEffect(() => {
    const fetchOptionTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest("/master_perihal/", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Master Perihal data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        const res = result.responseData.items.map((item: any) => ({
          perihal: item.perihal,
          nama_perihal: item.nama_perihal,
        }));

        setOptionPerihal(res);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Perihal data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptionTypes();
  }, []);

  // useEffect untuk set data awal saat edit
  useEffect(() => {
    if (dataEdit) {
      console.log(dataEdit);
      
      setPerihal(dataEdit.perihal || '');
      setSubperihal(dataEdit.nama_subperihal || '');
      setDeskripsi(dataEdit.deskripsi || '');
    }
  }, [dataEdit]);

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      perihal: perihal,
      subperihal: subperihal,
      deskripsi: deskripsi,
    };

    try {
      const response = await apiRequest(`/master_subperihal/update/${dataEdit.subperihal}`, 'POST', payload);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Terjadi kesalahan saat menyimpan perubahan subperihal');
      }

      setSuccess(true);
      // Tampilkan modal sukses
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mengirim data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 font-medium text-dark dark:text-white">
        Untuk Edit Subperihal, silahkan edit berdasarkan form dibawah ini
      </h4>
      <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            {/* Perihal - Read Only */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Perihal
              </label>
              <input
                type="text"
                value={optionPerihal.find(item => String(item.perihal) === String(perihal))?.nama_perihal || ''}
                readOnly
                className="w-full rounded-[7px] bg-gray-100 px-5 py-3 text-gray-500 border border-gray-300 cursor-not-allowed dark:bg-dark-3 dark:text-gray-400 dark:border-dark-4"
              />
            </div>

            {/* Subperihal */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Subperihal
              </label>
              <input
                type="text"
                value={subperihal}
                onChange={(e) => setSubperihal(e.target.value)}
                placeholder="Enter your subperihal"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>

            {/* Deskripsi dengan Editor */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Deskripsi
              </label>
              <div className="quill-wrapper">
                <ReactQuill
                  theme="snow"
                  value={deskripsi}
                  onChange={setDeskripsi}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Masukkan deskripsi detail..."
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #1D92F9',
                    borderRadius: '7px',
                    minHeight: '150px'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 p-[13px] font-medium text-white hover:bg-opacity-90"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">Master subperihal berhasil diupdate!</p>}  
          </div>
        </form>
      </div>

      {/* SuccessModalLink Component */}
      <SuccessModalLink
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        title="Berhasil!"
        message="Data subperihal berhasil diperbarui dan disimpan ke dalam sistem."
        showTwoButtons={true}
        primaryButtonText="Kembali ke Halaman Subperihal"
        secondaryButtonText="Edit Subperihal Lagi"
        redirectPath="/master_subperihal" // Sesuaikan dengan path halaman subperihal Anda
      />

      {/* Custom CSS untuk styling editor */}
      <style jsx global>{`
        .quill-wrapper .ql-container {
          border-bottom-left-radius: 7px;
          border-bottom-right-radius: 7px;
          background: transparent;
        }
        
        .quill-wrapper .ql-toolbar {
          border-top-left-radius: 7px;
          border-top-right-radius: 7px;
          border-color: #1D92F9;
        }
        
        .quill-wrapper .ql-container {
          border-color: #1D92F9;
          min-height: 120px;
        }
        
        .quill-wrapper .ql-editor {
          min-height: 120px;
          background: transparent;
        }
        
        .quill-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        /* Dark mode styling */
        .dark .quill-wrapper .ql-toolbar {
          background: #374151;
          border-color: #1D92F9;
        }
        
        .dark .quill-wrapper .ql-container {
          background: #374151;
          color: white;
          border-color: #1D92F9;
        }
        
        .dark .quill-wrapper .ql-editor {
          background: #374151;
          color: white;
        }
        
        .dark .quill-wrapper .ql-stroke {
          stroke: white;
        }
        
        .dark .quill-wrapper .ql-fill {
          fill: white;
        }
        
        .dark .quill-wrapper .ql-picker-label {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default FormEditPage;