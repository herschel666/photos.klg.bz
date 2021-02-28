import { createHash as hash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import globby from 'globby';

const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const createHash = (s: string): string =>
  hash('md5').update(s).digest('hex').slice(0, 8);

(async () => {
  const files = await globby(path.join(DIST_DIR, '*.{js,css}'));
  const hashes = await Promise.all(
    files.map((file) =>
      fs
        .readFile(file, 'utf8')
        .then((content) => ({ file, hash: createHash(content) }))
    )
  );

  console.log('> Hashing names of %s files...', hashes.length);
  Promise.all(
    hashes.map(({ file, hash }) =>
      fs.rename(file, file.replace(/^(.+\.)(js|css)$/, `$1${hash}.$2`))
    )
  );
})();
