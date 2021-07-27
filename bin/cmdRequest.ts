const http = require('http');

export default (data: string) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 28230,
      path: '/gee',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = http.request(options);
    req.write(data);

    req.on('error', reject);
    req.on('end', resolve);

    req.end();
  });
};
