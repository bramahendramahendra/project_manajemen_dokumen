"use client"

import { useState, useEffect } from 'react';
import { apiRequest } from "@/helpers/apiClient";
import { 
  FaUser, 
  FaEnvelope, 
  FaBuilding, 
  FaUserTie, 
  FaShieldAlt, 
  FaCheck,
  FaLock 
} from 'react-icons/fa';
import SuccessModal from '../modals/successModal';
import ConfirmationModal from '../modals/confirmationModal';

const MainPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [accessUser, setAccessUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // State untuk modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Roles data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    // Simulasi data pengguna untuk demo
    // Dalam implementasi sebenarnya, Anda akan mengambil data dari API
    const userData = {
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      department_name: 'Dinas Pendidikan',
      responsible_person: 'Jane Smith',
      level_id: '1' // Misalnya, 1 untuk Admin
    };

    setFirstName(userData.firstname);
    setLastName(userData.lastname);
    setUsername(userData.username);
    setEmail(userData.email);
    setDepartmentName(userData.department_name);
    setResponsiblePerson(userData.responsible_person);
    setAccessUser(userData.level_id);
  };

  // Mendapatkan nama role dari level_id
  const getRoleName = (levelId: string) => {
    const role = roles.find(r => r.level_id === levelId);
    return role ? role.role : 'Unknown Role';
  };

  // Dummy user permissions for visual demo
  const userPermissions = [
    "Pengelolaan Data",
    "Validasi Dokumen",
    "Upload Dokumen",
    "Melihat Laporan",
    "Akses Dashboard"
  ];

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi password
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    // Jika valid, tampilkan modal konfirmasi
    setIsConfirmModalOpen(true);
  };
  
  // Fungsi untuk mengkonfirmasi perubahan password
  const confirmPasswordChange = () => {
    // Tutup modal konfirmasi
    setIsConfirmModalOpen(false);
    
    // Implementasi pengiriman data ke API
    console.log('Data siap dikirim:', {
      firstName,
      lastName,
      username,
      email,
      departmentName,
      responsiblePerson,
      accessUser,
      password
    });
    
    // Reset form dan error
    setPassword('');
    setConfirmPassword('');
    setError(null);
    
    // Tampilkan modal sukses
    setIsSuccessModalOpen(true);
  };
  
  // Fungsi untuk menutup modal konfirmasi
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };
  
  // Fungsi untuk menutup modal sukses
  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-1 rounded-full">
          <span className="text-white text-sm font-medium">{getRoleName(accessUser)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* User Profile Header */}
        <div className="bg-gradient-to-r from-[#0C479F]/5 to-[#1D92F9]/5 p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-[#0C479F] to-[#1D92F9] h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl mr-4">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{firstName} {lastName}</h3>
              <p className="text-gray-500">{username}</p>
            </div>
          </div>
        </div>

        {/* User Info Content */}
        <div className="p-6">
          <h4 className="text-lg font-medium mb-4 text-gray-700">Informasi Pengguna</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#0C479F]/10 p-2 rounded-lg mr-3">
                    <FaUser className="text-[#0C479F]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Nama Lengkap</p>
                    <p className="text-gray-800 font-medium">{firstName} {lastName}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#1D92F9]/10 p-2 rounded-lg mr-3">
                    <FaEnvelope className="text-[#1D92F9]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-gray-800 font-medium">{email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#0C479F]/10 p-2 rounded-lg mr-3">
                    <FaBuilding className="text-[#0C479F]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Nama Dinas</p>
                    <p className="text-gray-800 font-medium">{departmentName}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#1D92F9]/10 p-2 rounded-lg mr-3">
                    <FaUser className="text-[#1D92F9]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Username</p>
                    <p className="text-gray-800 font-medium">{username}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#0C479F]/10 p-2 rounded-lg mr-3">
                    <FaUserTie className="text-[#0C479F]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Penanggung Jawab</p>
                    <p className="text-gray-800 font-medium">{responsiblePerson}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#1D92F9]/10 p-2 rounded-lg mr-3">
                    <FaShieldAlt className="text-[#1D92F9]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Role</p>
                    <p className="text-gray-800 font-medium">{getRoleName(accessUser)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Password Form */}
        <div className="p-6 border-t border-gray-100">
          <h4 className="text-lg font-medium mb-4 text-gray-700">Ubah Password</h4>
          
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-[#0C479F]/10 p-2 rounded-lg mr-3">
                  <FaLock className="text-[#0C479F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Password Baru</p>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D92F9] focus:border-transparent"
                  placeholder="Masukkan password baru"
                  required
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {passwordVisible ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-[#1D92F9]/10 p-2 rounded-lg mr-3">
                  <FaLock className="text-[#1D92F9]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Konfirmasi Password</p>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D92F9] focus:border-transparent"
                  placeholder="Konfirmasi password baru"
                  required
                />
                <button 
                  type="button" 
                  onClick={toggleConfirmPasswordVisibility} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {confirmPasswordVisible ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#0C479F] to-[#1D92F9] text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
        
        {/* User Permissions */}
        <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-[#0C479F]/5 to-[#1D92F9]/5">
          <h4 className="text-lg font-medium mb-4 text-gray-700">Akses & Hak Istimewa</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPermissions.map((permission, index) => (
              <div key={index} className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-3 flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0C479F] to-[#1D92F9] flex items-center justify-center mr-3">
                  <FaCheck className="text-white text-xs" />
                </div>
                <span className="text-gray-700">{permission}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal Konfirmasi */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmPasswordChange}
        title="Konfirmasi Perubahan"
        message="Apakah Anda yakin ingin mengubah password?"
        confirmText="Ya, Ubah"
        cancelText="Batal"
      />
      
      {/* Modal Success */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title="Berhasil!"
        message="Password berhasil diubah"
        buttonText="OK"
        onButtonClick={closeSuccessModal}
      />
    </div>
  );
};

export default MainPage;