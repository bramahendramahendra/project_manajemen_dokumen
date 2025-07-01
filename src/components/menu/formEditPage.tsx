"use client";
import { useState, useEffect } from 'react';
import { apiRequest } from "@/helpers/apiClient";
import { Jenis, Status } from "@/utils/enums";
import SuccessModalMenu from '../modals/successModalMenu';

const FormEditUser = ({ dataEdit }: { dataEdit?: any }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [code, setCode] = useState('');
  const [codeParent, setCodeParent] = useState('');
  const [icon, setIcon] = useState('');
  const [menu, setMenu] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [urutan, setUrutan] = useState('');
  const [type, setType] = useState('0');
  const [status, setStatus] = useState('1');

  const [inputIcon, setInputIcon] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    buttonText: '',
    status: 'success' as 'success' | 'error'
  });

  const options = {
    jenis: [
      { value: Jenis.Free, label: 'Free' },
      { value: Jenis.Pro, label: 'Pro' },
    ],

    status: [
      { value: Status.TidakAktif, label: 'Tidak Aktif' },
      { value: Status.Aktif, label: 'Aktif' },
    ],
  };

  useEffect(() => {
    if (dataEdit) {
      setCode(dataEdit.code || '');
      setCodeParent(dataEdit.code_parent || '');
      setIcon(dataEdit.icon || '');
      setMenu(dataEdit.menu || '');
      setUrl(dataEdit.url || '');
      setDescription(dataEdit.description || '');
      setUrutan(dataEdit.urutan || '');
      setType(dataEdit.type || '0');
      setStatus(dataEdit.status || '0');
      setInputIcon(!dataEdit.icon);
    }
  }, [dataEdit]);

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSuccessButtonClick = () => {
    setModalOpen(false);
    // Jika perlu, lakukan navigasi atau tindakan lain setelah sukses
  };

  const handleFailureButtonClick = () => {
    setModalOpen(false);
    // Tetap di halaman yang sama dengan form tetap terisi
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      code,
      code_parent: codeParent,
      icon,
      menu,
      url,
      description,
      urutan,
      pro:type,
      notif: "0",
      status
    };

    try {
      const response = await apiRequest(`/menus/${dataEdit.code}`, 'PUT', payload);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Terjadi kesalahan saat menyimpan perubahan');
      }

      setSuccess(true);
      
      // Tampilkan modal sukses
      setModalData({
        title: 'Perubahan Berhasil Disimpan!',
        message: 'Data menu telah berhasil diperbarui.',
        buttonText: 'Kembali',
        status: 'success'
      });
      setModalOpen(true);
      
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mengirim data');
      
      // Tampilkan modal error
      setModalData({
        title: 'Gagal Menyimpan Perubahan!',
        message: error.message || 'Terjadi kesalahan saat menyimpan perubahan.',
        buttonText: 'Coba Lagi',
        status: 'error'
      });
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 font-medium text-dark dark:text-white">
        Untuk Edit Menu, silahkan edit berdasarkan form dibawah ini
      </h4>
      <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
              {/* Code */}
              <div className="w-full xl:w-1/2">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your code"
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
              {/* Code Parent */}
              <div className="w-full xl:w-1/2">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Code Parent
                </label>
                <input
                  type="text"
                  value={codeParent}
                  onChange={(e) => setCodeParent(e.target.value)}
                  placeholder="Enter your code parent"
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            {/* Icon */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Icon
              </label>
              <div className="mb-2 flex items-center gap-2">
                <input
                  id="tanpa-icon"
                  type="checkbox"
                  checked={inputIcon}
                  onChange={(e) => {
                    setInputIcon(e.target.checked);
                    if (e.target.checked) {
                      setIcon('');
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="tanpa-icon" className="text-sm font-medium text-dark dark:text-white">
                  Tanpa Icon
                </label>
              </div>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Enter your icon"
                className={`w-full rounded-[7px] px-5 py-3 transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary 
                  ${inputIcon 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                    : 'bg-transparent text-dark dark:text-white'}`}
                disabled={inputIcon}
              />
            </div>
            {/* Menu */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Menu
              </label>
              <input
                type="text"
                value={menu}
                onChange={(e) => setMenu(e.target.value)}
                placeholder="Enter your menu"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>
            {/* URL */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your url"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>
            {/* Desc  */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Deskripsi 
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Enter your description"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
              {/* Urutan  */}
              <div className="w-full xl:w-1/2">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Urutan 
                </label>
                <input
                  type="text"
                  value={urutan}
                  onChange={(e) => setUrutan(e.target.value)}
                  placeholder="Enter your urutan"
                  className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
              {/* Jenis  */}
              <div className="w-full xl:w-1/3">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Jenis
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                >
                  {options.jenis.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Status  */}
              <div className="w-full xl:w-1/3">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                >
                  {options.status.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 p-[13px] font-medium text-white hover:bg-opacity-90"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Modal */}
      <SuccessModalMenu
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalData.title}
        message={modalData.message}
        buttonText={modalData.buttonText}
        onButtonClick={modalData.status === 'success' ? handleSuccessButtonClick : handleFailureButtonClick}
        status={modalData.status}
      />
    </div>
  );
};

export default FormEditUser;