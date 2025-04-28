"use client";
import React, { useState, useEffect } from "react";
import { MessageList } from "./messageList";
import { MessageDetail } from "./messageDetails";
import Pagination from "../pagination/Pagination";
import SearchBar from "../search/SearchBar";

const dummyMessages = [
  {
    id: 1,
    sender: "John Doe",
    date: "2024-06-17",
    subject: "Meeting Reminder",
    content: "Don’t forget about the meeting tomorrow at 10 AM.",
  },
  {
    id: 2,
    sender: "Jane Smith",
    date: "2024-06-18",
    subject: "Project Update",
    content: "The project is progressing well and will be delivered on time.",
  },
  {
    id: 3,
    sender: "Mark Lee",
    date: "2024-06-19",
    subject: "Invoice Due",
    content: "Please find the attached invoice. Payment is due by Friday.",
  },
  {
    id: 4,
    sender: "Emily Clark",
    date: "2024-06-20",
    subject: "Team Outing",
    content: "We’re planning a team outing next month. Details to follow soon.",
  },
  {
    id: 5,
    sender: "Michael Brown",
    date: "2024-06-21",
    subject: "Weekly Report",
    content: "Please submit your weekly report by end of day Friday.",
  },
  {
    id: 6,
    sender: "Sarah Johnson",
    date: "2024-06-22",
    subject: "HR Announcement",
    content: "Please review the updated company policies in the HR portal.",
  },
  {
    id: 7,
    sender: "David Kim",
    date: "2024-06-23",
    subject: "Conference Invitation",
    content: "You’re invited to speak at the upcoming tech conference.",
  },
  {
    id: 8,
    sender: "Olivia White",
    date: "2024-06-24",
    subject: "Task Completion",
    content: "The assigned tasks have been completed ahead of schedule.",
  },
  {
    id: 9,
    sender: "Chris Wilson",
    date: "2024-06-25",
    subject: "Follow-Up Required",
    content: "We need your input on the pending project decisions.",
  },
  {
    id: 10,
    sender: "Sophia Martinez",
    date: "2024-06-26",
    subject: "Vacation Approval",
    content: "Your vacation request has been approved for the selected dates.",
  },
];

const MainPage = () => {
  const [activeMessage, setActiveMessage] = useState(dummyMessages[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMessages, setFilteredMessages] = useState(dummyMessages);

  // Effect untuk memfilter pesan berdasarkan searchTerm
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMessages(dummyMessages);
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const filtered = dummyMessages.filter(
        (message) =>
          message.sender.toLowerCase().includes(lowercaseSearchTerm) ||
          message.content.toLowerCase().includes(lowercaseSearchTerm)
      );
      setFilteredMessages(filtered);
      
      // Jika hasil pencarian tidak kosong dan pesan aktif tidak ada dalam hasil
      if (filtered.length > 0 && !filtered.includes(activeMessage)) {
        setActiveMessage(filtered[0]);
      }
    }
    // Reset ke halaman pertama ketika melakukan pencarian
    setCurrentPage(1);
  }, [searchTerm, activeMessage]);

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  // Pesan yang ditampilkan berdasarkan halaman dan hasil pencarian
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white pr-0 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex justify-between items-center px-7.5 pt-7.5 mb-4">
          <h4 className="font-medium text-dark dark:text-white"></h4>
          
          {/* Komponen Pencarian */}
          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm}
            placeholder="Cari pengirim atau isi..."
          />
        </div>
        
        <div className="grid grid-cols-12 border-t border-gray-200">
          {/* Daftar Pesan */}
          <div className="col-span-12 border-r border-gray-200 xl:col-span-2">
            <MessageList
              messages={paginatedMessages}
              activeMessage={activeMessage}
              onMessageSelect={setActiveMessage}
              isSearching={searchTerm.length > 0}
              noResults={filteredMessages.length === 0}
              searchTerm={searchTerm}
            />
          </div>

          {/* Detail Pesan */}
          <div className="col-span-12 xl:col-span-6">
            {activeMessage && filteredMessages.length > 0 ? (
              <MessageDetail message={activeMessage} />
            ) : filteredMessages.length === 0 && searchTerm ? (
              <div className="flex h-full items-center justify-center p-8 text-gray-500">
                Pilih pesan untuk melihat detailnya
              </div>
            ) : (
              <MessageDetail message={activeMessage} />
            )}
          </div>
        </div>
        
        {filteredMessages.length > 0 && (
          <div className="my-4 border-t pb-4 pl-7.5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;