import { AppData } from '../../domain/types';

export const exportDataToJSON = (data: AppData, fileName: string = 'mini-roulette-backup') => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const parseJSON = async (file: File): Promise<AppData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) {
                    reject(new Error('파일이 비어있습니다'));
                    return;
                }
                const data = JSON.parse(text);

                // Basic validation
                if (!data || typeof data !== 'object') {
                    reject(new Error('잘못된 JSON 형식'));
                    return;
                }

                if (!Array.isArray(data.lists) || !data.settings) {
                    reject(new Error('잘못된 데이터 구조: 리스트 또는 설정이 누락되었습니다'));
                    return;
                }

                resolve(data as AppData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};
