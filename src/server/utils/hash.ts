import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  // Angka 10 adalah salt rounds standar yang direkomendasikan (keseimbangan antara keamanan dan performa)
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
