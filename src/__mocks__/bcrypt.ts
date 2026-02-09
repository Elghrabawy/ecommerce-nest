export const genSalt = jest.fn().mockResolvedValue('mock-salt');
export const hash = jest.fn().mockResolvedValue('mock-hash');
export const compare = jest.fn().mockResolvedValue(true);
export const genSaltSync = jest.fn().mockReturnValue('mock-salt');
export const hashSync = jest.fn().mockReturnValue('mock-hash');
export const compareSync = jest.fn().mockReturnValue(true);
export const getRounds = jest.fn().mockReturnValue(10);
