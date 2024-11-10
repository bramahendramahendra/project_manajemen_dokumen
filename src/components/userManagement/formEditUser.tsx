import { useState, useEffect } from 'react';

const FormEditUser = ({ user }: { user?: any }) => {
  const [password, setPassword] = useState('');
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);

  // Form field states, initialized with user data if available
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [skpd, setSkpd] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');

  // When the component mounts, populate fields with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.name.split(' ')[0]); // Assuming first part of name is firstName
      setLastName(user.name.split(' ')[1] || ''); // Assuming second part of name is lastName
      setUsername(user.username);
      setEmail(user.email);
      setSkpd(user.skpd);
      setPenanggungJawab(user.penanggungJawab || '');
    }
  }, [user]);

  const handleCheckboxChange = () => {
    setIsDefaultPassword(!isDefaultPassword);
    setPassword(!isDefaultPassword ? 'm@nAj3mendokumen' : '');
  };

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 font-medium text-dark dark:text-white">
        Untuk Edit User, silahkan edit berdasarkan form dibawah ini
      </h4>
      <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <form action="#">
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Nama Depan
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="w-full xl:w-1/2">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Username"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-[#a5a5a5] transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary disabled:cursor-default disabled:bg-gray-3"
                required
                disabled
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                required
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Nama Dinas
              </label>
              <input
                type="text"
                value={skpd}
                onChange={(e) => setSkpd(e.target.value)}
                placeholder="Enter your subject"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Penanggung Jawab
              </label>
              <input
                type="text"
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                placeholder="Enter your subject"
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>

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

            <button className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 p-[13px] font-medium text-white hover:bg-opacity-90">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditUser;
