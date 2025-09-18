import { TempUser } from "@/types/user";

const userData: TempUser[] = [
  {
    userid: "M00001",
    username: "freepackage",
    name: "Free package",
    level_id: "1",
    role: "Admin",
  },
  {
    userid: "M00002",
    username: "standardpackage",
    name: "Standard Package",
    level_id: "2",
    role: "Dinas",
  },
  {
    userid: "M00003",
    username: "businesspackage",
    name: "Business Package",
    level_id: "2",
    role: "Dinas",
  },
  {
    userid: "M00004",
    username: "standardpackage",
    name: "Standard Package",
    level_id: "2",
    role: "Dinas",
  },
];

const TablePage = () => {
  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
              <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                User
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Username
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Role
              </th>
              <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {userData.map((userItem, index) => (
              <tr key={userItem.userid}>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${
                    index === userData.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <h5 className="text-dark dark:text-white">{userItem.name}</h5>
                  <p className="mt-[3px] text-body-sm font-medium">
                    No ID. {userItem.userid}
                  </p>
                </td>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === userData.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {userItem.username}
                  </p>
                </td>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === userData.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p
                    className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium ${
                      userItem.role === "Admin"
                        ? "bg-[#D34053]/[0.08] text-[#D34053]"
                        : "bg-[#219653]/[0.08] text-[#219653]"
                    }`}
                  >
                    {userItem.role}
                  </p>
                </td>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${
                    index === userData.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <div className="flex items-center justify-end space-x-3.5">
                    <button className="hover:text-primary" title="View">
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.99935 6.87492C8.27346 6.87492 6.87435 8.27403 6.87435 9.99992C6.87435 11.7258 8.27346 13.1249 9.99935 13.1249C11.7252 13.1249 13.1243 11.7258 13.1243 9.99992C13.1243 8.27403 11.7252 6.87492 9.99935 6.87492ZM8.12435 9.99992C8.12435 8.96438 8.96382 8.12492 9.99935 8.12492C11.0349 8.12492 11.8743 8.96438 11.8743 9.99992C11.8743 11.0355 11.0349 11.8749 9.99935 11.8749C8.96382 11.8749 8.12435 11.0355 8.12435 9.99992Z"
                        />
                      </svg>
                    </button>
                    <button className="hover:text-primary" title="Delete">
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.59048 1.87502H11.4084C12.4802 1.99208 12.9874 2.35762 13.2615 2.88403C13.4374 3.33745 13.5304 3.61654 13.5545 3.68768C13.7004 4.09111 14.0787 4.36383 14.5076 4.3747C14.5189 4.37498 14.5327 4.37503 14.5828 4.37503H17.0828C17.4279 4.37503 17.7078 4.65485 17.7078 5.00003C17.7078 5.34521 17.4279 5.62503 17.0828 5.62503H2.91602C2.57084 5.62503 2.29102 5.34521 2.29102 5.00003C2.29102 4.65485 2.57084 4.37503 2.91602 4.37503H5.41609C5.92009 4.36383 6.29844 4.09113 6.44437 3.6877C6.56145 3.33747 6.61836 3.16637 6.73734 2.88403C7.01146 2.35762 7.51862 1.99208 8.1047 1.89849C8.25305 1.8748 8.41016 1.8749 8.59048 1.87502Z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePage;
