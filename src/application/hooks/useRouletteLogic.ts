import { useState, useRef, useCallback, useEffect } from 'react';
import { RouletteItem } from '../../domain/types';
import { soundManager } from '../../infrastructure/sound/soundManager';

interface UseRouletteLogicProps {
    items: RouletteItem[];
    allowDuplicates: boolean;
    history: RouletteItem[];
    soundEnabled: boolean;
    onSpinEnd: (item: RouletteItem) => void;
}

export const useRouletteLogic = ({
    items,
    allowDuplicates,
    history,
    soundEnabled,
    onSpinEnd
}: UseRouletteLogicProps) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<RouletteItem | null>(null);
    const [displayItems, setDisplayItems] = useState<RouletteItem[]>([]);
    
    // We need a key to force re-render/reset of animation in the view
    const [spinKey, setSpinKey] = useState(0);
    
    const timerRef = useRef<number | null>(null);
    const beepIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
        };
    }, []);

    const spin = useCallback(() => {
        if (isSpinning || items.length === 0) return;

        // 1. Filter candidates
        let candidates = items;
        if (!allowDuplicates) {
            const historyIds = new Set(history.map(h => h.id));
            candidates = items.filter(item => !historyIds.has(item.id));
        }

        if (candidates.length === 0) {
            alert('No more items to select! Reset history or allow duplicates.');
            return;
        }

        // 2. Select Winner
        const winnerIndex = Math.floor(Math.random() * candidates.length);
        const selectedWinner = candidates[winnerIndex];

        // 3. Prepare Animation Sequence
        // We want a strip of items. 
        // Start with a few items (maybe current one if exists, or random)
        // Then a long sequence of random items.
        // End with the winner.
        const sequenceLength = 50; 
        const sequence: RouletteItem[] = [];
        
        for (let i = 0; i < sequenceLength - 1; i++) {
             sequence.push(items[Math.floor(Math.random() * items.length)]);
        }
        sequence.push(selectedWinner); // Last one is winner
        
        setDisplayItems(sequence);
        setWinner(null); // Clear previous winner display if any
        setIsSpinning(true);
        setSpinKey(k => k + 1);

        // 4. Handle Timing & Sound
        const duration = 4000; // 4s animation
        
        if (soundEnabled) {
            // Play beep. Frequency increases?
            // Simple interval for now.
            let count = 0;
            const maxBeeps = 20;
            if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
            
            beepIntervalRef.current = window.setInterval(() => {
                count++;
                soundManager.playBeep();
                if (count > maxBeeps && beepIntervalRef.current) clearInterval(beepIntervalRef.current);
            }, duration / maxBeeps);
        }

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            setIsSpinning(false);
            setWinner(selectedWinner);
            if (soundEnabled) soundManager.playFinish();
            onSpinEnd(selectedWinner);
        }, duration);
        
    }, [items, allowDuplicates, history, soundEnabled, isSpinning, onSpinEnd]);

    return {
        isSpinning,
        winner,
        displayItems,
        spinKey,
        spin
    };
};
