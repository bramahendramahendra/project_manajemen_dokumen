"use client"

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from "@/helpers/apiClient";
import { 
  FaUser, 
  FaEnvelope, 
  FaBuilding, 
  FaUserTie, 
  FaShieldAlt, 
  FaCheck,
  FaLock, 
  FaPhone
} from 'react-icons/fa';
import SuccessModal from '../modals/successModal';
import ConfirmationModal from '../modals/confirmationModal';
import Cookies from "js-cookie";

type ProfileAkses = {
  menu: string;
};

const MainPage = () => {
  // Profile states
  const [userid, setUserid] = useState('');
  const [fullname, setFullname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dinas, setDinas] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileAkses, setProfileAkses] = useState<ProfileAkses[]>([]);
  
  // Phone update states
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Password update states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPhoneConfirmModalOpen, setIsPhoneConfirmModalOpen] = useState(false);
  const [isPhoneSuccessModalOpen, setIsPhoneSuccessModalOpen] = useState(false);

  const fetchAksesData = useCallback(async (level: string) => {
    try {
      const response = await apiRequest(`/profile/akses/${level}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data akses tidak ditemukan");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.responseCode === 200) {
        const documents: ProfileAkses[] = result.responseData.items.map((item: any) => ({
          menu: item.menu,
        }));
        setProfileAkses(documents);
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data akses");
      }
    } catch (err: any) {
      console.error("Error fetching akses data:", err);
      setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(Cookies.get("user") || "{}");

      if (!user.userid) {
        throw new Error("User ID tidak ditemukan");
      }

      const response = await apiRequest(`/profile/${user.userid}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User tidak ditemukan");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.responseCode === 200) {
        const profileData = result.responseData;
        
        setUserid(profileData.userid || '');
        setFullname(profileData.fullname || '');
        setFirstName(profileData.firstname || '');
        setLastName(profileData.lastname || '');
        setUsername(profileData.username || '');
        setPhoneNumber(profileData.phone_number || '');
        setEmail(profileData.email || '');
        setDinas(profileData.dinas || '');
        setResponsiblePerson(profileData.responsible_person || '');
        setRole(profileData.role || '');

        // Fetch akses data setelah mendapat level
        if (profileData.level) {
          await fetchAksesData(profileData.level);
        }
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data user");
      }
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAksesData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Phone number validation
  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'Nomor telepon tidak boleh kosong';
    }
    
    if (phone.length < 8 || phone.length > 20) {
      return 'Nomor telepon harus 8-20 karakter';
    }

    // Regex untuk format Indonesia: +62, 62, atau 0 diikuti 8-15 digit
    const phoneRegex = /^(\+62|62|0)([0-9]{8,15})$/;
    if (!phoneRegex.test(phone)) {
      return 'Format nomor telepon tidak valid. Gunakan format +62, 62, atau 0 diikuti 8-15 digit';
    }

    if (phone === phoneNumber) {
      return 'Nomor telepon baru sama dengan nomor telepon saat ini';
    }

    return null;
  };

  // Password validation
  const validatePassword = (pwd: string): string | null => {
    if (!pwd) {
      return 'Password tidak boleh kosong';
    }
    
    if (pwd.length < 8) {
      return 'Password minimal 8 karakter';
    }

    // Check for at least one uppercase, lowercase, and number
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return 'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka';
    }

    return null;
  };

  // Phone number handlers
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPhoneNumber(value);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError(null);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePhoneNumber(newPhoneNumber);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    setIsPhoneConfirmModalOpen(true);
  };

  const confirmPhoneChange = async () => {
    setIsPhoneConfirmModalOpen(false);
    setPhoneLoading(true);
    
    const payload = {
      phone_number: newPhoneNumber,
    };

    try {
      const response = await apiRequest(`/profile/phone/${userid}`, 'POST', payload);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Terjadi kesalahan saat menyimpan perubahan nomor telepon');
      }

      if (result.responseCode === 200) {
        // Update state nomor telepon
        setPhoneNumber(newPhoneNumber);
        
        // Reset form dan error
        setNewPhoneNumber('');
        setPhoneError(null);
        
        // Tampilkan modal sukses
        setIsPhoneSuccessModalOpen(true);
      } else {
        throw new Error(result.responseDesc || 'Gagal memperbarui nomor telepon');
      }
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      setPhoneError(error.message || 'Terjadi kesalahan saat mengirim data');
    } finally {
      setPhoneLoading(false);
    }
  };

  // Password handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setPasswordError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setIsConfirmModalOpen(true);
  };
  
  const confirmPasswordChange = async () => {
    setIsConfirmModalOpen(false);
    setPasswordLoading(true);
    
    const payload = {
      password,
    };

    try {
      // Update endpoint path to match backend route
      const response = await apiRequest(`/profile/update/${userid}`, 'POST', payload);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Terjadi kesalahan saat menyimpan perubahan');
      }

      if (result.responseCode === 200) {
        // Reset form dan error
        setPassword('');
        setConfirmPassword('');
        setPasswordError(null);
        
        // Tampilkan modal sukses
        setIsSuccessModalOpen(true);
      } else {
        throw new Error(result.responseDesc || 'Gagal memperbarui password');
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Terjadi kesalahan saat mengirim data');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // Modal handlers
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };
  
  const closePhoneConfirmModal = () => {
    setIsPhoneConfirmModalOpen(false);
  };
  
  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const closePhoneSuccessModal = () => {
    setIsPhoneSuccessModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0C479F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl shadow-md">
        <div className="text-red-800 text-center">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={fetchUserData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* User Profile Header */}
        <div className="bg-gradient-to-r from-[#0C479F]/5 to-[#1D92F9]/5 p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-[#0C479F] to-[#1D92F9] h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl mr-4">
              {firstName?.charAt(0) || ''}{lastName?.charAt(0) || ''}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{fullname}</h3>
              <p className="text-gray-500">{userid}</p>
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
                    <p className="text-xs text-gray-500 font-medium">Username</p>
                    <p className="text-gray-800 font-medium">{username}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#1D92F9]/10 p-2 rounded-lg mr-3">
                    <FaPhone className="text-[#1D92F9]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Nomor Telepon</p>
                    <p className="text-gray-800 font-medium">{phoneNumber}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#0C479F]/10 p-2 rounded-lg mr-3">
                    <FaShieldAlt className="text-[#0C479F]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Role</p>
                    <p className="text-gray-800 font-medium">{role}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
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
                    <p className="text-xs text-gray-500 font-medium">Dinas</p>
                    <p className="text-gray-800 font-medium">{dinas}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-[#1D92F9]/10 p-2 rounded-lg mr-3">
                    <FaUserTie className="text-[#1D92F9]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Penanggung Jawab</p>
                    <p className="text-gray-800 font-medium">{responsiblePerson}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Phone Number Form */}
        <div className="p-6 border-t border-gray-100">
          <h4 className="text-lg font-medium mb-4 text-gray-700">Ubah Nomor Telepon</h4>
          
          <form onSubmit={handlePhoneSubmit} className="space-y-6 max-w-xl mx-auto">
            {phoneError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {phoneError}
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-[#1D92F9]/10 p-2 rounded-lg mr-3">
                  <FaPhone className="text-[#1D92F9]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Nomor Telepon Saat Ini</p>
                  <p className="text-gray-800 font-medium">{phoneNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-[#0C479F]/10 p-2 rounded-lg mr-3">
                  <FaPhone className="text-[#0C479F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Nomor Telepon Baru</p>
                </div>
              </div>
              
              <input
                type="tel"
                value={newPhoneNumber}
                onChange={handlePhoneNumberChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D92F9] focus:border-transparent"
                placeholder="Masukkan nomor telepon baru (contoh: +6281234567890)"
                required
                disabled={phoneLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Format: +62, 62, atau 0 diikuti dengan 8-15 digit angka</p>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={phoneLoading}
                className="bg-gradient-to-r from-[#1D92F9] to-[#0C479F] text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phoneLoading ? 'Memproses...' : 'Ubah Nomor Telepon'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Form */}
        <div className="p-6 border-t border-gray-100">
          <h4 className="text-lg font-medium mb-4 text-gray-700">Ubah Password</h4>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl mx-auto">
            {passwordError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {passwordError}
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
                  disabled={passwordLoading}
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={passwordLoading}
                >
                  {passwordVisible ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka</p>
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
                  disabled={passwordLoading}
                />
                <button 
                  type="button" 
                  onClick={toggleConfirmPasswordVisibility} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={passwordLoading}
                >
                  {confirmPasswordVisible ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={passwordLoading}
                className="bg-gradient-to-r from-[#0C479F] to-[#1D92F9] text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? 'Memproses...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
        
        {/* User Permissions */}
        <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-[#0C479F]/5 to-[#1D92F9]/5">
          <h4 className="text-lg font-medium mb-4 text-gray-700">Akses & Hak Istimewa</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileAkses.map((permission, index) => (
              <div key={index} className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-3 flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0C479F] to-[#1D92F9] flex items-center justify-center mr-3">
                  <FaCheck className="text-white text-xs" />
                </div>
                <span className="text-gray-700">{permission.menu}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal Konfirmasi Phone */}
      <ConfirmationModal
        isOpen={isPhoneConfirmModalOpen}
        onClose={closePhoneConfirmModal}
        onConfirm={confirmPhoneChange}
        title="Konfirmasi Perubahan"
        message={`Apakah Anda yakin ingin mengubah nomor telepon dari ${phoneNumber} menjadi ${newPhoneNumber}?`}
        confirmText="Ya, Ubah"
        cancelText="Batal"
      />
      
      {/* Modal Success Phone */}
      <SuccessModal
        isOpen={isPhoneSuccessModalOpen}
        onClose={closePhoneSuccessModal}
        title="Berhasil!"
        message="Nomor telepon berhasil diubah"
        buttonText="OK"
        onButtonClick={closePhoneSuccessModal}
      />
      
      {/* Modal Konfirmasi Password */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmPasswordChange}
        title="Konfirmasi Perubahan"
        message="Apakah Anda yakin ingin mengubah password?"
        confirmText="Ya, Ubah"
        cancelText="Batal"
      />
      
      {/* Modal Success Password */}
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