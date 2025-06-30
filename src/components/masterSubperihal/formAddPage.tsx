import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { apiRequest } from "@/helpers/apiClient";

// Import ReactQuill secara dynamic untuk menghindari SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

// Import styles untuk ReactQuill
import 'react-quill/dist/quill.snow.css';

const FormAddPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

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
      const response = await apiRequest('/master_subperihal/', 'POST', payload);

      if (response.ok) {
        setSuccess(true);
        setPerihal('');
        setSubperihal('');
        setDeskripsi('');
      } else {
        const result = await response.json();
        setError(result.message || 'Terjadi kesalahan saat menambahkan subperihal');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengirim data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 font-medium text-dark dark:text-white">
        Untuk menambahkan Subperihal, lakukan inputan data dengan benar dibawah ini
      </h4>
      <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            {/* Perihal */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Perihal
              </label>
              <select
                value={perihal}
                onChange={(e) => setPerihal(e.target.value)}
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              >
                <option value="" disabled>Pilih Perihal</option> 
                {optionPerihal.length > 0 ? (
                  optionPerihal.map((item, index) => (
                    <option key={index} value={item.perihal}>
                      {item.nama_perihal}
                    </option>
                  ))
                ) : (
                  <option value="all" disabled>Loading Perihal...</option>
                )}
              </select>
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
                placeholder="Enter your subjenis"
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
              {loading ? 'Menambahkan...' : 'Tambah Subjenis Baru'}
            </button>

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">Master subperihal berhasil ditambahkan!</p>}  
          </div>
        </form>
      </div>

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

export default FormAddPage;