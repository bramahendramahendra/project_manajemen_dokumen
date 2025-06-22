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
  // const [dataDetail, setDataDetail] = useState('');
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
  // const [level, setLevel] = useState('');
  const [profileAkses, setProfileAkses] = useState<ProfileAkses[]>([]); // Langsung gunakan data hardcode
  

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

  const fetchAksesData = useCallback(async (level : string) => {
    // Simulasi data pengguna untuk demo
    // Dalam implementasi sebenarnya, Anda akan mengambil data dari API
    try {
      const response = await apiRequest(`/profile/akses/${level}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Jenis data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      // console.log(result);

       const documents: ProfileAkses[] = result.responseData.items.map((item: any) => ({
          menu: item.menu,
        }));

        setProfileAkses(documents);
     
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    // Simulasi data pengguna untuk demo
    // Dalam implementasi sebenarnya, Anda akan mengambil data dari API
    try {
      const user = JSON.parse(Cookies.get("user") || "{}");

      // console.log(user);
      const response = await apiRequest(`/profile/${user.userid}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Jenis data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      // console.log(result.responseData);
     
      setUserid(result.responseData.userid);
      setFullname(result.responseData.fullname);
      setFirstName(result.responseData.firstname);
      setLastName(result.responseData.lastname);
      setUsername(result.responseData.username);
      setPhoneNumber(result.responseData.phone_number);
      setEmail(result.responseData.email);
      setDinas(result.responseData.dinas);
      setResponsiblePerson(result.responseData.responsible_person);
      setRole(result.responseData.role);
      // setLevel(result.responseData.level);

      // Panggil fetchAksesData setelah level di-set
      if(result.responseData.level) {
        await fetchAksesData(result.responseData.level);
      }
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAksesData]);

  useEffect(() => {
    // fetchRoles();
    fetchUserData();
    // if(level) fetchAksesData(level);
  }, [fetchUserData]);

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
  const confirmPasswordChange = async() => {
    // e.preventDefault();
    // Tutup modal konfirmasi
    setIsConfirmModalOpen(false);
    
    // Implementasi pengiriman data ke API
    console.log('Data siap dikirim:', {
      // firstName,
      // lastName,
      // username,
      // email,
      // dinas,
      // responsiblePerson,
      // role,
      password,
      confirmPassword
    });

    const payload = {
      password,
    };

    try {
      const response = await apiRequest(`/profile/${userid}`, 'PUT', payload);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Terjadi kesalahan saat menyimpan perubahan');
      }

      // Reset form dan error
      setPassword('');
      setConfirmPassword('');
      setError(null);
      
      // Tampilkan modal sukses
      setIsSuccessModalOpen(true);
      // setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mengirim data');
    } finally {
      setLoading(false);
    }
    
 
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
      {/* <div className="flex justify-between items-center mb-8">
        <div className="bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-1 rounded-full">
          <span className="text-white text-sm font-medium">{role}</span>
        </div>
      </div> */}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* User Profile Header */}
        <div className="bg-gradient-to-r from-[#0C479F]/5 to-[#1D92F9]/5 p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-[#0C479F] to-[#1D92F9] h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl mr-4">
              {firstName.charAt(0)}{lastName.charAt(0)} 
              
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