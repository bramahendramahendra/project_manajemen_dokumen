import { useState, useEffect } from 'react';
import { apiRequest } from "@/helpers/apiClient";

const FormEditPage = ({ dataEdit }: { dataEdit?: any }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [perihal, setPerihal] = useState('');
  const [subperihal, setSubperihal] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const [optionPerihal, setOptionPerihal] = useState<any[]>([]);

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
          perihal: item.jenis,
          nama_perihal: item.nama_jenis,
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
      const response = await apiRequest(`/master_subperihal/${dataEdit.id}`, 'PUT', payload);
      const result = await response.json();

       if (response.ok) {
        setSuccess(true);
        setPerihal('');
        setSubperihal('');
        setDeskripsi('');
      } else {
        throw new Error(result.responseDesc || 'Terjadi kesalahan saat menyimpan perubahan subperihal');
      }

      setSuccess(true);
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
            {/* Jenis */}
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
            {/* Deskripsi */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Deskripsi
              </label>
              <input
                type="text"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Enter your deskripsi"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>

            {/* Subjenis */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Subjenis
              </label>
              <input
                type="text"
                value={subperihal}
                onChange={(e) => setSubperihal(e.target.value)}
                placeholder="Enter your subjenis"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>

            <button 
              type="submit"
              className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 p-[13px] font-medium text-white hover:bg-opacity-90"
              disabled={loading}
            >
              {/* Update User */}
              {loading ? 'Menambahkan...' : 'Simpan Perubahan'}
            </button>

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">Master subperihal berhasil update!</p>}  
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditPage;
