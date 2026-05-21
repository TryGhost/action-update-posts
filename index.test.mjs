import {describe, expect, it, vi} from 'vitest';
import {
    calculateDaysSince,
    getDays,
    getValue,
    run,
    updatePosts
} from './index.js';

const createCore = inputs => ({
    getInput: vi.fn(name => inputs[name])
});

describe('getValue', () => {
    it('converts boolean input strings to booleans', () => {
        expect(getValue(createCore({value: 'true'}))).toBe(true);
        expect(getValue(createCore({value: 'false'}))).toBe(false);
    });

    it('keeps non-boolean input strings unchanged', () => {
        expect(getValue(createCore({value: 'public'}))).toBe('public');
    });
});

describe('calculateDaysSince', () => {
    it('rounds the difference between the supplied date and now', () => {
        const now = new Date('2026-02-01T12:00:00.000Z');

        expect(calculateDaysSince('2026-01-29T00:00:00.000Z', now)).toBe(4);
    });
});

describe('getDays', () => {
    it('converts days input to a number', () => {
        expect(getDays(createCore({days: '30'}))).toBe(30);
        expect(getDays(createCore({days: ' 30 '}))).toBe(30);
    });

    it('rejects invalid days input', () => {
        expect(() => getDays(createCore({days: ''}))).toThrow('Invalid "days" input: ""');
        expect(() => getDays(createCore({days: '   '}))).toThrow('Invalid "days" input: "   "');
        expect(() => getDays(createCore({days: '7.5'}))).toThrow('Invalid "days" input: "7.5"');
        expect(() => getDays(createCore({days: '-1'}))).toThrow('Invalid "days" input: "-1"');
        expect(() => getDays(createCore({days: 'tomorrow'}))).toThrow('Invalid "days" input: "tomorrow"');
    });
});

describe('updatePosts', () => {
    it('edits posts older than the configured number of days', async () => {
        const oldPost = {
            id: 'old-post',
            title: 'Old post',
            published_at: '2026-01-01T00:00:00.000Z'
        };
        const freshPost = {
            id: 'fresh-post',
            title: 'Fresh post',
            published_at: '2026-01-28T00:00:00.000Z'
        };
        const api = {
            posts: {
                browse: vi.fn().mockResolvedValue([oldPost, freshPost]),
                edit: vi.fn().mockResolvedValue()
            }
        };
        const logger = {log: vi.fn()};

        await updatePosts({
            api,
            tag: 'hash-early-access',
            field: 'visibility',
            value: 'public',
            days: 30,
            now: new Date('2026-02-01T00:00:00.000Z'),
            logger
        });

        expect(api.posts.browse).toHaveBeenCalledWith({filter: 'tag:hash-early-access'});
        expect(api.posts.edit).toHaveBeenCalledOnce();
        expect(api.posts.edit).toHaveBeenCalledWith({
            ...oldPost,
            visibility: 'public'
        });
        expect(freshPost).not.toHaveProperty('visibility');
    });

    it('logs how many days remain when a post is too fresh to update', async () => {
        const api = {
            posts: {
                browse: vi.fn().mockResolvedValue([{
                    title: 'Fresh post',
                    published_at: '2026-01-30T00:00:00.000Z'
                }]),
                edit: vi.fn()
            }
        };
        const logger = {log: vi.fn()};

        await updatePosts({
            api,
            tag: 'hash-news',
            field: 'featured',
            value: false,
            days: 7,
            now: new Date('2026-02-01T00:00:00.000Z'),
            logger
        });

        expect(api.posts.edit).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith('Not updating post "Fresh post", 6 days to go');
    });
});

describe('run', () => {
    it('reads action inputs and updates matching posts through the Ghost Admin API', async () => {
        const post = {
            title: 'Old featured post',
            published_at: '2026-01-01T00:00:00.000Z'
        };
        const api = {
            posts: {
                browse: vi.fn().mockResolvedValue([post]),
                edit: vi.fn().mockResolvedValue()
            }
        };
        const core = createCore({
            'api-url': 'https://example.com',
            'api-key': 'key',
            tag: 'hash-featured',
            field: 'featured',
            value: 'false',
            days: '0'
        });
        const logger = {log: vi.fn()};
        const GhostAdminApiClass = vi.fn(function (config) {
            expect(config).toEqual({
                url: 'https://example.com',
                key: 'key',
                version: 'canary'
            });

            return api;
        });

        await run({coreModule: core, GhostAdminApiClass, logger});

        expect(GhostAdminApiClass).toHaveBeenCalledOnce();
        expect(api.posts.edit).toHaveBeenCalledWith({
            ...post,
            featured: false
        });
    });
});
