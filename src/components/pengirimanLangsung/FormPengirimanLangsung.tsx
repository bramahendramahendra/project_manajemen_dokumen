import React, { useState } from "react";

const people = [
  { id: 1, name: "DPA" },
  { id: 2, name: "RKA" },
  { id: 3, name: "Anggaran Kas" },
  { id: 4, name: "Laporan Tahunan" },
  { id: 5, name: "Budget Proposal" },
  { id: 6, name: "DPA" },
  { id: 7, name: "RKA" },
  { id: 8, name: "Anggaran Kas" },
  { id: 9, name: "Laporan Tahunan" },
  { id: 10, name: "Budget Proposal" },
  { id: 11, name: "Dokumen Ekstra" },
  { id: 12, name: "Anggaran Baru" },
];

const FormPengirimanLangsung = () => {
  const [searchTerm, setSearchTerm] = useState<string>(""); // Untuk pencarian
  const [showAll, setShowAll] = useState<boolean>(false); // Untuk mengatur apakah semua data ditampilkan

  // Filter dokumen berdasarkan pencarian
  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Tentukan jumlah data yang ditampilkan
  const displayedPeople = showAll
    ? filteredPeople
    : filteredPeople.slice(0, 10);

  return (
    <>
      <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <form>
          <div className="grid grid-cols-12 gap-6 p-6.5">
            {/* Kolom Kiri */}
            <div className="col-span-12 lg:col-span-6">
              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Kepada Dinas
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Dinas..."
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Judul
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Judul..."
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Lampiran (opsional)
                </label>
                <textarea
                  rows={6}
                  placeholder="Isi Lampiran..."
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>

              {/* Tombol Kirim */}
              <div className="mt-6">
                <button
                  type="button"
                  className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] p-[13px] font-medium text-white hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Kirim
                </button>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="col-span-12 lg:col-span-6">
              <div className="mb-4.5">
                <div className="flex items-center justify-between">
                  <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                    Dokumen
                  </label>
                  {/* Input Pencarian */}
                  <input
                    type="text"
                    placeholder="Cari dokumen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[200px] rounded-[7px] bg-transparent px-5 py-2 text-dark ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  />
                </div>
                <fieldset>
                  <div className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
                    {displayedPeople.map((person) => (
                      <div
                        key={person.id}
                        className="relative flex items-start py-4"
                      >
                        <div className="min-w-0 flex-1 text-[12px]">
                          <label
                            htmlFor={`person-${person.id}`}
                            className="select-none font-medium text-gray-500"
                          >
                            {person.name}
                          </label>
                        </div>
                        <div className="ml-3 flex h-6 items-center">
                          <input
                            id={`person-${person.id}`}
                            name={`person-${person.id}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </div>
                      </div>
                    ))}
                    {filteredPeople.length > 10 && !showAll && (
                      <div className="py-4 text-center">
                        <button
                          onClick={() => setShowAll(true)}
                          className="text-[#0C479F] hover:underline"
                        >
                          Lihat Semua Dokumen
                        </button>
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FormPengirimanLangsung;
