import { defineStore } from 'pinia';
import serviceLogger from '@/utils/logger.custom.util';
import { computed, ref } from 'vue';

export const useSongListStore = defineStore('songList', () => {
    const logger = serviceLogger('songListStore');
    const url = import.meta.env.VITE_API_URL;
    const songs = ref([
        {
            id: '',
            title: 'nincs adat',
            uploadedBy: {
              kreta: {
                name: 'nincs adat',
              },
            },
            createdAt: 'nincs adat',
            updatedAt: '',
        },
    ]);

    const searchQuery = ref('');

    const filteredSongs = computed(() => {
        return searchQuery.value ? songs.value.filter((item) => item.title.toLowerCase().includes(searchQuery.value.toLowerCase())) : songs.value;
    });

    async function fetchAllSongs() {
        try {
            const response = await fetch(`${url}/api/songs`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 404) {
                    songs.value = [
                        {
                            id: '',
                            title: 'nincs adat',
                            uploadedBy: {
                              kreta: {
                                name: 'nincs adat',
                              },
                            },
                            createdAt: 'nincs adat',
                            updatedAt: '',
                        },
                    ];
                    return;
                }
                logger.error(`Error fetching songs: ${data.message}`);
                throw new Error(`Error fetching songs: ${data.message}`);
            }
            songs.value = data;
        } catch (error) {
            const e = error as Error;
            logger.error(`Error fetching songs: ${e.message}`);
            throw new Error(`Error fetching songs: ${e.message}`);
        }
    }

    return {
        songs,
        fetchAllSongs,
        searchQuery,
        filteredSongs,
    };
});
