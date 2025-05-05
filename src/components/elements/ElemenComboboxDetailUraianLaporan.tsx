import { useState, useEffect, useRef } from "react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi2";

interface FilterDokumenPerTahun {
  typeID: number;
  uraian: string;
}

interface ElemenComboboxDetailUraianProps {
  dokumenPerTahun: FilterDokumenPerTahun[];
  selectedUraian: string;
  onSelectUraian: (uraian: string) => void;
}

const ElemenComboboxDetailUraianLaporan = ({
  dokumenPerTahun,
  selectedUraian,
  onSelectUraian,
}: ElemenComboboxDetailUraianProps) => {

  const [isOpen, setIsOpen] = useState(false);
  // const [selectedUraian, setSelectedUraian] = useState("Semua");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawUraian = dokumenPerTahun
  .map((dokumen) => dokumen.uraian)
  .filter((uraian): uraian is string => typeof uraian === "string" && uraian.trim() !== "");

const cleanedUraian = Array.from(new Set(rawUraian)).filter((u) => u.toLowerCase() !== "semua");
const uniqueUraian = ["Semua", ...cleanedUraian.sort((a, b) => a.localeCompare(b))];

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSelect = (item: string) => {
    // setSelectedUraian(item);
    onSelectUraian(item);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block w-48">
      <div
        role="button"
        tabIndex={0}
        onClick={toggleDropdown}
        className="flex w-full cursor-pointer items-center justify-between rounded-[7px] border border-gray-300 p-2 text-[#0C479F]"
      >
        <span>{selectedUraian}</span>
        <span>{isOpen ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}</span>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto">
            {uniqueUraian.map((uraian, index) => (
              <li
                key={index}
                onClick={() => handleSelect(uraian)}
                className={`cursor-pointer px-4 py-2 hover:bg-[#F0F0F0] ${
                  uraian === selectedUraian ? "font-semibold text-[#0C479F]" : ""
                }`}
              >
                {uraian}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ElemenComboboxDetailUraianLaporan;
