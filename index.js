/* eslint-disable no-console */
const core = require('@actions/core');
const GhostAdminApi = require('@tryghost/admin-api');

// Convert boolean strings to true booleans
const getValue = () => {
    let value = core.getInput('value');

    if (value === 'true') {
        value = true;
    } else if (value === 'false') {
        value = false;
    }

    return value;
};

const calculateDaysSince = (date) => {
    const now = new Date();
    const then = new Date(date);

    return Math.round((now - then) / (1000 * 60 * 60 * 24));
};

(async function main() {
    try {
        const api = new GhostAdminApi({
            url: core.getInput('api-url'),
            key: core.getInput('api-key'),
            version: 'canary'
        });

        const tag = core.getInput('tag');
        const field = core.getInput('field');
        const value = getValue();
        const days = core.getInput('days');

        const posts = await api.posts.browse({filter: `tag:${tag}`});

        await Promise.all(posts.map(async (post) => {
            const differenceInDays = calculateDaysSince(post.published_at);

            console.log(`Post "${post.title}" published ${differenceInDays} days ago`);

            // If enough days have passed, we will update the post
            if (differenceInDays > days) {
                post[field] = value;
                console.log(`Updating post "${post.title}"`);
                await api.posts.edit(post);
            } else {
                console.log(`Not updating post "${post.title}", ${days - differenceInDays + 1} days to go`);
            }
        }));
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}());
