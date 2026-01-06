import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { ListManager } from '../components/ListManager/ListManager';
import { RouletteView } from '../components/RouletteView';
import { FaList, FaGamepad } from 'react-icons/fa';

export const MainPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'roulette' | 'list'>('roulette');

    return (
        <MainLayout>
            {/* Desktop Layout: Side by Side */}
            <div className="hidden md:flex gap-6 h-[calc(100vh-150px)]">
                <div className="flex-[2]">
                    <RouletteView />
                </div>
                <div className="flex-1 min-w-[350px]">
                    <ListManager />
                </div>
            </div>

            {/* Mobile Layout: Tabs */}
            <div className="md:hidden h-[calc(100vh-140px)] flex flex-col">
                <div className="flex-1 min-h-0 mb-4">
                    {activeTab === 'roulette' ? <RouletteView /> : <ListManager />}
                </div>
                
                <div className="flex bg-white rounded-lg shadow p-1 shrink-0">
                    <button 
                        className={`flex-1 py-3 rounded-md flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'roulette' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('roulette')}
                    >
                        <FaGamepad /> 룰렛
                    </button>
                    <button 
                        className={`flex-1 py-3 rounded-md flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('list')}
                    >
                        <FaList /> 리스트 관리
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};
