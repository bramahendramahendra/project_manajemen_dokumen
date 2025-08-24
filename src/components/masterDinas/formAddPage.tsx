// pages/FormAddPage.tsx
import { useState } from 'react';
import { apiRequest } from "@/helpers/apiClient";
import SuccessModalLink from '../modals/successModalLink';

const FormAddPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Ganti dari showSuccessPopup

  const [official, setOfficial] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      dinas: official,
    };    

    try {
      const response = await apiRequest('/master_dinas/', 'POST', payload);

      if (response.ok) {
        setIsSuccessModalOpen(true); // Ganti dari setShowSuccessPopup
        setOfficial(''); // Reset form
      } else {
        const result = await response.json();
        setError(result.message || 'Terjadi kesalahan saat menambahkan dinas');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengirim data');
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk menutup modal
  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <>
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Untuk menambahkan Dinas, lakukan inputan data dengan benar dibawah ini
        </h4>
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              {/* Dinas */}
              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Dinas
                </label>
                <input
                  type="text"
                  value={official}
                  onChange={(e) => setOfficial(e.target.value)}
                  placeholder="Masukkan nama dinas"
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
             
              <button 
                type="submit"
                className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 p-[13px] font-medium text-white hover:bg-opacity-90"
                disabled={loading}
              >
                {loading ? 'Menambahkan...' : 'Tambah Dinas Baru'}
              </button>

              {/* Error Message */}
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </form>
        </div>
      </div>

      {/* SuccessModalLink Component */}
      <SuccessModalLink
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        title="Berhasil!"
        message="Master dinas berhasil ditambahkan ke dalam sistem."
        showTwoButtons={true}
        primaryButtonText="Lihat Master Dinas"
        secondaryButtonText="Tambah Dinas Lagi"
        redirectPath="/master_dinas"
      />
    </>
  );
};

export default FormAddPage;