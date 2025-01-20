import { defineStore } from 'pinia';
import serviceLogger from '@/utils/logger.custom.util';

export const useVoteSongStore = defineStore('voteSong', () => {
    const logger = serviceLogger('voteSongStore');
    const url = import.meta.env.VITE_API_URL;

    const hasVotes = ref(false);

    const votes = ref<string[]>(['']);

    async function fetchVotesByUser() {
        try {
            const response = await fetch(`${url}/api/votes/current-user`, {
                credentials: 'include',
            });
            const data = await response.json();
            logger.debug(`Votes: ${JSON.stringify(data)}`);
            logger.debug(`Response status ${response.status}`);
            if (response.status === 404) {
                logger.debug(`Recieved ${response.status} status`);
                hasVotes.value = false;
                votes.value = [''];
                logger.debug(`Has votes: ${hasVotes.value}`);
                return;
            }
            if (!response.ok) {
                throw new Error(`Failed to fetch votes ${data.message}`);
            }
            hasVotes.value = true;
            votes.value = data;
            logger.debug(`Has votes: ${hasVotes.value}`);
        } catch (err) {
            const error = err as Error;
            logger.error(`Error fetching votes: ${error.message}`);
            throw new Error(`Error fetching votes: ${error.message}`);
        }
    }

    async function voteUp(id: string) {
        try {
            // Optional. Only put this to use if you want to limit every users ability to only vote for 1 song in each session.
            // if (hasVotes.value) {
            //   votes.value.map(songId => voteDown(songId))
            // }
            const response = await fetch(`${url}/api/votes?id=${id}`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Failed to vote up ${data.message}`);
            }
            logger.debug(`Has votes ${hasVotes.value}`);
        } catch (err) {
            const error = err as Error;
            logger.error(`Error voting up: ${error.message}`);
            throw new Error(`Error voting up: ${error.message}`);
        }
    }

    async function voteDown(id: string) {
        try {
            const response = await fetch(`${url}/api/votes?id=${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Failed to vote up ${data.message}`);
            }
        } catch (err) {
            const error = err as Error;
            logger.error(`Error voting up: ${error.message}`);
            throw new Error(`Error voting up: ${error.message}`);
        }
    }

    return {
        votes,
        hasVotes,
        fetchVotesByUser,
        voteUp,
        voteDown,
    };
});
