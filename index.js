import * as core from '@actions/core';
import GhostAdminApi from '@tryghost/admin-api';
import { fileURLToPath } from 'node:url';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

// Convert boolean strings to true booleans
export const getValue = (coreModule = core) => {
    let value = coreModule.getInput('value');

    if (value === 'true') {
        value = true;
    } else if (value === 'false') {
        value = false;
    }

    return value;
};

export const calculateDaysSince = (date, now = new Date()) => {
    const then = new Date(date);

    return Math.round((now - then) / DAY_IN_MS);
};

export const getDays = (coreModule = core) => {
    const daysInput = coreModule.getInput('days');
    const normalizedDaysInput = String(daysInput).trim();

    if (!/^\d+$/.test(normalizedDaysInput)) {
        throw new Error(`Invalid "days" input: "${daysInput}". Expected a non-negative integer.`);
    }

    return Number.parseInt(normalizedDaysInput, 10);
};

export const updatePosts = async ({
    api,
    tag,
    field,
    value,
    days,
    now = new Date(),
    logger = console,
}) => {
    const posts = await api.posts.browse({ filter: `tag:${tag}` });

    await Promise.all(
        posts.map(async (post) => {
            const differenceInDays = calculateDaysSince(post.published_at, now);

            logger.log(`Post "${post.title}" published ${differenceInDays} days ago`);

            // If enough days have passed, we will update the post
            if (differenceInDays > days) {
                post[field] = value;
                logger.log(`Updating post "${post.title}"`);
                await api.posts.edit(post);

                return;
            }

            logger.log(
                `Not updating post "${post.title}", ${days - differenceInDays + 1} days to go`,
            );
        }),
    );
};

export const run = async ({
    coreModule = core,
    GhostAdminApiClass = GhostAdminApi,
    logger = console,
} = {}) => {
    const api = new GhostAdminApiClass({
        url: coreModule.getInput('api-url'),
        key: coreModule.getInput('api-key'),
        version: 'canary',
    });

    await updatePosts({
        api,
        tag: coreModule.getInput('tag'),
        field: coreModule.getInput('field'),
        value: getValue(coreModule),
        days: getDays(coreModule),
        logger,
    });
};

export const main = async () => {
    try {
        await run();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
