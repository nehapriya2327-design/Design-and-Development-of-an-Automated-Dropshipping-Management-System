// lib/hash.ts
export const hashPassword = (password: string): string => {
    return Buffer.from(password).toString('base64');
};

export const comparePassword = (input: string, hashed: string): boolean => {
    return hashPassword(input) === hashed;
};
