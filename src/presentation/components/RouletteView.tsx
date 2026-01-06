import React, { useEffect, useState } from 'react';
import { useRouletteStore } from '../../application/store/useRouletteStore';
import { useRouletteLogic } from '../../application/hooks/useRouletteLogic';
import { Button } from './common/Button';
import { FaPlay, FaHistory, FaUndo } from 'react-icons/fa';

export const RouletteView: React.FC = () => {
    const { lists, settings, updateSettings, history, addToHistory, clearHistory, selectList } = useRouletteStore();

    // Get current items
    const selectedList = lists.find(l => l.id === settings.selectedListId);
    const items = selectedList?.items || [];

    const { isSpinning, winner, displayItems, spinKey, spin } = useRouletteLogic({
        items,
        allowDuplicates: settings.allowDuplicatesInSession,
        history,
        soundEnabled: settings.soundEnabled,
        onSpinEnd: addToHistory
    });

    // Animation style
    const ITEM_HEIGHT = 120; // px
    const [offset, setOffset] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(false);

    useEffect(() => {
        if (isSpinning && displayItems.length > 0) {
            // Reset position first (no transition)
            setTransitionEnabled(false);
            setOffset(0);

            // Force reflow/next tick to start animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTransitionEnabled(true);
                    // Move to the last item
                    const finalOffset = (displayItems.length - 1) * ITEM_HEIGHT;
                    setOffset(finalOffset);
                });
            });
        }
    }, [spinKey, isSpinning, displayItems.length]);

    if (!selectedList) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col items-center justify-center text-center text-gray-500">
                <p className="text-xl font-medium mb-2">No List Selected</p>
                <p>Please select or create a list in the management panel to start spinning.</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col items-center justify-center text-center text-gray-500">
                <p className="text-xl font-medium mb-2">List is Empty</p>
                <p>Add some items to "{selectedList.name}" to start spinning!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col relative overflow-hidden">
            {/* Header / Options */}
            <div className="flex justify-between items-center mb-6 z-10 w-full relative">
                <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
                    <div className="relative group max-w-[200px] sm:max-w-xs">
                        <select
                            className="appearance-none bg-transparent text-2xl font-bold text-gray-800 pr-8 cursor-pointer outline-none w-full truncate border-b-2 border-transparent hover:border-orange-200 transition-colors py-1"
                            value={selectedList.id}
                            onChange={(e) => !isSpinning && selectList(e.target.value)}
                            disabled={isSpinning}
                            title="Switch List"
                        >
                            {lists.map(list => (
                                <option key={list.id} value={list.id}>{list.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-orange-500">
                            ▼
                        </div>
                    </div>
                </div>

                <div className="flex items-center shrink-0">
                    <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                            checked={settings.allowDuplicatesInSession}
                            onChange={(e) => updateSettings({ allowDuplicatesInSession: e.target.checked })}
                            disabled={isSpinning}
                        />
                        Allow Dupes
                    </label>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                        className={settings.soundEnabled ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}
                        title={settings.soundEnabled ? "Mute Sound" : "Enable Sound"}
                    >
                        {settings.soundEnabled ? '🔊' : '🔇'}
                    </Button>
                </div>
            </div>

            {/* Roulette Window */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
                {/* Selection Box/Frame */}
                <div
                    className="relative w-full max-w-md bg-gray-50 rounded-xl border-4 border-orange-400 overflow-hidden shadow-inner"
                    style={{ height: ITEM_HEIGHT }}
                >
                    {/* The Strip */}
                    <div
                        className="w-full flex flex-col items-center will-change-transform"
                        style={{
                            transform: `translateY(-${offset}px)`,
                            transition: transitionEnabled ? 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none'
                        }}
                    >
                        {displayItems.length > 0 ? (
                            displayItems.map((item, index) => (
                                <div
                                    key={`${item.id}-${index}`}
                                    className="w-full flex items-center justify-center text-3xl font-bold text-gray-800 bg-white border-b border-gray-100 box-border px-4 text-center"
                                    style={{ height: ITEM_HEIGHT, minHeight: ITEM_HEIGHT }}
                                >
                                    {item.text}
                                </div>
                            ))
                        ) : (
                            // Idle State
                            <div
                                className="w-full flex items-center justify-center text-3xl font-bold text-gray-400"
                                style={{ height: ITEM_HEIGHT }}
                            >
                                Ready?
                            </div>
                        )}
                    </div>

                    {/* Overlay Gradients for 3D effect */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
                    <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-200 to-transparent opacity-50 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-200 to-transparent opacity-50 pointer-events-none"></div>
                </div>

                {/* Indicator Arrow */}
                <div className="text-orange-500 text-4xl -mt-1 z-20">▲</div>

                {/* Winner Announcement (Optional overlay or text below) */}
                {!isSpinning && winner && (
                    <div className="mt-4 text-2xl font-bold text-pink-500 animate-bounce">
                        🎉 {winner.text} 🎉
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-8 flex justify-center gap-4 z-10">
                <Button
                    variant="primary"
                    size="lg"
                    className="w-48 h-16 text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                    onClick={spin}
                    disabled={isSpinning}
                >
                    {isSpinning ? 'Rolling...' : <><FaPlay className="mr-3 text-lg" /> SPIN</>}
                </Button>
            </div>

            {/* Session History (Mini) */}
            <div className="mt-8 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-500 flex items-center gap-2"><FaHistory /> Session History</h4>
                    {history.length > 0 && (
                        <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 font-medium transition-colors">
                            <FaUndo /> Clear
                        </button>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide min-h-[32px]">
                    {history.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No history yet. Spin the wheel!</span>
                    ) : (
                        history.map((h, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm whitespace-nowrap text-gray-700 border border-gray-200">
                                {h.text}
                            </span>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};