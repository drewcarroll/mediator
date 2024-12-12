export function validatePrompt(prompt: string): boolean {
    if (!prompt) return false;
    if (prompt.trim().length < 2) return false;
    if (prompt.trim().length > 500) return false;
    return true;
}