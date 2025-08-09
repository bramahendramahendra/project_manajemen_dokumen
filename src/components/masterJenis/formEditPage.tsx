import { useState, useEffect } from 'react';
import { apiRequest } from "@/helpers/apiClient";

const FormEditPage = ({ dataEdit }: { dataEdit?: any }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [type, setType] = useState('');
  const [accessUsers, setAccessUsers] = useState<string[]>([]);

  const [roles, setRoles] = useState<any[]>([]);
  const [maxRoles, setMaxRoles] = useState(0);

  // console.log(dataEdit);
  
  useEffect(() => {
    const fetchRoles = async () => {
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

        setRoles(fetchedRoles);
        setMaxRoles(result.responseMeta.total_records);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Roles data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (dataEdit) {
      setType(dataEdit.nama_jenis || '');
      // console.log("Access User Data: ", dataEdit.roles);
      // setAccessUsers(dataEdit.roles || []);
      const userRoles = dataEdit.roles || [];
      const userAccessLevels = userRoles.map((role: any) => role.level_id); // Ambil level_id dari data roles
      setAccessUsers(userAccessLevels);
    }
  }, [dataEdit]);
  
  const addAccessUser = () => {
    if (accessUsers.length >= maxRoles) {
      setError(`Jumlah Access User tidak boleh lebih dari ${maxRoles}`);
      return;
    }
    setAccessUsers([...accessUsers, '']);
  };
  
  const removeAccessUser = (index: number) => {
    const updatedUsers = [...accessUsers];
    updatedUsers.splice(index, 1);
    setAccessUsers(updatedUsers);
  };
  
  const handleAccessUserChange = (index: number, value: string) => {
    const updatedUsers = [...accessUsers];
    updatedUsers[index] = value;
    setAccessUsers(updatedUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const cleanedAccessUsers = accessUsers.filter((id) => id !== '');

    const isDuplicate = new Set(cleanedAccessUsers).size !== cleanedAccessUsers.length;
    if (isDuplicate) {
      setError('Terdapat Access User yang sama. Mohon periksa kembali.');
      setLoading(false);
      return;
    }

    const payload = {
      jenis: type,
      level: cleanedAccessUsers,
    };

    try {
      const response = await apiRequest(`/master_jenis/update/${dataEdit.jenis}`, 'POST', payload);
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
        Untuk Edit Jenis, silahkan edit berdasarkan form dibawah ini
      </h4>
      <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            {/* Jenis */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Jenis
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Enter your jenis"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            {/* Access User */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Access User
              </label>
              {accessUsers.map((value, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <select
                    value={value}
                    onChange={(e) => handleAccessUserChange(index, e.target.value)}
                    className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="" disabled>Pilih Access User</option>
                    {roles.map((role, idx) => (
                      <option key={idx} value={role.level_id}>
                        {role.role}
                      </option>
                    ))}
                  </select>

                  {accessUsers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAccessUser(index)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addAccessUser}
                className={`mt-2 text-blue-600 text-sm hover:underline ${accessUsers.length >= maxRoles ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={accessUsers.length >= maxRoles}
              >
                + Tambah Access User
              </button>
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
            {success && <p className="text-green-500 mt-2">Setting jenis berhasil update!</p>}  
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditPage;
