import { useState, useEffect } from 'react';
import { apiRequest } from "@/helpers/apiClient";

const FormEditPage = ({ dataEdit }: { dataEdit?: any }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [codeMenu, setCodeMenu] = useState('');
  const [accessUser, setAccessUser] = useState('');

  const [optionRoles, setOptionRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchDataOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest("/user_roles/", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Roles data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        const fetchedRoles = result.responseData.items.map((item: any) => ({
          level_id: item.level_id,
          role: item.role,
        }));

        setOptionRoles(fetchedRoles);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Roles data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataOptions();
  }, []);

  useEffect(() => {
    if (dataEdit) {
      setCodeMenu(dataEdit.code_menu || '');
      setAccessUser(dataEdit.level_id || '');
    }
  }, [dataEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      code_menu: codeMenu,
      level_id: accessUser,
      status: "1",
    };

    try {
      const response = await apiRequest(`/access_menus/${dataEdit.level_id}/${dataEdit.code_menu}`, 'PUT', payload);
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
            {/* Code Menu  */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Code Menu 
              </label>
              <input
                type="text"
                value={codeMenu}
                onChange={(e) => setCodeMenu(e.target.value)}
                placeholder="Enter your code menu"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            {/* Access Menu  */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Access Menu 
              </label>
              <select
                value={accessUser}
                onChange={(e) => setAccessUser(e.target.value)}
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              >
                <option value="" disabled>Pilih Access User</option> 
                {optionRoles.length > 0 ? (
                  optionRoles.map((item, index) => (
                    <option key={index} value={item.level_id}>
                      {item.role}
                    </option>
                  ))
                ) : (
                  <option value="all" disabled>Loading roles...</option>
                )}
              </select>
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

export default FormEditPage;
