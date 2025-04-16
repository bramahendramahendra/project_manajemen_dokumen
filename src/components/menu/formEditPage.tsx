import { useState, useEffect } from 'react';
import { apiRequest } from "@/helpers/apiClient";
import { Jenis, Status } from "@/utils/enums";

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
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

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
      setCode(dataEdit.firstname || '');
      setCodeParent(dataEdit.lastname || '');
      setIcon(dataEdit.username || '');
      setMenu(dataEdit.email || '');
      setUrl(dataEdit.department_name || '');
      setDescription(dataEdit.responsible_person || '');
      setUrutan(dataEdit.level_id || '');
      setType(dataEdit.level_id || '');
      setStatus(dataEdit.level_id || '');
    }
  }, [dataEdit]);

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
      type,
      status
    };

    try {
      const response = await apiRequest(`/menus/${dataEdit.code}`, 'PUT', payload);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Terjadi kesalahan saat menyimpan perubahan');
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
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Enter your icon"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-[#a5a5a5] transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary disabled:cursor-default disabled:bg-gray-3"
                required
                disabled
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
              {/* Update User */}
              {loading ? 'Menambahkan...' : 'Simpan Perubahan'}
            </button>

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">User berhasil update!</p>}  
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditUser;
