import http from 'node:http';
import {spawn} from 'node:child_process';
import {describe, expect, it} from 'vitest';

const adminApiKey = `${'a'.repeat(24)}:${'b'.repeat(64)}`;

const readRequestBody = request => new Promise((resolve, reject) => {
    let body = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
        body += chunk;
    });
    request.on('end', () => {
        try {
            resolve(body ? JSON.parse(body) : {});
        } catch (error) {
            reject(error);
        }
    });
    request.on('error', reject);
});

const listen = server => new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
        server.off('error', reject);
        resolve(server.address());
    });
});

const close = server => new Promise((resolve, reject) => {
    server.close((error) => {
        if (error) {
            reject(error);
            return;
        }

        resolve();
    });
});

const runAction = env => new Promise((resolve) => {
    const child = spawn(process.execPath, ['dist/index.js'], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            ...env
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
        stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
        stderr += chunk;
    });
    child.on('close', (code) => {
        resolve({code, stdout, stderr});
    });
});

describe('GitHub Action boundary', () => {
    it('runs the bundled action with GitHub Action inputs and updates stale Ghost posts', async () => {
        const requests = [];
        const oldPost = {
            id: 'old-post',
            title: 'Old featured post',
            published_at: '2020-01-01T00:00:00.000Z'
        };
        const freshPost = {
            id: 'fresh-post',
            title: 'Fresh featured post',
            published_at: new Date().toISOString()
        };
        const server = http.createServer(async (request, response) => {
            const requestUrl = new URL(request.url, 'http://127.0.0.1');

            if (request.method === 'GET' && requestUrl.pathname === '/ghost/api/canary/admin/posts/') {
                requests.push({
                    method: request.method,
                    pathname: requestUrl.pathname,
                    searchParams: Object.fromEntries(requestUrl.searchParams),
                    authorization: request.headers.authorization,
                    acceptVersion: request.headers['accept-version']
                });
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({
                    posts: [oldPost, freshPost]
                }));
                return;
            }

            if (request.method === 'PUT' && requestUrl.pathname === '/ghost/api/canary/admin/posts/old-post/') {
                const body = await readRequestBody(request);
                requests.push({
                    method: request.method,
                    pathname: requestUrl.pathname,
                    body,
                    authorization: request.headers.authorization,
                    acceptVersion: request.headers['accept-version']
                });
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify(body));
                return;
            }

            response.statusCode = 404;
            response.end();
        });

        const {port} = await listen(server);

        try {
            const result = await runAction({
                'INPUT_API-URL': `http://127.0.0.1:${port}`,
                'INPUT_API-KEY': adminApiKey,
                INPUT_TAG: 'hash-featured',
                INPUT_FIELD: 'featured',
                INPUT_VALUE: 'false',
                INPUT_DAYS: '30'
            });

            expect(result).toMatchObject({
                code: 0
            });
            expect(requests).toHaveLength(2);
            expect(requests[0]).toMatchObject({
                method: 'GET',
                pathname: '/ghost/api/canary/admin/posts/',
                searchParams: {
                    filter: 'tag:hash-featured'
                },
                acceptVersion: 'v6.0'
            });
            expect(requests[0].authorization).toMatch(/^Ghost /);
            expect(requests[1]).toMatchObject({
                method: 'PUT',
                pathname: '/ghost/api/canary/admin/posts/old-post/',
                body: {
                    posts: [{
                        title: 'Old featured post',
                        published_at: '2020-01-01T00:00:00.000Z',
                        featured: false
                    }]
                },
                acceptVersion: 'v6.0'
            });
            expect(requests[1].authorization).toMatch(/^Ghost /);
        } finally {
            await close(server);
        }
    });
});
