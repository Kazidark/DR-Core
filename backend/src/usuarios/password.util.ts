import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';

import {
  promisify,
} from 'node:util';


const scrypt =
  promisify(
    scryptCallback,
  );


export async function generarPasswordHash(
  password: string,
) {
  const salt =
    randomBytes(16)
      .toString('hex');


  const derivedKey =
    (await scrypt(
      password,
      salt,
      64,
    )) as Buffer;


  return {
    passwordHash:
      derivedKey.toString(
        'hex',
      ),

    salt,
  };
}


export async function validarPassword(
  password: string,
  passwordHash: string,
  salt: string,
) {
  const derivedKey =
    (await scrypt(
      password,
      salt,
      64,
    )) as Buffer;


  const storedHash =
    Buffer.from(
      passwordHash,
      'hex',
    );


  if (
    derivedKey.length !==
    storedHash.length
  ) {
    return false;
  }


  return timingSafeEqual(
    derivedKey,
    storedHash,
  );
}