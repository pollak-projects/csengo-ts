export interface Session {
  id: string,
  songNames: string[],
  start: string,
  end: string,
  createdAt: string,
  updatedAt: string,
  songs: {
    id: string,
    title: string,
    createdAt: string,
    updatedAt: string,
    songBucketId: string
  }[],
  Vote: {
    id: string,
    userId: string,
    songId: string,
    sessionId: string,
    createdAt: string,
    updatedAt: string
  }[]
}
