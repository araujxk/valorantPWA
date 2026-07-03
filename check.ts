import fs from 'fs';
['/root', '/home', '/', '/app', '/workspace'].forEach(dir => {
  try {
    console.log(`Contents of ${dir}:`);
    console.log(fs.readdirSync(dir).join(', '));
  } catch(e) {}
});
