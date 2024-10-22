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

      <nav>
  <ol className="flex items-center gap-2 overflow-x-auto whitespace-nowrap x2sm:overflow-visible">
    {breadcrumbs.map((breadcrumb, index) => (
      <li key={index} className="flex items-center">
        {breadcrumb.href ? (
          <>
            <Link className="font-medium" href={breadcrumb.href}>
              {breadcrumb.name}
            </Link>
            {index < breadcrumbs.length - 1 && (
              <span className="mx-1">/</span>
            )}
          </>
        ) : (
          <span className="font-medium text-primary">{breadcrumb.name}</span>
        )}
      </li>
    ))}
  </ol>
</nav>
    </div>
  );
};

export default Breadcrumb;