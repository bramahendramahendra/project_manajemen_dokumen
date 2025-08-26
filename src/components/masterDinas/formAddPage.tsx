// pages/FormAddPage.tsx
import { useState } from 'react';
import { apiRequest } from "@/helpers/apiClient";
import SuccessModal from '@/components/modals/successModal';
import { useRouter } from "next/navigation";


const FormAddPage = () => {
  const Router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [dinas, setDinas] = useState('');

  const handleSuccessButtonClick = () => {
    setIsSuccessModalOpen(false);
    // Opsional: Navigasi ke halaman lain jika diperlukan
    Router.push('/master_dinas');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      dinas: dinas,
    };    

    try {
      const response = await apiRequest('/master_dinas/', 'POST', payload);

      if (response.ok) {
        setSuccess(true);
        // Tampilkan modal sukses
        setIsSuccessModalOpen(true);

        setDinas('');
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
                value={dinas}
                onChange={(e) => setDinas(e.target.value)}
                placeholder="Enter your dinas"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
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

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">Master dinas berhasil ditambahkan!</p>}  
          </div>
        </form>
      </div>

      {/* Success Modal Component */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        title="Berhasil!"
        message="Dinas baru telah berhasil ditambahkan ke dalam sistem."
        buttonText="Kembali ke Halaman Utama"
        onButtonClick={handleSuccessButtonClick}
      />
    </div>
  );
};

export default FormAddPage;