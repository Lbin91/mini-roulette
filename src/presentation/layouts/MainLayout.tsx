import React from 'react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-orange-500 tracking-tight flex items-center gap-2">
            미니 룰렛
          </h1>
        </header>
        <main className="flex-1 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};
