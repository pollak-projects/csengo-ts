import * as hbs from 'hbs';

export function registerHbsHelpers() {
    hbs.registerHelper('json', function (context) {
        return JSON.stringify(context);
    });
}
