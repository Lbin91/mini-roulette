import { RouletteList } from '../../domain/types';

export const exportListToCSV = (list: RouletteList) => {
    const rows = list.items.map(item => `"${item.text.replace(/"/g, '""')}"`);
    const csvContent = rows.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${list.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const parseCSV = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                resolve([]);
                return;
            }
            // Split by new line
            const lines = text.split(/\r?\n/);
            const items = lines
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    // Remove wrapping quotes if present
                    if (line.startsWith('"') && line.endsWith('"')) {
                        return line.slice(1, -1).replace(/""/g, '"');
                    }
                    return line;
                });
            resolve(items);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};
