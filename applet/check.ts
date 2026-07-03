import fs from 'fs';
['/root', '/home', '/', '/app'].forEach(dir => {
  try {
    console.log(`Contents of ${dir}:`);
    console.log(fs.readdirSync(dir).join(', '));
  } catch(e) {}
});
