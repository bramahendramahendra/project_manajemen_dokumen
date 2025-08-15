import { useState, useEffect } from 'react';
import { apiRequest } from "@/helpers/apiClient";
import SuccessModal from '../modals/successModal';

const FormAddUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState<number>(0);
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [accessUser, setAccessUser] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [optionOfficials, setOptionOfficials] = useState<any[]>([]);
  const [optionRoles, setOptionRoles] = useState<any[]>([]);
  const [loadingDinas, setLoadingDinas] = useState(false);

  // Fetch dinas berdasarkan level_id (DNS atau PGW)
  useEffect(() => {
    if ((accessUser === 'DNS' || accessUser === 'PGW') && optionOfficials.length === 0) {
      const fetchOfficials = async () => {
        setLoadingDinas(true);
        setError(null);
        try {
          // Fetch dinas berdasarkan level_id
          const response = await apiRequest(`/master_dinas/opt-dinas/${accessUser}`, "GET");
          if (!response.ok) {
            throw new Error("Data dinas tidak tersedia");
          }
          const result = await response.json();

          // Validasi struktur response
          if (!result || !result.responseData || !result.responseData.items || !Array.isArray(result.responseData.items)) {
            throw new Error("Data dinas tidak tersedia");
          }

          const fetchedOfficials = result.responseData.items.map((item: any) => ({
            id: item.dinas,
            dinas: item.nama_dinas,
          }));

          setOptionOfficials(fetchedOfficials);

          // Cek jika data dinas kosong setelah fetch
          if (fetchedOfficials.length === 0) {
            setError(`Data dinas untuk ${accessUser} tidak tersedia. Silakan pilih access user yang lain.`);
            setAccessUser(''); // Reset access user ke kosong
            setDepartment(0); // Reset department
          }
        } catch (err: any) {
          setError(`Data dinas untuk ${accessUser} tidak tersedia. Silakan pilih access user yang lain.`);
          setAccessUser(''); // Reset access user ke kosong jika terjadi error
          setDepartment(0); // Reset department
        } finally {
          setLoadingDinas(false);
        }
      };

      fetchOfficials();
    }
  }, [accessUser, optionOfficials.length]);

  // Fetch roles saat komponen mount
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest("/user_roles/", "GET");
        if (!response.ok) {
          throw new Error("Gagal memuat data roles");
        }
        const result = await response.json();

        // Validasi struktur response
        if (!result || !result.responseData || !result.responseData.items || !Array.isArray(result.responseData.items)) {
          throw new Error("Data roles tidak tersedia");
        }

        const fetchedRoles = result.responseData.items.map((item: any) => ({
          level_id: item.level_id,
          role: item.role,
        }));

        setOptionRoles(fetchedRoles);
      } catch (err: any) {
        setError("Gagal memuat data roles. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Function untuk mendapatkan dinas berdasarkan level_id
  const getDinasByLevelId = async (levelId: string) => {
    try {
      const response = await apiRequest(`/master_dinas/opt-dinas/${levelId}`, "GET");
      if (!response.ok) {
        throw new Error("Data dinas tidak tersedia");
      }
      const result = await response.json();
      
      if (result && result.responseData && result.responseData.items && result.responseData.items.length > 0) {
        console.log(result);
        return {
          dinas: result.responseData.items[0].dinas,
          nama_dinas: result.responseData.items[0].nama_dinas
        }; // Ambil dinas pertama untuk ADM/DEV
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching dinas for ${levelId}:`, error);
      return null;
    }
  };
  
  const handleCheckboxChange = () => {
    setIsDefaultPassword(!isDefaultPassword);
    setPassword(!isDefaultPassword ? 'm@nAj3mendokumen' : '');
  };

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleSuccessButtonClick = () => {
    setIsSuccessModalOpen(false);
    // Opsional: Navigasi ke halaman lain jika diperlukan
    // router.push('/users');
  };

  // Handle perubahan access user
  const handleAccessUserChange = (value: string) => {
    setError(null); // Clear error saat user mengubah access user
    setAccessUser(value);
    
    // Reset department ketika access user berubah
    if (value !== 'DNS' && value !== 'PGW') {
      setDepartment(0);
      setOptionOfficials([]); // Clear data dinas jika bukan DNS/PGW
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validasi tambahan untuk DNS dan PGW
    if ((accessUser === 'DNS' || accessUser === 'PGW') && (!department || department === 0)) {
      setError(`Silakan pilih nama dinas untuk ${accessUser} terlebih dahulu`);
      setLoading(false);
      return;
    }

    let finalDinas = 0;
    let finalNamaDinas = "";

    if (accessUser === 'DNS' || accessUser === 'PGW') {
      // Untuk DNS dan PGW, gunakan dinas yang dipilih
      const selectedDepartment = optionOfficials.find((opt) => opt.id === department);
      finalDinas = department;
      finalNamaDinas = selectedDepartment?.dinas || "";
    } else if (accessUser === 'ADM' || accessUser === 'DEV') {
      // Untuk ADM dan DEV, ambil dinas otomatis berdasarkan level_id
      const dinasData = await getDinasByLevelId(accessUser);
      if (dinasData) {
        finalDinas = dinasData.dinas;
        finalNamaDinas = dinasData.nama_dinas;
      } else {
        // Fallback ke role name jika tidak ada dinas
        const selectedRole = optionRoles.find((role) => role.level_id === accessUser);
        finalDinas = 0;
        finalNamaDinas = selectedRole?.role || "";
      }
    }

    const payload = {
      username: username,
      password: password,
      firstname: firstName,
      lastname: lastName,
      email,
      phone_number: phoneNumber,
      dinas: finalDinas,
      nama_dinas: finalNamaDinas,
      responsible_person: responsiblePerson,
      level_id: accessUser,
    };

    console.log(payload);
    
    try {
      const response = await apiRequest('/users/', 'POST', payload);

      if (response.ok) {
        setSuccess(true);
        // Tampilkan modal sukses
        setIsSuccessModalOpen(true);
        
        // Reset form fields
        setFirstName('');
        setLastName('');
        setUsername('');
        setEmail('');
        setPhoneNumber('');
        setDepartment(0);
        setResponsiblePerson('');
        setAccessUser('');
        setPassword('');
        setIsDefaultPassword(false);
        setOptionOfficials([]); // Clear data dinas
      } else {
        const result = await response.json();
        const errorMessage = result.message || result.responseDesc || 'Terjadi kesalahan saat menambahkan user';
        setError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message === "Failed to fetch" 
        ? "Gagal terhubung ke server. Silakan coba lagi." 
        : 'Terjadi kesalahan saat mengirim data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 font-medium text-dark dark:text-white">
        Untuk menambahkan User, lakukan inputan data dengan benar dibawah ini
      </h4>
      <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
              {/* Nama Depan */}
              <div className="w-full xl:w-1/2">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Nama Depan
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Masukkan nama depan"
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
              {/* Nama Belakang */}
              <div className="w-full xl:w-1/2">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Masukkan nama belakang"
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            {/* Username */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            {/* Email */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan alamat email"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            {/* Nomor Handphone */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Nomor Handphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const input = e.target.value;
                  if (/^(\+)?[0-9]*$/.test(input)) {
                    setPhoneNumber(input);
                  }
                }}
                placeholder="Masukkan nomor handphone"
                pattern="^\+?[0-9]{9,15}$"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            {/* Access User */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Access User
              </label>
              <select
                value={accessUser}
                onChange={(e) => handleAccessUserChange(e.target.value)}
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              >
                <option value="" disabled>Pilih Access User</option> 
                {optionRoles.length > 0 ? (
                  optionRoles.map((role, index) => (
                    <option key={index} value={role.level_id}>
                      {role.role}
                    </option>
                  ))
                ) : (
                  <option value="all" disabled>Loading roles...</option>
                )}
              </select>
            </div>
            {/* Nama Dinas - Hanya tampil ketika accessUser === 'DNS' atau 'PGW' */}
            {(accessUser === 'DNS' || accessUser === 'PGW') && (
              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Nama Dinas
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(Number(e.target.value))}
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value={0} disabled>Pilih Dinas</option> 
                  {loadingDinas ? (
                    <option value="" disabled>Memuat data dinas...</option>
                  ) : optionOfficials.length > 0 ? (
                    optionOfficials.map((option, index) => (
                      <option key={index} value={option.id}>
                        {option.dinas}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Data dinas kosong</option>
                  )}
                </select>
              </div>
            )}
            {/* Info untuk ADM dan DEV */}
            {(accessUser === 'ADM' || accessUser === 'DEV') && (
              <div className="mb-4.5 p-3 bg-blue-50 border border-blue-200 rounded-[7px] dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Info:</strong> Dinas untuk {accessUser} akan diisi otomatis berdasarkan level akses.
                </p>
              </div>
            )}
            {/* Penanggung Jawab */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Penanggung Jawab
              </label>
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder="Masukkan nama penanggung jawab"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>
            {/* Password */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Password
              </label>
              <input
                type="text"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="defaultPassword"
                  checked={isDefaultPassword}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label
                  htmlFor="defaultPassword"
                  className="text-body-sm font-medium text-dark dark:text-white"
                >
                  Gunakan password default / reset
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 p-[13px] font-medium text-white hover:bg-opacity-90"
              disabled={loading}
            >
              {loading ? 'Menambahkan...' : 'Tambah User Baru'}
            </button>

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">User berhasil ditambahkan!</p>}  
          </div>
        </form>
      </div>
      
      {/* SuccessModal Component */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        title="Berhasil!"
        message="User baru telah berhasil ditambahkan ke dalam sistem."
        buttonText="Kembali ke Halaman Utama"
        onButtonClick={handleSuccessButtonClick}
      />
    </div>
  );
};

export default FormAddUser;