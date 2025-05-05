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
  const [department, setDepartment] = useState<number>(0);
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [accessUser, setAccessUser] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [optionOfficials, setOptionOfficials] = useState<any[]>([]);
  const [optionRoles, setOptionRoles] = useState<any[]>([]);
 
  useEffect(() => {
    const fetchOfficials = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest("/officials/", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Officials data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        const fetchedOfficials = result.responseData.items.map((item: any) => ({
          id: item.id,
          dinas: item.dinas,
        }));

        setOptionOfficials(fetchedOfficials);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Roles data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficials();
  }, []);

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

        setOptionRoles(fetchedRoles);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Roles data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const selectedDepartment = optionOfficials.find((opt) => opt.id === department);

    const payload = {
      firstname: firstName,
      lastname: lastName,
      username: username,
      email,
      department_id: department,
      department_name: selectedDepartment?.dinas || "",
      responsible_person: responsiblePerson,
      level_id: accessUser,
      password: password,
    };

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
        setDepartment(0);
        setResponsiblePerson('');
        setAccessUser('');
        setPassword('');
        setIsDefaultPassword(false);
      } else {
        const result = await response.json();
        setError(result.message || 'Terjadi kesalahan saat menambahkan user');
      }
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mengirim data');
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
                  placeholder="Enter your first name"
                  className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
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
                  placeholder="Enter your last name"
                  className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
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
                placeholder="Enter your Username"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
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
                placeholder="Enter your email address"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            {/* Nama Dinas */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Nama Dinas
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(Number(e.target.value))}
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              >
                <option value={0} disabled>Pilih Dinas</option> 
                {optionOfficials.length > 0 ? (
                  optionOfficials.map((option, index) => (
                    <option key={index} value={option.id}>
                      {option.dinas}
                    </option>
                  ))
                ) : (
                  <option value="all" disabled>Loading dinas...</option>
                )}
              </select>
            </div>
            {/* Penanggung Jawab */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Penanggung Jawab
              </label>
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder="Enter your penanggung jawab"
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>
            {/* Access User */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Access User
              </label>
              <select
                value={accessUser}
                onChange={(e) => setAccessUser(e.target.value)}
                className="w-full rounded-[7px]  bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
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
            {/* Password */}
            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Password
              </label>
              <input
                type="text"
                placeholder="Enter your password"
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
              {/* Tambah User Baru */}
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