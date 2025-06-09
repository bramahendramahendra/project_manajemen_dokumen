import { useState, useEffect } from 'react';
import { apiRequest } from "@/helpers/apiClient";
import { FaUser, FaEnvelope, FaBuilding, FaUserTie, FaShieldAlt, FaCheck } from 'react-icons/fa';

type ProfileAkses = {
  menu: string;
};

type SummaryActivity = {
  name: string;
  totalValidasiPending: number;
  totalValidasiDone: number;
  lastLogin: string;
  hariTerakhirLogin: number;
};

const FormDetailUser = ({ user }: { user?: any }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [accessUser, setAccessUser] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [profileAkses, setProfileAkses] = useState<ProfileAkses[]>([]);
  const [summaryActivity, setSummaryActivity] = useState<SummaryActivity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // const [optionOfficials, setOptionOfficials] = useState<any[]>([]);
  // const [optionRoles, setOptionRoles] = useState<any[]>([]);

  // Fungsi untuk menghitung hari terakhir login
  const calculateDaysFromLastLogin = (lastLoginDate: string): number => {
    const lastLogin = new Date(lastLoginDate);
    const today = new Date();
    const timeDiff = today.getTime() - lastLogin.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  // useEffect(() => {
  //   const fetchDinas = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const response = await apiRequest("/officials/", "GET");
  //       if (!response.ok) {
  //         if (response.status === 404) {
  //           throw new Error("Officials data not found");
  //         }
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const result = await response.json();

  //       const fetchedOfficials = result.responseData.items.map((item: any) => ({
  //         id: item.id,
  //         dinas: item.dinas,
  //       }));

  //       setOptionOfficials(fetchedOfficials);
  //     } catch (err: any) {
  //       setError(err.message === "Failed to fetch" ? "Officials data not found" : err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDinas();
  // }, []);
  
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
  }, []);

  const fetchAksesData = async (level: string) => {
    try {
      const response = await apiRequest(`/profile/akses/${level}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Access data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      const documents: ProfileAkses[] = result.responseData.items.map((item: any) => ({
        menu: item.menu,
      }));

      setProfileAkses(documents);
      
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
    }
  };

  const fetchActivityData = async (userid: string) => {
    setLoadingActivity(true);
    try {
      const response = await apiRequest(`/users/summary-activity/${userid}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Activity data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Sesuai dengan struktur response API yang diberikan
      const activityData = result.responseData;
      const hariTerakhirLogin = calculateDaysFromLastLogin(activityData.last_login);

      const activity: SummaryActivity = {
        name: activityData.name,
        totalValidasiPending: activityData.total_validasi_pending,
        totalValidasiDone: activityData.total_validasi_done,
        lastLogin: activityData.last_login,
        hariTerakhirLogin: hariTerakhirLogin
      };

      setSummaryActivity(activity);
      
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Data aktivitas tidak ditemukan" : err.message);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.firstname || user.name?.split(' ')[0] || '');
      setLastName(user.lastname || user.name?.split(' ')[1] || '');
      setUsername(user.username);
      setEmail(user.email || '');
      setDepartment(user.nama_dinas || '');
      setResponsiblePerson(user.responsible_person || '');
      setAccessUser(user.level_id || '');

      console.log(user);

      if (user.level_id) {
        fetchAksesData(user.level_id);
      }
      if (user.userid) {
        fetchActivityData(user.userid);
      }
    }
  }, [user]);

  // Mendapatkan nama role dari level_id
  const getRoleName = (levelId: string) => {
    const role = roles.find(r => r.level_id === levelId);
    return role ? role.role : 'Unknown Role';
  };

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0C479F] to-[#1D92F9] bg-clip-text text-transparent">
          {/* Detail User */}
        </h2>
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
                    <p className="text-gray-800 font-medium">{department}</p>
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
      
      {/* Activity Summary - Updated with real data */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
        <h4 className="text-lg font-medium mb-4 text-gray-700">Ringkasan Aktivitas</h4>
        
        {loadingActivity ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C479F]"></div>
            <span className="ml-2 text-gray-500">Memuat data aktivitas...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : summaryActivity ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#0C479F]">
                {summaryActivity.totalValidasiPending}
              </p>
              <p className="text-sm text-gray-500">Validasi Pending</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#1D92F9]">
                {summaryActivity.totalValidasiDone}
              </p>
              <p className="text-sm text-gray-500">Validasi Selesai</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#0C479F]">
                {summaryActivity.hariTerakhirLogin}
              </p>
              <p className="text-sm text-gray-500">Hari Terakhir Login</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">Data aktivitas tidak tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormDetailUser;