import { strictEqual } from 'assert';
import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import https from 'https';
import { createClient } from 'contentful';
import type { Asset } from 'contentful';
import slugify from 'slugify';
import emojiRegex from 'emoji-regex';

interface Entry {
  title: string;
  date: string;
  description: string;
  tags: string[];
  file: Asset;
}

interface Image {
  id: string;
  slug: string;
  title: string;
  image: string;
  alt: string;
  date: string;
  tags: string[];
  description: string;
}

require('dotenv').config();

const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

strictEqual(typeof CONTENTFUL_SPACE_ID, 'string');
strictEqual(typeof CONTENTFUL_ACCESS_TOKEN, 'string');

const INSTA_DIR = path.resolve(__dirname, '..', 'content', 'insta');

const indexContent = `---
title: 'Insta'
---
`;

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_ACCESS_TOKEN,
});

const createSlug = (dateString: string, title: string): string => {
  const [date, time] = dateString.split(/[T+.]/);

  return slugify(`${date} ${time} ${title}`, {
    lower: true,
    strict: true,
    locale: 'en',
  });
};

const fixImageUrl = (url: string): string => {
  const prefix = url.startsWith('//') ? 'https:' : '';

  return `${prefix}${url}`;
};

const regex = emojiRegex();
const isEmojiOnly = (str: string): boolean => {
  const { length } = str
    .split(regex)
    .map((s) => s.trim())
    .filter(Boolean);

  return length === 0;
};

const writeMarkdown = async (item: Image): Promise<void> => {
  const description = isEmojiOnly(item.description)
    ? `{{< bigger "${item.description}" >}}`
    : item.description;
  const content = `---
title: '${item.title}'
date: '${item.date}'
alt: '${item.alt}'
tags:
  - ${item.tags.map((tag) => `'${tag}'`).join('\n  - ')}
type: 'insta'
---

${description}
`;
  const filename = path.join(INSTA_DIR, item.slug, 'index.md');

  await fs.writeFile(filename, content, 'utf8');
};

const downloadImage = (item: Image): Promise<void> =>
  new Promise((resolve, reject) => {
    const target = path.join(INSTA_DIR, item.slug, 'image.jpg');
    const req = https.get(item.image, (response) => {
      response.pipe(createWriteStream(target).once('error', reject));
    });

    req.once('error', reject);
    req.once('finish', resolve);
  });

(async () => {
  try {
    console.log('> Removing ./content/insta...');
    await fs.rm(INSTA_DIR, { force: true, recursive: true });
    console.log('> Creating ./content/insta...');
    await fs.mkdir(INSTA_DIR, { recursive: true });

    console.log('> Writing _index.md...');
    await fs.writeFile(path.join(INSTA_DIR, '_index.md'), indexContent, 'utf8');

    console.log('> Downloading data...');
    const { items: data } = await client.getEntries<Entry>();
    const items: Image[] = data.map(({ sys, fields: { file, ...fields } }) => ({
      id: sys.id,
      slug: createSlug(fields.date, fields.title),
      alt: file.fields.description,
      image: fixImageUrl(file.fields.file.url),
      ...fields,
    }));

    console.log('> Creating ./content/insta/<image>...');
    await Promise.all(
      items.map(({ slug }) => fs.mkdir(path.join(INSTA_DIR, slug)))
    );

    const promises = items.map((item) => [
      writeMarkdown(item),
      downloadImage(item),
    ]);

    console.log('> Writing data...');
    await Promise.all(promises.flat());
    console.log('> Done!');
  } catch (err) {
    console.log('ERR', err);
  }
})();
