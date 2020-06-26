/* eslint-disable no-console */
const core = require('@actions/core');
const GhostAdminApi = require('@tryghost/admin-api');

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
        const value = core.getInput('value');
        const days = core.getInput('days');

        const posts = await api.posts.browse({filter: `tag:${tag}`});
        const updates = [];

        posts.forEach((post) => {
            const differenceInDays = calculateDaysSince(post.published_at);

            console.log(`Post ${post.title} published ${differenceInDays} days ago`);

            // If enough days have passed, we will update the post
            if (differenceInDays > days) {
                post[field] = value;
                updates.push(api.posts.edit(post));
                console.log(`Updating post ${post.title}`);
            } else {
                console.log(`Not updating post ${post.title}, ${days - differenceInDays + 1} days to go`);
            }
        });

        if (updates.length > 1) {
            return Promise.all(updates);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}());
