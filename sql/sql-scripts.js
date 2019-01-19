const musicJSON = require('../music.json');

const SQL = () => {};

SQL.createUsersTable = () => {
    return `
    create table users
    (
        id text not null,
        following_id text not null,
        modified_date timestamp without timezone default CURRENT_TIMESTAMP,
        UNIQUE(id, following_id)
    );
    `.trim();
};

SQL.createUserMusicTable = () => {
    return `
    create table user_music
    (
        user_id integer not null,
        music_id integer not null,
        modified_date timestamp without timezone default CURRENT_TIMESTAMP,
        UNIQUE(user_id, music_id)
    );
    `.trim();
};

SQL.createMusicTable = () => {
    return `
    create table music
    (
        id integer primary key,
        key text,
        tags text
    )
    `.trim();
};

SQL.populateMusic = () => {
    let insertString = '';

    for(let keys = Object.keys(musicJSON), i = 0, end = keys.length; i < end; i++) {
        const key = keys[i];
        let value = musicJSON[key];

        insertString += '("' + key +'"';
        insertString += ','
        insertString += '"' + value.toString() + '")';

        if (i < keys.length - 1) {
            insertString += ','
        }
    };

    const query = `
        INSERT INTO music
        (key, tags)
        VALUES`
        + insertString
        +
        `;`
        .trim();

    return query;
};

module.exports = SQL;
