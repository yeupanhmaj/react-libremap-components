import { readFileSync, writeFileSync } from 'node:fs';
import glob from 'glob';
import { Converter } from 'showdown';

const options = {};

function getComponentNameFromPath(path) {
	let tmp = path.split('/');
	tmp = tmp[tmp.length - 1];
	tmp = tmp.split('.doc');
	return tmp[0];
}

const converter = new Converter();

glob('src/components/**/*.doc.*.md', options, (_er, files) => {
	console.log(files);

	// eslint-disable-next-line prefer-const
	let i = 0,
		len = files.length;
	for (; i < len; i++) {
		const language = files[i].slice(-5, -3);
		const rawdata = readFileSync(files[i]);
		const html = converter.makeHtml(`${rawdata}`);
		writeFileSync(`public/catalogue/${getComponentNameFromPath(files[i])}.${language}.html`, html);
	}
});
