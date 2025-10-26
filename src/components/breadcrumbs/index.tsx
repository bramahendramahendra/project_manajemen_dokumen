import Link from "next/link";

interface BreadcrumbProps {
  breadcrumbs: { name: string; href?: string }[];
}

const Breadcrumb = ({ breadcrumbs }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
        {breadcrumbs[breadcrumbs.length - 1].name}
      </h2>

      <nav className="relative z-10">
        <ol className="x2sm:overflow-visible flex items-center gap-2 overflow-x-auto whitespace-nowrap rounded-lg bg-white/80 backdrop-blur-sm px-4 py-2 shadow-sm border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className="flex items-center">
              {breadcrumb.href ? (
                <>
                  <Link 
                    className="font-medium text-gray-600 hover:text-primary transition-colors duration-200 dark:text-gray-300 dark:hover:text-primary-light" 
                    href={breadcrumb.href}
                  >
                    {breadcrumb.name}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
                  )}
                </>
              ) : (
                <span className="font-semibold text-primary dark:text-primary-light">
                  {breadcrumb.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;

// import Link from "next/link";

// interface BreadcrumbProps {
//   pageName: string;
// }

// const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
//   return (
//     <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//       <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
//         {pageName}
//       </h2>

//       <nav>
//         <ol className="flex items-center gap-2">
//           <li>
//             <Link className="font-medium" href="/">
//               Dashboard /
//             </Link>
//           </li>
//           <li className="font-medium text-primary">{pageName}</li>
//         </ol>
//       </nav>
//     </div>
//   );
// };

// export default Breadcrumb;
