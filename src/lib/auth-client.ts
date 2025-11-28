import { createAuthClient } from "better-auth/svelte"
export const authClient = createAuthClient({
    baseURL: "http://localhost:5173" // We should probably use env var here but for now hardcode dev
})
